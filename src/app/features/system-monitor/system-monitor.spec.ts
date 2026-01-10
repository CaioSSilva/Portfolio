import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemMonitor } from './system-monitor';

describe('SystemMonitor', () => {
  let component: SystemMonitor;
  let fixture: ComponentFixture<SystemMonitor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemMonitor],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemMonitor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
