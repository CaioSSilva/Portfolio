import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dock } from './dock';

describe('Dock', () => {
  let component: Dock;
  let fixture: ComponentFixture<Dock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dock],
    }).compileComponents();

    fixture = TestBed.createComponent(Dock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
