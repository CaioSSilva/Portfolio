import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutProject } from './about-project';

describe('AboutProject', () => {
  let component: AboutProject;
  let fixture: ComponentFixture<AboutProject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutProject],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutProject);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
