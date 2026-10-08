import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Window } from './window';
import { WindowService } from '../../../core/services/window';
import { LanguageService } from '../../../core/services/language';
import { Process } from '../../../core/models/process';
import { Component, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { Base } from '../../../core/models/base';

@Component({ selector: 'app-mock-component', template: '<div>Mock App</div>', standalone: true })
class MockAppComponent extends Base {}

const mockProcess: Process = {
  id: 'p1',
  appId: 'files',
  title: 'Files',
  icon: 'fas fa-folder',
  color: '#3584e4',
  component: MockAppComponent,
  isMinimized: false,
  isMaximized: false,
  zIndex: 100,
  cascadeIndex: 0,
};

function makeWindowServiceMock() {
  const isMaximizedSig = signal(false);
  return {
    init: vi.fn(),
    isMaximized: isMaximizedSig,
    isMaximizedSig,
    toggleMaximize: vi.fn(),
    isSnapped: signal(false),
    isVisible: signal(true),
    isDragging: signal(false),
    isResizing: signal(false),
    snapGhost: signal(null),
    screen: {
      isMobile: signal(false),
      isTablet: signal(false),
      isDesktop: signal(true),
      isCompact: signal(false),
    },
    focus: vi.fn(),
    startDrag: vi.fn(),
    startResize: vi.fn(),
    minimize: vi.fn(),
    close: vi.fn(),
  };
}

describe('Window', () => {
  let component: Window;
  let fixture: ComponentFixture<Window>;
  let windowServiceMock: ReturnType<typeof makeWindowServiceMock>;

  beforeEach(async () => {
    windowServiceMock = makeWindowServiceMock();

    await TestBed.configureTestingModule({
      imports: [Window],
      providers: [LanguageService],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .overrideComponent(Window, {
      set: { providers: [{ provide: WindowService, useValue: windowServiceMock }] },
    })
    .compileComponents();

    fixture = TestBed.createComponent(Window);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('process', mockProcess);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('process input reflects the provided process', () => {
    expect(component.process().id).toBe('p1');
    expect(component.process().title).toBe('Files');
  });

  it('TOP_BAR_HEIGHT is a positive number', () => {
    expect(component.TOP_BAR_HEIGHT).toBeGreaterThan(0);
  });

  it('onWindowResize calls toggleMaximize when isMaximized is true', () => {
    windowServiceMock.isMaximized.set(true);
    component.onWindowResize();
    expect(windowServiceMock.toggleMaximize).toHaveBeenCalled();
  });

  it('onWindowResize does nothing when not maximized', () => {
    windowServiceMock.isMaximized.set(false);
    component.onWindowResize();
    expect(windowServiceMock.toggleMaximize).not.toHaveBeenCalled();
  });
});
