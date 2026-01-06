import { Component, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessManager } from '../../core/services/process-manager';

@Component({
  selector: 'app-window-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './window-switcher.html',
  styleUrl: './window-switcher.scss',
})
export class WindowSwitcher {
  private processManager = inject(ProcessManager);

  isVisible = signal(false);
  selectedIndex = signal(0);

  processes = computed(() => {
    return [...this.processManager.processes()].sort((a, b) => b.zIndex - a.zIndex);
  });

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key.toLowerCase() === 'q') {
      event.preventDefault();

      if (!this.isVisible()) {
        if (this.processes().length === 0) return;
        this.isVisible.set(true);
        this.selectedIndex.set(this.processes().length > 1 ? 1 : 0);
      } else {
        this.selectedIndex.update((idx) => (idx + 1) % this.processes().length);
      }
    }

    if (event.key === 'Escape' && this.isVisible()) {
      this.isVisible.set(false);
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (!event.ctrlKey && this.isVisible()) {
      this.confirmSelection();
    }
  }

  confirmSelection() {
    const selected = this.processes()[this.selectedIndex()];
    if (selected) {
      this.processManager.focus(selected.id);
    }
    this.isVisible.set(false);
  }

  selectAndFocus(index: number) {
    this.selectedIndex.set(index);
    this.confirmSelection();
  }
}
