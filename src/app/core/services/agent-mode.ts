import { effect, inject, Injectable, signal } from '@angular/core';
import { Settings } from './settings';
import { SpeechRecognitionService } from './speech-recognition';
import { WakeWordService } from './wake-word';
import { SpeechSynthesisService } from './speech-synthesis';
import { HermesChatService } from './hermes-chat';
import { AgentModeState } from '../models/agent-mode';

const AWAKE_TIMEOUT_MS = 8000;

@Injectable({ providedIn: 'root' })
export class AgentModeService {
  private readonly settings = inject(Settings);
  private readonly recognition = inject(SpeechRecognitionService);
  private readonly wakeWord = inject(WakeWordService);
  private readonly synthesis = inject(SpeechSynthesisService);
  private readonly chat = inject(HermesChatService);

  readonly state = signal<AgentModeState>('off');
  readonly isSupported = this.recognition.isSupported;
  readonly isSecureContext = this.recognition.isSecureContext;

  private awakeTimer = 0;

  constructor() {
    effect(() => {
      if (this.settings.agentModeEnabled()) {
        this.startListening();
      } else {
        this.shutdown();
      }
    });
  }

  toggleAgentMode(): void {
    this.settings.toggleAgentMode();
  }

  private startListening(): void {
    if (!this.recognition.isSupported()) return;
    this.state.set('listening');
    this.recognition.start(
      (text, isFinal) => this.handleTranscript(text, isFinal),
      (error) => this.handleRecognitionError(error),
    );
  }

  private shutdown(): void {
    clearTimeout(this.awakeTimer);
    this.recognition.stop();
    this.synthesis.cancel();
    this.state.set('off');
  }

  private handleTranscript(text: string, isFinal: boolean): void {
    if (!isFinal) return;
    if (this.state() === 'awake') {
      this.processAwakeCommand(text);
      return;
    }
    if (this.state() === 'listening') {
      this.handleListeningTranscript(text);
    }
  }

  private handleListeningTranscript(text: string): void {
    if (this.wakeWord.isStopCommand(text)) {
      this.settings.toggleAgentMode();
      return;
    }
    const match = this.wakeWord.match(text);
    if (!match.matched) return;
    if (match.command) {
      this.dispatchCommand(match.command);
    } else {
      this.enterAwakeState();
    }
  }

  private processAwakeCommand(text: string): void {
    clearTimeout(this.awakeTimer);
    if (this.wakeWord.isStopCommand(text)) {
      this.settings.toggleAgentMode();
      return;
    }
    this.dispatchCommand(text);
  }

  private enterAwakeState(): void {
    this.state.set('awake');
    queueMicrotask(() => this.playChime());
    this.awakeTimer = window.setTimeout(() => {
      if (this.state() === 'awake') {
        this.state.set('listening');
      }
    }, AWAKE_TIMEOUT_MS);
  }

  private dispatchCommand(command: string): void {
    clearTimeout(this.awakeTimer);
    this.state.set('processing');
    this.recognition.stop();
    this.chat.send(command, null, null).then(() => this.onCommandComplete());
  }

  private onCommandComplete(): void {
    const shouldSpeak = this.settings.agentSpeakReplies();
    const lastMessage = this.chat.messages().at(-1);
    const replyText = lastMessage?.role === 'model' ? lastMessage.text : '';

    if (shouldSpeak && replyText) {
      this.state.set('speaking');
      this.synthesis.speak(replyText, () => this.resumeListening());
      return;
    }
    if (replyText) {
      this.chat.notifyAgentReply(replyText);
    }
    this.resumeListening();
  }

  private resumeListening(): void {
    if (!this.settings.agentModeEnabled()) return;
    this.state.set('listening');
    this.recognition.start(
      (text, isFinal) => this.handleTranscript(text, isFinal),
      (error) => this.handleRecognitionError(error),
    );
  }

  private handleRecognitionError(error: string): void {
    if (
      error === 'not-allowed' ||
      error === 'service-not-allowed' ||
      error === 'max-restarts'
    ) {
      this.settings.disableAgentMode();
    }
    this.state.set('off');
  }

  private playChime(): void {
    const audio = new Audio('/sounds/bell.ogg');
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }
}
