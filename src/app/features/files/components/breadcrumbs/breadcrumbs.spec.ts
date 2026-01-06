import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilesBreadcrumbs } from './breadcrumbs';
describe('Breadcrumbs', () => {
  let component: FilesBreadcrumbs;
  let fixture: ComponentFixture<FilesBreadcrumbs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesBreadcrumbs],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesBreadcrumbs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
