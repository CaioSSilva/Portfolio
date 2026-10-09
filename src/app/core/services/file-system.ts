import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { FileItem } from '../models/file';
import { LanguageService } from './language';
import { NotificationService } from './notification';

@Injectable({ providedIn: 'root' })
export class FileSystem {
  private readonly http = inject(HttpClient);
  private readonly lang = inject(LanguageService);
  private readonly notifications = inject(NotificationService);

  readonly tree = signal<FileItem | null>(null);
  readonly isLoaded = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly totalFiles = computed(() => this.countFiles(this.tree()));
  readonly totalSize = computed(() => this.tree()?.size || 0);

  private readonly nodeMap = new Map<string, FileItem>();
  private readonly parentMap = new Map<string, string>();
  private readonly urlMap = new Map<string, FileItem>();
  private readonly searchIndex = new Map<string, Set<FileItem>>();
  private readonly sizeFormatCache = new Map<string, string>();
  private loadPromise?: Promise<void>;

  async ensureLoaded(): Promise<void> {
    if (this.isLoaded()) return;
    if (this.loadPromise) return this.loadPromise;

    this.startLoading();

    this.loadPromise = lastValueFrom(this.http.get<{ root: FileItem }>('/data/fs.json'))
      .then((data) => this.initializeFileSystem(data.root))
      .catch(() => this.handleLoadError())
      .finally(() => this.isLoading.set(false));

    return this.loadPromise;
  }

  private initializeFileSystem(root: FileItem): void {
    this.calculateSize(root);
    this.tree.set(root);
    this.processNodeRecursively(root);
    this.isLoaded.set(true);
  }

  private processNodeRecursively(node: FileItem): void {
    this.nodeMap.set(node.id, node);
    if (node.url) this.urlMap.set(node.url, node);
    this.updateSearchIndex(node);
    node.children?.forEach((child) => {
      this.parentMap.set(child.id, node.id);
      this.processNodeRecursively(child);
    });
  }

  private updateSearchIndex(node: FileItem): void {
    const terms = node.name
      .toLowerCase()
      .split(/[\s._-]+/)
      .filter((term) => term.length > 1);

    terms.forEach((term) => {
      const existing = this.searchIndex.get(term);
      if (existing) {
        existing.add(node);
      } else {
        this.searchIndex.set(term, new Set<FileItem>([node]));
      }
    });
  }

  getNode(id: string): FileItem | undefined {
    return this.nodeMap.get(id);
  }

  getChildren(id: string): FileItem[] {
    return this.getNode(id)?.children || [];
  }

  getFolderName(id: string): string {
    return this.getNode(id)?.name || id;
  }

  getPath(id: string): string {
    const node = this.getNode(id);
    if (!node) return '';

    const parts: string[] = [];
    let current: FileItem | undefined = node;

    while (current && current.id !== 'root') {
      parts.unshift(current.name);
      current = this.findParent(current.id);
    }

    return `/${parts.join('/')}`;
  }

  searchFiles(query: string, maxResults = 50): FileItem[] {
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 1);
    if (terms.length === 0) return [];

    const resultSets = terms.map((term) => this.getMatchesForTerm(term));
    return this.intersectSets(resultSets).slice(0, maxResults);
  }

  private getMatchesForTerm(term: string): Set<FileItem> {
    const matches = new Set<FileItem>();
    for (const [indexTerm, files] of this.searchIndex.entries()) {
      if (indexTerm.includes(term)) files.forEach((file) => matches.add(file));
    }
    return matches;
  }

  private intersectSets(sets: Set<FileItem>[]): FileItem[] {
    if (sets.length === 0) return [];
    return Array.from(sets[0]).filter((item) => sets.every((set) => set.has(item)));
  }

  formatFileSize(bytes: number): string {
    const cacheKey = `${bytes}_${this.lang.currentLang()}`;
    const cached = this.sizeFormatCache.get(cacheKey);
    if (cached) return cached;

    const result = this.calculateFormattedSize(bytes);
    this.manageFormatCache(cacheKey, result);
    return result;
  }

  private calculateFormattedSize(bytes: number): string {
    const units = this.lang.t().units;
    if (bytes === 0) return `0 ${units.bytes}`;

    const unitList = [units.bytes, units.kb, units.mb, units.gb];
    const unitIndex = Math.min(Math.floor(Math.log2(bytes) / 10), unitList.length - 1);
    const size = (bytes / (1 << (unitIndex * 10))).toFixed(1);

    return `${size} ${unitList[unitIndex]}`;
  }

  private calculateSize(node: FileItem): number {
    if (node.type === 'file') return node.size || 0;
    node.size = (node.children || []).reduce((acc, child) => acc + this.calculateSize(child), 0);
    return node.size;
  }

  private countFiles(node: FileItem | null): number {
    if (!node) return 0;
    return node.type === 'file'
      ? 1
      : (node.children || []).reduce((acc, child) => acc + this.countFiles(child), 0);
  }

  getParentId(childId: string): string | undefined {
    return this.parentMap.get(childId);
  }

  private findParent(childId: string): FileItem | undefined {
    const parentId = this.parentMap.get(childId);
    return parentId ? this.nodeMap.get(parentId) : undefined;
  }

  private startLoading(): void {
    this.isLoading.set(true);
    this.error.set(null);
  }

  private handleLoadError(): void {
    this.error.set('load_failed');
    this.loadPromise = undefined;
    const errors = this.lang.t().errors;
    this.notifications.show({
      title: errors.systemError,
      message: errors.enableToLoadFs,
      icon: 'fas fa-circle-exclamation',
    });
  }

  private manageFormatCache(key: string, value: string): void {
    if (this.sizeFormatCache.size > 1000) {
      const firstKey = this.sizeFormatCache.keys().next().value;
      if (firstKey !== undefined) this.sizeFormatCache.delete(firstKey);
    }
    this.sizeFormatCache.set(key, value);
  }

  getFileExtension(fileName: string): string {
    const dot = fileName.lastIndexOf('.');
    return dot === -1 ? '' : fileName.slice(dot + 1).toLowerCase();
  }

  getFilesByExtensions(extensions: string[]): FileItem[] {
    const targetExts = new Set(extensions.map((ext) => ext.toLowerCase()));

    return Array.from(this.nodeMap.values()).filter(
      (node) => node.type === 'file' && targetExts.has(this.getFileExtension(node.name)),
    );
  }

  getSiblingsByUrl(url: string, extensions: string[]): FileItem[] {
    const targetExts = new Set(extensions.map((ext) => ext.toLowerCase()));
    const targetNode = this.urlMap.get(url);
    if (!targetNode) return this.getFilesByExtensions(extensions);

    const parent = this.findParent(targetNode.id);
    const siblings = parent ? (parent.children ?? []) : [targetNode];

    return siblings.filter(
      (node) => node.type === 'file' && targetExts.has(this.getFileExtension(node.name)),
    );
  }

  downloadFile(path: string, name: string): void {
    if (!path || !name) return;
    const anchor = document.createElement('a');
    anchor.href = path;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}
