import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilesGrid } from './grid';

describe('Grid', () => {
  let component: FilesGrid;
  let fixture: ComponentFixture<FilesGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
