import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilesList } from './list';

describe('List', () => {
  let component: FilesList;
  let fixture: ComponentFixture<FilesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesList],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
