import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Browser } from './browser';
import { LanguageService } from '../../core/services/language';

describe('Browser', () => {
  let component: Browser;
  let fixture: ComponentFixture<Browser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Browser],
      providers: [LanguageService],
    }).compileComponents();

    fixture = TestBed.createComponent(Browser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
