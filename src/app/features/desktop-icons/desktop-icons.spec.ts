import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesktopIcons } from './desktop-icons';

describe('DesktopIcons', () => {
  let component: DesktopIcons;
  let fixture: ComponentFixture<DesktopIcons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesktopIcons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesktopIcons);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
