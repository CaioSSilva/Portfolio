import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification';
import { Sound } from './sound';

describe('NotificationService', () => {
  let service: NotificationService;
  let soundSpy: { play: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    soundSpy = { play: vi.fn().mockResolvedValue(undefined) };

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: Sound, useValue: soundSpy },
      ],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle panel state', () => {
    expect(service.isPanelOpen()).toBe(false);
    service.togglePanel();
    expect(service.isPanelOpen()).toBe(true);
    service.togglePanel();
    expect(service.isPanelOpen()).toBe(false);
  });

  it('should show notification and play sound', () => {
    service.show({
      title: 'Test Notification',
      message: 'This is a test message',
      icon: 'fas fa-info',
    });

    expect(service.activeNotifications().length).toBe(1);
    expect(service.activeNotifications()[0].title).toBe('Test Notification');
    expect(soundSpy.play).toHaveBeenCalledWith('bell');
  });

  it('should dismiss active notification by id', () => {
    service.show({
      title: 'Dismiss Test',
      message: 'Testing dismissal',
      icon: 'fas fa-info',
    });

    const activeId = service.activeNotifications()[0].id;
    service.dismiss(activeId);
    expect(service.activeNotifications().length).toBe(0);
  });

  it('should clear history', () => {
    service.clearHistory();
    expect(service.history()).toEqual([]);
  });
});
