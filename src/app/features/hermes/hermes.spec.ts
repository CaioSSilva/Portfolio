import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hermes } from './hermes';

describe('Hermes', () => {
  let component: Hermes;
  let fixture: ComponentFixture<Hermes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hermes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hermes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
