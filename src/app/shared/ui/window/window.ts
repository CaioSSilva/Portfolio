import {
  Component,
  ElementRef,
  inject,
  input,
  afterNextRender,
  viewChild,
  HostListener,
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
  styleUrl: './window.scss',
})
export class Window {
  process = input.required<Process>();
  lang = inject(LanguageService);
  windowFrame = viewChild.required<ElementRef<HTMLElement>>('windowFrame');

  protected windowService = inject(WindowService);

  constructor() {
    afterNextRender(() => {
      this.windowService.init(this.windowFrame().nativeElement, this.process());
    });
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (this.windowService.isMaximized()) {
      this.windowService.toggleMaximize();
    }
  }
}
