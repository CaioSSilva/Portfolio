import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Window } from './window';

describe('Window', () => {
  let component: Window;
  let fixture: ComponentFixture<Window>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Window],
    }).compileComponents();

    fixture = TestBed.createComponent(Window);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
