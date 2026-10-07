import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Hermes } from './hermes';
import { Gemini } from '../../core/services/gemini';
import { LanguageService } from '../../core/services/language';
import { Sound } from '../../core/services/sound';

describe('Hermes', () => {
  let component: Hermes;
  let fixture: ComponentFixture<Hermes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hermes],
      providers: [
        LanguageService,
        { provide: Gemini, useValue: { generateResponse: vi.fn().mockResolvedValue('Mock response') } },
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Hermes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
