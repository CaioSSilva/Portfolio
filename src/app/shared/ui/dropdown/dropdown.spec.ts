import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { DropdownOption } from '../../../core/models/dropdown';
import { Dropdown } from './dropdown';

@Component({
  standalone: true,
  imports: [Dropdown],
  template: `
    <app-dropdown
      [options]="options"
      [value]="value"
      ariaLabel="Snap mode"
      (valueChange)="value = $event"
    />
  `,
})
class DropdownHost {
  readonly options: DropdownOption[] = [
    { value: 'classic', label: 'Classic' },
    { value: 'halves', label: 'Halves' },
    { value: 'thirds', label: 'Thirds' },
  ];
  value = 'classic';
}

describe('Dropdown', () => {
  let fixture: ComponentFixture<DropdownHost>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DropdownHost] }).compileComponents();
    fixture = TestBed.createComponent(DropdownHost);
    fixture.detectChanges();
    host = fixture.nativeElement.querySelector('app-dropdown');
  });

  it('opens the themed option list and updates the selected value', () => {
    host.querySelector<HTMLButtonElement>('[data-dropdown-trigger]')?.click();
    fixture.detectChanges();
    host.querySelector<HTMLButtonElement>('[data-dropdown-option="thirds"]')?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toBe('thirds');
    expect(host.querySelector('[role="listbox"]')).toBeNull();
    expect(host.querySelector('[data-dropdown-trigger]')?.textContent).toContain('Thirds');
  });

  it('keeps the menu open while focus moves from the trigger to an option', () => {
    const trigger = host.querySelector<HTMLButtonElement>('[data-dropdown-trigger]')!;
    trigger.click();
    fixture.detectChanges();
    const option = host.querySelector<HTMLButtonElement>('[data-dropdown-option="thirds"]')!;

    option.focus();
    fixture.detectChanges();
    expect(host.querySelector('[role="listbox"]')).not.toBeNull();

    option.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe('thirds');
  });

  it('opens with the keyboard and closes on Escape', () => {
    const trigger = host.querySelector<HTMLButtonElement>('[data-dropdown-trigger]')!;
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(host.querySelector('[role="listbox"]')).not.toBeNull();

    host.querySelector<HTMLButtonElement>('[data-dropdown-option="classic"]')?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(host.querySelector('[role="listbox"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('closes when clicking outside the component', () => {
    host.querySelector<HTMLButtonElement>('[data-dropdown-trigger]')?.click();
    fixture.detectChanges();
    document.body.click();
    fixture.detectChanges();

    expect(host.querySelector('[role="listbox"]')).toBeNull();
  });
});
