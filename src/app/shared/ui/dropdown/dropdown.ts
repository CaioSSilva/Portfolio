import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DropdownOption } from '../../../core/models/dropdown';

let nextDropdownId = 0;

@Component({
  selector: 'app-dropdown',
  standalone: true,
  templateUrl: './dropdown.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Dropdown {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  readonly isOpen = signal(false);
  readonly options = input.required<DropdownOption[]>();
  readonly value = input.required<string>();
  readonly ariaLabel = input.required<string>();
  readonly valueChange = output<string>();

  private readonly id = `dropdown-listbox-${nextDropdownId++}`;

  get listboxId(): string {
    return this.id;
  }

  get selectedOption(): DropdownOption | undefined {
    return this.options().find((option) => option.value === this.value());
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
      return;
    }
    this.openAtSelectedOption();
  }

  select(option: DropdownOption): void {
    this.valueChange.emit(option.value);
    this.close();
    requestAnimationFrame(() => this.focusTrigger());
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.close();
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    this.openAtSelectedOption();
  }

  onOptionKeydown(event: KeyboardEvent, currentValue: string): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      this.focusTrigger();
      return;
    }

    const nextIndex = this.getNextOptionIndex(event.key, currentValue);
    if (nextIndex === null) return;
    event.preventDefault();
    this.focusOption(this.options()[nextIndex].value);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (event.target instanceof Node && !this.host.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('document:focusin', ['$event'])
  onDocumentFocusIn(event: FocusEvent): void {
    if (event.target instanceof Node && !this.host.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  private openAtSelectedOption(): void {
    this.isOpen.set(true);
    requestAnimationFrame(() => this.focusOption(this.value()));
  }

  private close(): void {
    this.isOpen.set(false);
  }

  private focusOption(value: string): void {
    const options = this.host.nativeElement.querySelectorAll<HTMLButtonElement>(
      '[data-dropdown-option]',
    );
    Array.from(options)
      .find((option) => option.dataset['dropdownOption'] === value)
      ?.focus();
  }

  private getNextOptionIndex(key: string, currentValue: string): number | null {
    const options = this.options();
    const currentIndex = options.findIndex((option) => option.value === currentValue);
    if (key === 'ArrowDown') return (currentIndex + 1) % options.length;
    if (key === 'ArrowUp') return (currentIndex - 1 + options.length) % options.length;
    if (key === 'Home') return 0;
    if (key === 'End') return options.length - 1;
    return null;
  }

  private focusTrigger(): void {
    this.host.nativeElement.querySelector<HTMLButtonElement>('[data-dropdown-trigger]')?.focus();
  }
}
