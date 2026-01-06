import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { FileItem } from '../models/file';
import { LanguageService } from './language';
import { NotificationService } from './notification';

@Injectable({ providedIn: 'root' })
export class FileSystem {
  private http = inject(HttpClient);
  private lang = inject(LanguageService);
  private nots = inject(NotificationService);
  readonly tree = signal<FileItem | null>(null);
  readonly isLoaded = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly nodeMap = new Map<string, FileItem>();
  private loadPromise?: Promise<void>;
  private readonly sizeFormatCache = new Map<number, string>();
  private readonly searchIndex = new Map<string, Set<FileItem>>();

  readonly totalFiles = computed(() => {
    const root = this.tree();
    return root ? this.countFiles(root) : 0;
  });

  readonly totalSize = computed(() => this.tree()?.size || 0);

  async ensureLoaded(): Promise<void> {
    if (this.isLoaded()) return;
    if (this.loadPromise) return this.loadPromise;

    this.isLoading.set(true);
    this.error.set(null);

    this.loadPromise = lastValueFrom(this.http.get<{ root: FileItem }>('/data/fs.json'))
      .then((data) => {
        this.calculateSize(data.root);
        this.tree.set(data.root);
        this.cacheNodes(data.root);
        this.buildSearchIndex(data.root);
        this.isLoaded.set(true);
      })
      .catch(() => {
        this.nots.show({
          title: this.lang.t().errors.systemError,
          message: this.lang.t().errors.enableToLoadFs,
          icon: 'fas circle-exclamation',
        });
      })
      .finally(() => {
        this.isLoading.set(false);
      });

    return this.loadPromise;
  }

  getNode(id: string): FileItem | undefined {
    return this.nodeMap.get(id);
  }

  getChildren(id: string): FileItem[] {
    return this.nodeMap.get(id)?.children || [];
  }

  getFolderName(id: string): string {
    return this.nodeMap.get(id)?.name || id;
  }

  findChildByName(parentId: string, name: string): FileItem | undefined {
    const parent = this.nodeMap.get(parentId);
    if (!parent?.children) return undefined;

    const searchName = name.toLowerCase();
    return parent.children.find(
      (child) => child.name.toLowerCase() === searchName || child.id.toLowerCase() === searchName
    );
  }

  getPath(id: string): string {
    const node = this.nodeMap.get(id);
    if (!node) return '';

    const parts: string[] = [node.name];
    let current = node;

    while (current) {
      const parent = this.findParent(current.id);
      if (!parent || parent.id === 'root') break;
      parts.unshift(parent.name);
      current = parent;
    }

    return '/' + parts.join('/');
  }

  searchFiles(query: string, maxResults: number = 50): FileItem[] {
    if (!query.trim()) return [];

    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 1);

    if (terms.length === 0) return [];

    const resultSets = terms.map((term) => {
      const matches = new Set<FileItem>();
      for (const [indexTerm, files] of this.searchIndex.entries()) {
        if (indexTerm.includes(term)) {
          files.forEach((file) => matches.add(file));
        }
      }
      return matches;
    });

    if (resultSets.length === 0) return [];

    const intersection = Array.from(resultSets[0]).filter((item) =>
      resultSets.every((set) => set.has(item))
    );

    return intersection.slice(0, maxResults);
  }

  getRecentFiles(limit: number = 10): FileItem[] {
    return Array.from(this.nodeMap.values())
      .filter((node) => node.type === 'file' && node.modified)
      .sort((a, b) => {
        const dateA = new Date(a.modified!).getTime();
        const dateB = new Date(b.modified!).getTime();
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  getLargestFiles(limit: number = 10): FileItem[] {
    return Array.from(this.nodeMap.values())
      .filter((node) => node.type === 'file')
      .sort((a, b) => (b.size || 0) - (a.size || 0))
      .slice(0, limit);
  }

  getFilesByExtensions(extensions: string[]): FileItem[] {
    const normalizedExts = new Set(extensions.map((ext) => ext.toLowerCase()));
    return Array.from(this.nodeMap.values()).filter((node) => {
      if (node.type !== 'file') return false;
      const ext = this.getFileExtension(node.name);
      return normalizedExts.has(ext);
    });
  }

  private calculateSize(node: FileItem): number {
    if (node.type === 'file') return node.size || 0;
    const total = (node.children || []).reduce((acc, child) => acc + this.calculateSize(child), 0);
    node.size = total;
    return total;
  }

  private cacheNodes(node: FileItem): void {
    this.nodeMap.set(node.id, node);
    node.children?.forEach((child) => this.cacheNodes(child));
  }

  private buildSearchIndex(node: FileItem): void {
    const terms = node.name.toLowerCase().split(/[\s._-]+/);
    terms.forEach((term) => {
      if (term.length > 1) {
        if (!this.searchIndex.has(term)) {
          this.searchIndex.set(term, new Set());
        }
        this.searchIndex.get(term)!.add(node);
      }
    });
    node.children?.forEach((child) => this.buildSearchIndex(child));
  }

  private countFiles(node: FileItem): number {
    if (node.type === 'file') return 1;
    return (node.children || []).reduce((acc, child) => acc + this.countFiles(child), 0);
  }

  private findParent(childId: string): FileItem | undefined {
    for (const [, node] of this.nodeMap.entries()) {
      if (node.children?.some((child) => child.id === childId)) {
        return node;
      }
    }
    return undefined;
  }

  formatFileSize(bytes: number): string {
    if (this.sizeFormatCache.has(bytes)) {
      return this.sizeFormatCache.get(bytes)!;
    }

    const units = this.lang.t().units;
    let result: string;

    if (bytes === 0) result = `0 ${units.bytes}`;
    else if (bytes < 1024) result = `${bytes} ${units.bytes}`;
    else if (bytes < 1048576) result = `${(bytes / 1024).toFixed(1)} ${units.kb}`;
    else if (bytes < 1073741824) result = `${(bytes / 1048576).toFixed(1)} ${units.mb}`;
    else result = `${(bytes / 1073741824).toFixed(1)} ${units.gb}`;

    if (this.sizeFormatCache.size > 1000) {
      const firstKey = this.sizeFormatCache.keys().next().value;
      firstKey && this.sizeFormatCache.delete(firstKey);
    }

    this.sizeFormatCache.set(bytes, result);
    return result;
  }

  getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  getFilesByType(type: 'file' | 'folder'): FileItem[] {
    return Array.from(this.nodeMap.values()).filter((node) => node.type === type);
  }

  clearCache(): void {
    this.sizeFormatCache.clear();
  }

  getStats() {
    return {
      totalNodes: this.nodeMap.size,
      totalFiles: this.totalFiles(),
      totalSize: this.totalSize(),
      formattedSize: this.formatFileSize(this.totalSize()),
      cacheSize: this.sizeFormatCache.size,
      searchIndexSize: this.searchIndex.size,
      isLoaded: this.isLoaded(),
      isLoading: this.isLoading(),
      error: this.error(),
    };
  }
}
