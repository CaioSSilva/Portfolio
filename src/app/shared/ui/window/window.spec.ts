import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Window } from './window';
import { Base } from '../../../core/models/base';
import { WindowService } from '../../../core/services/window';
import { ProcessManager } from '../../../core/services/process-manager';
import { LanguageService } from '../../../core/services/language';
import { Settings } from '../../../core/services/settings';
import { DockService } from '../../../core/services/dock';
import { FileSystem } from '../../../core/services/file-system';
import { NotificationService } from '../../../core/services/notification';
import { AppRegistry } from '../../../core/services/app-registry';
import { AppLauncher } from '../../../core/services/app-launcher';
import { ContextMenuService } from '../../../core/services/context-menu';
import { Sound } from '../../../core/services/sound';
import { Process } from '../../../core/models/process';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';

describe('Window', () => {
  let component: Window;
  let fixture: ComponentFixture<Window>;

  @Component({
    selector: 'app-mock-component',
    template: '<div>Mock App</div>',
    standalone: true,
  })
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
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Window],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        WindowService,
        ProcessManager,
        LanguageService,
        Settings,
        DockService,
        FileSystem,
        NotificationService,
        AppRegistry,
        AppLauncher,
        ContextMenuService,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(Window);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('process', mockProcess);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
