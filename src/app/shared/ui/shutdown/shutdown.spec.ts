import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Shutdown } from './shutdown';

describe('Shutdown', () => {
  let component: Shutdown;
  let fixture: ComponentFixture<Shutdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shutdown],
    }).compileComponents();

    fixture = TestBed.createComponent(Shutdown);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
