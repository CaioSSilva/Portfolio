import { TestBed } from '@angular/core/testing';
import { HermesAppActionsService } from './hermes-app-actions';
import { AppRegistry } from './app-registry';
import { ProcessManager } from './process-manager';

describe('HermesAppActionsService', () => {
  let service: HermesAppActionsService;
  let appRegistrySpy: { getAppById: ReturnType<typeof vi.fn> };
  let processManagerSpy: {
    open: ReturnType<typeof vi.fn>;
    closeAllInstancesById: ReturnType<typeof vi.fn>;
    openFile: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    appRegistrySpy = { getAppById: vi.fn() };
    processManagerSpy = {
      open: vi.fn(),
      closeAllInstancesById: vi.fn(),
      openFile: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        HermesAppActionsService,
        { provide: AppRegistry, useValue: appRegistrySpy },
        { provide: ProcessManager, useValue: processManagerSpy },
      ],
    });

    service = TestBed.inject(HermesAppActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('open_app', () => {
    it('opens the app via processManager when found', () => {
      const mockApp = { id: 'terminal', title: 'Terminal', data: { id: '1' } };
      appRegistrySpy.getAppById.mockReturnValue(mockApp);

      service.execute({ type: 'open_app', payload: { app: 'terminal' } });

      expect(appRegistrySpy.getAppById).toHaveBeenCalledWith('terminal');
      expect(processManagerSpy.open).toHaveBeenCalledWith(mockApp, mockApp.data);
    });

    it('throws when app payload is missing', () => {
      expect(() => service.execute({ type: 'open_app', payload: {} })).toThrow('Missing app');
    });

    it('throws when app is not found in registry', () => {
      appRegistrySpy.getAppById.mockReturnValue(undefined);
      expect(() => service.execute({ type: 'open_app', payload: { app: 'ghost' } })).toThrow(
        'App not found: ghost',
      );
    });
  });

  describe('close_app', () => {
    it('closes all instances by app id', () => {
      service.execute({ type: 'close_app', payload: { app: 'terminal' } });
      expect(processManagerSpy.closeAllInstancesById).toHaveBeenCalledWith('terminal');
    });

    it('throws when app payload is missing', () => {
      expect(() => service.execute({ type: 'close_app', payload: {} })).toThrow('Missing app');
    });
  });

  describe('open_file', () => {
    it('opens the file via processManager', () => {
      service.execute({
        type: 'open_file',
        payload: { name: 'Resume.pdf', url: '/data/Resume.pdf' },
      });

      expect(processManagerSpy.openFile).toHaveBeenCalledWith({
        id: 'Resume.pdf',
        name: 'Resume.pdf',
        type: 'file',
        icon: 'fas fa-file',
        url: '/data/Resume.pdf',
      });
    });

    it('throws when name or url is missing', () => {
      expect(() => service.execute({ type: 'open_file', payload: { name: 'x' } })).toThrow(
        'Missing file info',
      );
      expect(() => service.execute({ type: 'open_file', payload: { url: '/x' } })).toThrow(
        'Missing file info',
      );
    });
  });
});
