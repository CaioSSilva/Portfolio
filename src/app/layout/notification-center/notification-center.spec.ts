import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationCenter } from './notification-center';
import { NotificationService } from '../../core/services/notification';
import { LanguageService } from '../../core/services/language';
import { Sound } from '../../core/services/sound';

describe('NotificationCenter', () => {
  let component: NotificationCenter;
  let fixture: ComponentFixture<NotificationCenter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationCenter],
      providers: [
        NotificationService,
        LanguageService,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationCenter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
