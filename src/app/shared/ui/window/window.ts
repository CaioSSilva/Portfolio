import {
  Component,
  ElementRef,
  inject,
  input,
  viewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Process } from '../../../core/models/process';
import { WindowService } from '../../../core/services/window';
import { LanguageService } from '../../../core/services/language';

@Component({
  selector: 'app-window',
  standalone: true,
  imports: [CommonModule],
  providers: [WindowService],
  templateUrl: './window.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './window.scss',
})
export class Window implements AfterViewInit {
  private readonly ngZone = inject(NgZone);
  readonly lang = inject(LanguageService);
  readonly windowService = inject(WindowService);
  readonly process = input.required<Process>();
  readonly windowFrame = viewChild.required<ElementRef<HTMLElement>>('windowFrame');

  ngAfterViewInit(): void {
    this.ngZone.run(() => {
      this.windowService.init(this.windowFrame().nativeElement, this.process());
    });
  }
}
