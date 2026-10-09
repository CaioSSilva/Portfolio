import { DestroyRef, inject, Injectable, InjectionToken, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, timer } from 'rxjs';
import { LanguageService } from './language';
import {
  AgentUnsupportedReason,
  SpeechRecognitionConstructor,
  SpeechRecognitionLike,
  SpeechRecognitionWindow,
  SpeechRecognitionEventLike,
  SpeechRecognitionErrorEventLike,
} from '../models/agent-mode';

function isMobileDevice(): boolean {
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return true;
  if (typeof window.matchMedia !== 'function') return false;
  const hasCoarseOnly =
    window.matchMedia('(pointer: coarse)').matches &&
    !window.matchMedia('(pointer: fine)').matches;
  return hasCoarseOnly;
}

function resolveUnsupportedReason(): AgentUnsupportedReason {
  if (typeof window === 'undefined') return 'browser';
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return 'insecure-context';
  if (isMobileDevice()) return 'mobile';
  const win = window as SpeechRecognitionWindow;
  const hasApi = !!(win.SpeechRecognition ?? win.webkitSpeechRecognition);
  return hasApi ? null : 'browser';
}

export const SPEECH_RECOGNITION_UNSUPPORTED_REASON =
  new InjectionToken<AgentUnsupportedReason>('SPEECH_RECOGNITION_UNSUPPORTED_REASON', {
    providedIn: 'root',
    factory: () => resolveUnsupportedReason(),
  });

export const SPEECH_RECOGNITION_FACTORY = new InjectionToken<
  (() => SpeechRecognitionLike) | null
>('SPEECH_RECOGNITION_FACTORY', {
  providedIn: 'root',
  factory: () => {
    if (resolveUnsupportedReason() !== null) return null;
    const win = window as SpeechRecognitionWindow;
    const Constructor = (win.SpeechRecognition ?? win.webkitSpeechRecognition) as SpeechRecognitionConstructor;
    return () => new Constructor();
  },
});

const MAX_RESTARTS = 5;
const BASE_BACKOFF_MS = 1000;
const NON_RECOVERABLE_ERRORS = ['not-allowed', 'service-not-allowed'];

@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService {
  private readonly lang = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly factory = inject(SPEECH_RECOGNITION_FACTORY);
  private readonly reason = inject(SPEECH_RECOGNITION_UNSUPPORTED_REASON);

  readonly transcript = signal('');
  readonly isListening = signal(false);
  readonly isSupported = signal(this.factory !== null);
  readonly isSecureContext = signal(this.reason !== 'insecure-context');
  readonly unsupportedReason = signal<AgentUnsupportedReason>(this.reason);

  private recognition: SpeechRecognitionLike | null = null;
  private restartCount = 0;
  private isStopped = true;
  private restartTimer = Subscription.EMPTY;
  private onTranscriptCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.stop());
  }

  start(
    onTranscript: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void,
  ): void {
    if (!this.factory) return;
    this.onTranscriptCallback = onTranscript;
    this.onErrorCallback = onError;
    this.isStopped = false;
    this.restartCount = 0;
    this.startSession();
  }

  stop(): void {
    this.isStopped = true;
    this.restartTimer.unsubscribe();
    this.recognition?.abort();
    this.recognition = null;
    this.isListening.set(false);
  }

  private startSession(): void {
    if (!this.factory || this.isStopped) return;
    const instance = this.factory();
    instance.continuous = true;
    instance.interimResults = true;
    instance.lang = this.lang.currentLang() === 'pt' ? 'pt-BR' : 'en-US';
    instance.maxAlternatives = 1;
    instance.onresult = (event: SpeechRecognitionEventLike) => this.handleResult(event);
    instance.onerror = (event: SpeechRecognitionErrorEventLike) => this.handleError(event);
    instance.onend = () => this.handleEnd();
    instance.onstart = () => {
      this.restartCount = 0;
      this.isListening.set(true);
    };
    this.recognition = instance;
    instance.start();
  }

  private handleResult(event: SpeechRecognitionEventLike): void {
    const result = event.results[event.results.length - 1];
    if (!result) return;
    const text = result[0]?.transcript ?? '';
    this.transcript.set(text);
    this.onTranscriptCallback?.(text, result.isFinal);
  }

  private handleError(event: SpeechRecognitionErrorEventLike): void {
    if (NON_RECOVERABLE_ERRORS.includes(event.error)) {
      this.onErrorCallback?.(event.error);
      this.stop();
    }
  }

  private handleEnd(): void {
    this.isListening.set(false);
    if (!this.isStopped && this.restartCount < MAX_RESTARTS) {
      const delay = BASE_BACKOFF_MS * Math.pow(2, this.restartCount);
      this.restartCount++;
      this.restartTimer = timer(delay)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.startSession());
    } else if (this.restartCount >= MAX_RESTARTS) {
      this.onErrorCallback?.('max-restarts');
    }
  }
}
