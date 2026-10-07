import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilesList } from './list';
import { FileSystem } from '../../../../core/services/file-system';
import { LanguageService } from '../../../../core/services/language';
import { FileItem } from '../../../../core/models/file';
import { signal } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';

const folder: FileItem = { id: 'docs', name: 'Documents', type: 'folder', icon: 'folder' };
const file: FileItem = { id: 'readme', name: 'readme.txt', type: 'file', icon: 'file', size: 512 };

describe('FilesList', () => {
  let component: FilesList;
  let fixture: ComponentFixture<FilesList>;
  let fsMock: { isLoaded: ReturnType<typeof signal>; formatFileSize: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    fsMock = {
      isLoaded: signal(true),
      formatFileSize: vi.fn().mockReturnValue('512 B'),
    };

    await TestBed.configureTestingModule({
      imports: [FilesList],
      providers: [
        { provide: FileSystem, useValue: fsMock },
        LanguageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesList);
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

  it('files input reflects provided value', () => {
    fixture.componentRef.setInput('files', [folder, file]);
    fixture.detectChanges();
    expect(component.files().length).toBe(2);
  });

  it('selectedId input reflects provided value', () => {
    fixture.componentRef.setInput('selectedId', 'readme');
    fixture.detectChanges();
    expect(component.selectedId()).toBe('readme');
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
    component.onSelect.emit('docs');
    expect(emitted).toBe('docs');
  });
});
