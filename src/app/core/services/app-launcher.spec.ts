import { TestBed } from '@angular/core/testing';
import { AppLauncher } from './app-launcher';
import { ProcessManager } from './process-manager';
import { ContextMenuService } from './context-menu';
import { AppDefinition } from '../models/dock';

describe('AppLauncher', () => {
  let service: AppLauncher;
  let processManagerSpy: { open: ReturnType<typeof vi.fn> };
  let contextMenuSpy: { close: ReturnType<typeof vi.fn> };

  const mockApp: AppDefinition = {
    id: 'files',
    title: 'Files',
    icon: 'fa-folder',
    color: '#3584e4',
    component: class MockComponent {} as never,
  };

  beforeEach(() => {
    processManagerSpy = { open: vi.fn() };
    contextMenuSpy = { close: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AppLauncher,
        { provide: ProcessManager, useValue: processManagerSpy },
        { provide: ContextMenuService, useValue: contextMenuSpy },
      ],
    });
    service = TestBed.inject(AppLauncher);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should launch app and close context menu', () => {
    service.launch(mockApp);
    expect(contextMenuSpy.close).toHaveBeenCalled();
    expect(processManagerSpy.open).toHaveBeenCalledWith(mockApp, undefined);
  });

  it('should launch app with data when provided', () => {
    const data = { url: '/file.pdf', title: 'file.pdf' };
    service.launch(mockApp, data);
    expect(processManagerSpy.open).toHaveBeenCalledWith(mockApp, data);
  });

  it('should launchAndCloseContext passing app.data', () => {
    const appWithData: AppDefinition = { ...mockApp, data: { url: '/index.html' } };
    service.launchAndCloseContext(appWithData);
    expect(contextMenuSpy.close).toHaveBeenCalled();
    expect(processManagerSpy.open).toHaveBeenCalledWith(appWithData, appWithData.data);
  });
});
