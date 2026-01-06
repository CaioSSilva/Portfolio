import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Browser } from './browser';

describe('Browser', () => {
  let component: Browser;
  let fixture: ComponentFixture<Browser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Browser],
    }).compileComponents();

    fixture = TestBed.createComponent(Browser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
