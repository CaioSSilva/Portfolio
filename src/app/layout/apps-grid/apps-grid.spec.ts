import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppsGrid } from './apps-grid';

describe('AppsGrid', () => {
  let component: AppsGrid;
  let fixture: ComponentFixture<AppsGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppsGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(AppsGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
