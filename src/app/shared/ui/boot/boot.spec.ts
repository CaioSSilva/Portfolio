import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Boot } from './boot';
import { LanguageService } from '../../../core/services/language';
import { Sound } from '../../../core/services/sound';

describe('Boot', () => {
  let component: Boot;
  let fixture: ComponentFixture<Boot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Boot],
      providers: [
        LanguageService,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Boot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
