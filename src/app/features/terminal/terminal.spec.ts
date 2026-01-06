import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Terminal } from './terminal';

describe('Terminal', () => {
  let component: Terminal;
  let fixture: ComponentFixture<Terminal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Terminal],
    }).compileComponents();

    fixture = TestBed.createComponent(Terminal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
