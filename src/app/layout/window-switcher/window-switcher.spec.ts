import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WindowSwitcher } from './window-switcher';

describe('WindowSwitcher', () => {
  let component: WindowSwitcher;
  let fixture: ComponentFixture<WindowSwitcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WindowSwitcher],
    }).compileComponents();

    fixture = TestBed.createComponent(WindowSwitcher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
