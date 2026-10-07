import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilesGrid } from './grid';
import { LanguageService } from '../../../../core/services/language';
import { FileItem } from '../../../../core/models/file';
import { outputToObservable } from '@angular/core/rxjs-interop';

const folder: FileItem = { id: 'f1', name: 'Documents', type: 'folder', icon: 'folder' };
const imageFile: FileItem = { id: 'img1', name: 'photo.jpg', type: 'file', icon: 'image' };
const textFile: FileItem = { id: 't1', name: 'readme.txt', type: 'file', icon: 'file' };

describe('FilesGrid', () => {
  let component: FilesGrid;
  let fixture: ComponentFixture<FilesGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesGrid],
      providers: [LanguageService],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('files input defaults to empty array', () => {
    expect(component.files()).toEqual([]);
  });

  it('selectedId input defaults to null', () => {
    expect(component.selectedId()).toBeNull();
  });

  it('gridSize input defaults to 110', () => {
    expect(component.gridSize()).toBe(110);
  });

  it('files input reflects provided value', () => {
    fixture.componentRef.setInput('files', [folder, imageFile]);
    fixture.detectChanges();
    expect(component.files().length).toBe(2);
  });

  it('selectedId input reflects provided value', () => {
    fixture.componentRef.setInput('selectedId', 'img1');
    fixture.detectChanges();
    expect(component.selectedId()).toBe('img1');
  });

  it('isImage returns true for image extensions', () => {
    expect(component.isImage('photo.jpg')).toBe(true);
    expect(component.isImage('icon.png')).toBe(true);
    expect(component.isImage('image.svg')).toBe(true);
    expect(component.isImage('picture.webp')).toBe(true);
  });

  it('isImage returns false for non-image extensions', () => {
    expect(component.isImage('document.pdf')).toBe(false);
    expect(component.isImage('script.ts')).toBe(false);
    expect(component.isImage('readme.txt')).toBe(false);
  });

  it('onNavigate output emits FileItem', () => {
    let emitted: FileItem | undefined;
    outputToObservable(component.onNavigate).subscribe((v) => (emitted = v));
    component.onNavigate.emit(folder);
    expect(emitted).toBe(folder);
  });

  it('onSelect output emits string id', () => {
    let emitted: string | undefined;
    outputToObservable(component.onSelect).subscribe((v) => (emitted = v));
    component.onSelect.emit('f1');
    expect(emitted).toBe('f1');
  });
});
