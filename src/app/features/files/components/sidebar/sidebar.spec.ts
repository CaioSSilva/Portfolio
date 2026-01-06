import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilesSidebar } from './sidebar';

describe('Sidebar', () => {
  let component: FilesSidebar;
  let fixture: ComponentFixture<FilesSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
