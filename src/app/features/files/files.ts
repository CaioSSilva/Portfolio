import { CommonModule } from '@angular/common';
import { Component, inject, signal, linkedSignal, computed, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Base } from '../../core/models/base';
import { FileItem } from '../../core/models/file';
import { FileSystem } from '../../core/services/file-system';
import { FilesSidebar } from './components/sidebar/sidebar';
import { FilesBreadcrumbs } from './components/breadcrumbs/breadcrumbs';
import { FilesGrid } from './components/grid/grid';
import { FilesList } from './components/list/list';
import { LanguageService } from '../../core/services/language';
import { ProcessManager } from '../../core/services/process-manager';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [CommonModule, FormsModule, FilesSidebar, FilesBreadcrumbs, FilesGrid, FilesList],
  templateUrl: './files.html',
})
export class Files extends Base {
  public fs = inject(FileSystem);
  readonly lang = inject(LanguageService);
  private manager = inject(ProcessManager);

  readonly viewMode = signal<'grid' | 'list'>('list');
  readonly searchQuery = signal('');
  readonly pathIds = signal<string[]>(['root', 'home']);
  readonly expandedFolders = signal<Set<string>>(new Set(['root', 'home']));
  readonly sidebarWidth = signal(240);
  readonly gridSize = signal(110);

  private isResizing = false;
  private startX = 0;

  readonly selectedId = linkedSignal<string[], string | null>({
    source: this.pathIds,
    computation: () => null,
  });

  readonly currentFolderId = computed(() => {
    const ids = this.pathIds();
    return ids[ids.length - 1];
  });

  readonly currentFiles = computed(() => {
    if (!this.fs.isLoaded()) return [];

    const id = this.currentFolderId();
    return this.fs.getChildren(id);
  });

  readonly breadcrumbs = computed(() => {
    if (!this.fs.isLoaded()) return [];

    const translations = this.lang.t().files as Record<string, string>;

    return this.pathIds().map((id) => {
      const folderName = this.fs.getFolderName(id);
      const translatedName = translations[id.toLowerCase()];
      return { id, name: translatedName || folderName };
    });
  });

  readonly filteredFiles = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const files = this.currentFiles();

    if (!query) return files;

    return files.filter((item: FileItem) => item.name.toLowerCase().includes(query));
  });

  readonly totalSize = computed(() => {
    const files = this.filteredFiles();
    const total = files.reduce((acc: number, item: FileItem) => acc + (item.size || 0), 0);
    return this.fs.formatFileSize(total);
  });

  constructor() {
    super();
    this.fs.ensureLoaded().catch(console.error);
  }

  handleNavigate(item: FileItem): void {
    this.navigate(item, item.type !== 'file');
  }

  updateGridSize(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.gridSize.set(parseInt(value, 10));
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isResizing) return;

    const diff = event.clientX - this.startX;
    const newWidth = Math.min(Math.max(160, this.sidebarWidth() + diff), 500);

    this.sidebarWidth.set(newWidth);
    this.startX = event.clientX;
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    this.isResizing = false;
  }

  startResizing(event: MouseEvent): void {
    this.isResizing = true;
    this.startX = event.clientX;
    event.preventDefault();
  }

  handleToggleExpand(id: string): void {
    this.expandedFolders.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  navigate(item: FileItem | string, isSidebar = false): void {
    const id = typeof item === 'string' ? item : item.id;
    const node = typeof item === 'string' ? this.fs.getNode(id) : item;

    if (node?.type === 'file') {
      this.selectedId.set(id);
      this.manager.openFile(node);
      return;
    }

    this.updatePath(id, isSidebar);
  }

  private updatePath(id: string, isSidebar: boolean): void {
    this.searchQuery.set('');

    if (isSidebar) {
      const base = ['root', 'home'];

      if (id === 'root') {
        this.pathIds.set(['root']);
      } else if (id === 'home') {
        this.pathIds.set(base);
      } else {
        this.pathIds.set([...base, id]);
      }
    } else {
      this.pathIds.update((ids) => [...ids, id]);
    }
  }

  jumpTo(index: number): void {
    this.searchQuery.set('');
    this.pathIds.update((ids) => ids.slice(0, index + 1));
  }

  goBack(): void {
    this.searchQuery.set('');
    this.pathIds.update((ids) => (ids.length > 1 ? ids.slice(0, -1) : ids));
  }
}
