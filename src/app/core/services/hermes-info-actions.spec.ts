import { TestBed } from '@angular/core/testing';
import { HermesInfoActionsService } from './hermes-info-actions';
import { ProcessManager } from './process-manager';
import { SystemInfoService } from './system-info';
import { NotificationService } from './notification';
import { LanguageService } from './language';
import { signal } from '@angular/core';
import { Process } from '../models/process';
import { SystemInfo } from '../models/setting';

describe('HermesInfoActionsService', () => {
  let service: HermesInfoActionsService;
  let processManagerSpy: { processes: ReturnType<typeof signal<Process[]>> };
  let systemInfoSpy: { info: SystemInfo };
  let notificationSpy: { show: ReturnType<typeof vi.fn> };
  let languageSpy: { currentLang: ReturnType<typeof vi.fn>; t: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    processManagerSpy = { processes: signal<Process[]>([]) };
    systemInfoSpy = {
      info: {
        os: 'Cai_OS 2.0.1',
        kernel: 'Linux 6.8.0',
        arch: 'x86_64',
        cpu: 4,
        ram: '8 GB',
        resolution: '1920 × 1080',
        language: 'pt-BR',
        browser: 'Chrome',
      },
    };
    notificationSpy = { show: vi.fn() };
    languageSpy = {
      currentLang: vi.fn().mockReturnValue('en'),
      t: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        HermesInfoActionsService,
        { provide: ProcessManager, useValue: processManagerSpy },
        { provide: SystemInfoService, useValue: systemInfoSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: LanguageService, useValue: languageSpy },
      ],
    });

    service = TestBed.inject(HermesInfoActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSystemStatus', () => {
    it('shows a notification with process count and system info', () => {
      processManagerSpy.processes.set([
        { id: 'p1', appId: 'terminal' } as Process,
        { id: 'p2', appId: 'files' } as Process,
      ]);

      service.getSystemStatus();

      expect(notificationSpy.show).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'System Status',
          icon: 'fas fa-microchip',
        }),
      );
      const call = notificationSpy.show.mock.calls[0][0];
      expect(call.message).toContain('Active processes: 2');
      expect(call.message).toContain('Cai_OS 2.0.1');
    });

    it('uses Portuguese label when lang is pt', () => {
      languageSpy.currentLang.mockReturnValue('pt');
      service.getSystemStatus();
      const call = notificationSpy.show.mock.calls[0][0];
      expect(call.title).toBe('Status do Sistema');
      expect(call.message).toContain('Processos ativos:');
    });
  });

  describe('showError', () => {
    it('shows an error notification with the given title and message', () => {
      service.showError('Erro', 'Algo deu errado');
      expect(notificationSpy.show).toHaveBeenCalledWith({
        title: 'Erro',
        message: 'Algo deu errado',
        icon: 'fas fa-circle-exclamation',
      });
    });
  });
});
