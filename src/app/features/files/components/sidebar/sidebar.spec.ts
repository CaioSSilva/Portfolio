import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilesSidebar } from './sidebar';
import { LanguageService } from '../../../../core/services/language';
import { FileItem } from '../../../../core/models/file';
import { outputToObservable } from '@angular/core/rxjs-interop';

const rootTree: FileItem = {
  id: 'root',
  name: 'Root',
  type: 'folder',
  icon: 'folder',
  children: [
    {
      id: 'home',
      name: 'Home',
      type: 'folder',
      icon: 'folder',
      children: [
        { id: 'readme', name: 'readme.txt', type: 'file', icon: 'file' },
      ],
    },
  ],
};

describe('FilesSidebar', () => {
  let component: FilesSidebar;
  let fixture: ComponentFixture<FilesSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesSidebar],
      providers: [LanguageService],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('tree input defaults to null', () => {
    expect(component.tree()).toBeNull();
  });

  it('tree input reflects provided value', () => {
    fixture.componentRef.setInput('tree', rootTree);
    fixture.detectChanges();
    expect(component.tree()?.id).toBe('root');
  });

  it('currentFolderId input defaults to empty string', () => {
    expect(component.currentFolderId()).toBe('');
  });

  it('expandedFolders input defaults to empty set', () => {
    expect(component.expandedFolders().size).toBe(0);
  });

  it('isSelected returns true for folder matching currentFolderId', () => {
    fixture.componentRef.setInput('currentFolderId', 'home');
    fixture.detectChanges();
    const homeItem: FileItem = { id: 'home', name: 'Home', type: 'folder', icon: 'folder' };
    expect(component.isSelected(homeItem)).toBe(true);
  });

  it('isSelected returns false for folder not matching currentFolderId', () => {
    fixture.componentRef.setInput('currentFolderId', 'home');
    fixture.detectChanges();
    const otherItem: FileItem = { id: 'other', name: 'Other', type: 'folder', icon: 'folder' };
    expect(component.isSelected(otherItem)).toBe(false);
  });

  it('isSelected returns true for file matching selectedId', () => {
    fixture.componentRef.setInput('selectedId', 'readme');
    fixture.detectChanges();
    const fileItem: FileItem = { id: 'readme', name: 'readme.txt', type: 'file', icon: 'file' };
    expect(component.isSelected(fileItem)).toBe(true);
  });

  it('isExpanded returns true for ids in expandedFolders', () => {
    fixture.componentRef.setInput('expandedFolders', new Set(['root', 'home']));
    fixture.detectChanges();
    expect(component.isExpanded('root')).toBe(true);
    expect(component.isExpanded('home')).toBe(true);
    expect(component.isExpanded('other')).toBe(false);
  });

  it('onNavigate output emits FileItem', () => {
    let emitted: FileItem | undefined;
    outputToObservable(component.onNavigate).subscribe((v) => (emitted = v));
    component.onNavigate.emit(rootTree);
    expect(emitted).toBe(rootTree);
  });

  it('onToggle output emits string id', () => {
    let emitted: string | undefined;
    outputToObservable(component.onToggle).subscribe((v) => (emitted = v));
    component.onToggle.emit('home');
    expect(emitted).toBe('home');
  });
});
