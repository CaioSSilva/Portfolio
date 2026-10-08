import {
  Component,
  HostListener,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ProcessManager } from '../../core/services/process-manager';

@Component({
  selector: 'app-window-switcher',
  standalone: true,
  imports: [],
  templateUrl: './window-switcher.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './window-switcher.scss',
})
export class WindowSwitcher {
  private readonly processManager = inject(ProcessManager);

  readonly isVisible = signal(false);
  readonly selectedIndex = signal(0);

  readonly processes = computed(() => {
    return [...this.processManager.processes()].sort((a, b) => b.zIndex - a.zIndex);
  });

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.code === 'Backquote') {
      event.preventDefault();

      if (!this.isVisible()) {
        if (this.processes().length === 0) return;
        this.isVisible.set(true);
        this.selectedIndex.set(this.processes().length > 1 ? 1 : 0);
      } else {
        const delta = event.shiftKey ? -1 : 1;
        const len = this.processes().length;
        this.selectedIndex.update((i) => (i + delta + len) % len);
      }
    }

    if (event.key === 'Escape' && this.isVisible()) {
      this.isVisible.set(false);
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (!event.ctrlKey && this.isVisible()) {
      this.confirmSelection();
    }
  }

  confirmSelection(): void {
    const selected = this.processes()[this.selectedIndex()];
    if (selected) {
      this.processManager.focus(selected.id);
    }
    this.isVisible.set(false);
  }

  selectAndFocus(index: number): void {
    this.selectedIndex.set(index);
    this.confirmSelection();
  }
}
