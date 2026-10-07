import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WindowSwitcher } from './window-switcher';
import { ProcessManager } from '../../core/services/process-manager';
import { signal } from '@angular/core';
import { Process } from '../../core/models/process';
import { Component } from '@angular/core';
import { Base } from '../../core/models/base';

@Component({ selector: 'mock-app', template: '', standalone: true })
class MockApp extends Base {}

function makeProcess(id: string, zIndex: number): Process {
  return { id, appId: id, title: id, icon: '', color: '', component: MockApp, isMinimized: false, isMaximized: false, zIndex };
}

describe('WindowSwitcher', () => {
  let component: WindowSwitcher;
  let fixture: ComponentFixture<WindowSwitcher>;
  let processesSig: ReturnType<typeof signal<Process[]>>;
  let focusMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    processesSig = signal([]);
    focusMock = vi.fn();

    await TestBed.configureTestingModule({
      imports: [WindowSwitcher],
      providers: [
        { provide: ProcessManager, useValue: { processes: processesSig, focus: focusMock } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WindowSwitcher);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isVisible defaults to false', () => {
    expect(component.isVisible()).toBe(false);
  });

  it('processes computed returns sorted processes by zIndex descending', () => {
    processesSig.set([makeProcess('a', 10), makeProcess('b', 30), makeProcess('c', 20)]);
    fixture.detectChanges();
    const sorted = component.processes();
    expect(sorted[0].id).toBe('b');
    expect(sorted[1].id).toBe('c');
    expect(sorted[2].id).toBe('a');
  });

  it('onKeyDown Ctrl+Q with no processes does nothing', () => {
    processesSig.set([]);
    fixture.detectChanges();
    const event = new KeyboardEvent('keydown', { key: 'q', ctrlKey: true });
    component.onKeyDown(event);
    expect(component.isVisible()).toBe(false);
  });

  it('onKeyDown Ctrl+Q with processes opens switcher', () => {
    processesSig.set([makeProcess('a', 1), makeProcess('b', 2)]);
    fixture.detectChanges();
    const event = new KeyboardEvent('keydown', { key: 'q', ctrlKey: true });
    component.onKeyDown(event);
    expect(component.isVisible()).toBe(true);
  });

  it('onKeyDown Ctrl+Q cycles selectedIndex when already visible', () => {
    processesSig.set([makeProcess('a', 1), makeProcess('b', 2), makeProcess('c', 3)]);
    fixture.detectChanges();
    // open
    component.onKeyDown(new KeyboardEvent('keydown', { key: 'q', ctrlKey: true }));
    const firstIdx = component.selectedIndex();
    // cycle
    component.onKeyDown(new KeyboardEvent('keydown', { key: 'q', ctrlKey: true }));
    expect(component.selectedIndex()).not.toBe(firstIdx);
  });

  it('onKeyDown Escape closes switcher', () => {
    processesSig.set([makeProcess('a', 1)]);
    fixture.detectChanges();
    component.onKeyDown(new KeyboardEvent('keydown', { key: 'q', ctrlKey: true }));
    expect(component.isVisible()).toBe(true);
    component.onKeyDown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.isVisible()).toBe(false);
  });

  it('onKeyUp calls confirmSelection when Ctrl released and visible', () => {
    processesSig.set([makeProcess('p1', 1)]);
    component.isVisible.set(true);
    component.selectedIndex.set(0);
    const event = new KeyboardEvent('keyup', { ctrlKey: false });
    component.onKeyUp(event);
    expect(focusMock).toHaveBeenCalledWith('p1');
    expect(component.isVisible()).toBe(false);
  });

  it('onKeyUp does nothing when not visible', () => {
    component.isVisible.set(false);
    component.onKeyUp(new KeyboardEvent('keyup', { ctrlKey: false }));
    expect(focusMock).not.toHaveBeenCalled();
  });

  it('confirmSelection focuses selected process and hides', () => {
    processesSig.set([makeProcess('x', 1), makeProcess('y', 2)]);
    component.isVisible.set(true);
    component.selectedIndex.set(0);
    component.confirmSelection();
    expect(focusMock).toHaveBeenCalled();
    expect(component.isVisible()).toBe(false);
  });

  it('selectAndFocus sets index and confirms selection', () => {
    processesSig.set([makeProcess('a', 1), makeProcess('b', 2)]);
    component.isVisible.set(true);
    component.selectAndFocus(1);
    expect(focusMock).toHaveBeenCalled();
    expect(component.isVisible()).toBe(false);
  });
});
