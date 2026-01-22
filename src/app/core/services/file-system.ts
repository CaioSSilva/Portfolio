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
  private readonly nots = inject(NotificationService);

  readonly tree = signal<FileItem | null>(null);
  readonly isLoaded = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly nodeMap = new Map<string, FileItem>();
  private readonly searchIndex = new Map<string, Set<FileItem>>();
  private readonly sizeFormatCache = new Map<number, string>();
  private loadPromise?: Promise<void>;

  readonly totalFiles = computed(() => this.countFiles(this.tree()));
  readonly totalSize = computed(() => this.tree()?.size || 0);

  async ensureLoaded(): Promise<void> {
    if (this.isLoaded() || this.loadPromise) return this.loadPromise;

    this.startLoading();

    this.loadPromise = lastValueFrom(this.http.get<{ root: FileItem }>('/data/fs.json'))
      .then((data) => this.initializeFileSystem(data.root))
      .catch(() => this.handleLoadError())
      .finally(() => this.isLoading.set(false));

    return this.loadPromise;
  }

  private initializeFileSystem(root: FileItem) {
    this.calculateSize(root);
    this.tree.set(root);
    this.processNodeRecursively(root);
    this.isLoaded.set(true);
  }

  private processNodeRecursively(node: FileItem) {
    this.nodeMap.set(node.id, node);
    this.updateSearchIndex(node);
    node.children?.forEach((child) => this.processNodeRecursively(child));
  }

  private updateSearchIndex(node: FileItem) {
    const terms = node.name
      .toLowerCase()
      .split(/[\s._-]+/)
      .filter((t) => t.length > 1);

    terms.forEach((term) => {
      if (!this.searchIndex.has(term)) this.searchIndex.set(term, new Set());
      this.searchIndex.get(term)!.add(node);
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
      .filter((t) => t.length > 1);
    if (terms.length === 0) return [];

    const resultSets = terms.map((term) => this.getMatchesForTerm(term));
    return this.intersectSets(resultSets).slice(0, maxResults);
  }

  private getMatchesForTerm(term: string): Set<FileItem> {
    const matches = new Set<FileItem>();
    for (const [indexTerm, files] of this.searchIndex.entries()) {
      if (indexTerm.includes(term)) files.forEach((f) => matches.add(f));
    }
    return matches;
  }

  private intersectSets(sets: Set<FileItem>[]): FileItem[] {
    if (sets.length === 0) return [];
    return Array.from(sets[0]).filter((item) => sets.every((s) => s.has(item)));
  }

  formatFileSize(bytes: number): string {
    const cached = this.sizeFormatCache.get(bytes);
    if (cached) return cached;

    const result = this.calculateFormattedSize(bytes);
    this.manageFormatCache(bytes, result);
    return result;
  }

  private calculateFormattedSize(bytes: number): string {
    const units = this.lang.t().units;
    if (bytes === 0) return `0 ${units.bytes}`;

    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = (bytes / Math.pow(k, i)).toFixed(1);
    const unitList = [units.bytes, units.kb, units.mb, units.gb];

    return `${size} ${unitList[i]}`;
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

  private findParent(childId: string): FileItem | undefined {
    return Array.from(this.nodeMap.values()).find((node) =>
      node.children?.some((child) => child.id === childId),
    );
  }

  private startLoading() {
    this.isLoading.set(true);
    this.error.set(null);
  }

  private handleLoadError() {
    this.nots.show({
      title: this.lang.t().errors.systemError,
      message: this.lang.t().errors.enableToLoadFs,
      icon: 'fa circle-exclamation',
    });
  }

  private manageFormatCache(key: number, value: string) {
    if (this.sizeFormatCache.size > 1000) {
      const firstKey = this.sizeFormatCache.keys().next().value;
      if (firstKey !== undefined) this.sizeFormatCache.delete(firstKey);
    }
    this.sizeFormatCache.set(key, value);
  }

  getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }

  getFilesByExtensions(extensions: string[]): FileItem[] {
    const targetExts = new Set(extensions.map((ext) => ext.toLowerCase()));

    return Array.from(this.nodeMap.values()).filter(
      (node) => node.type === 'file' && targetExts.has(this.getFileExtension(node.name)),
    );
  }

  downloadFile(path: string, name: string) {
    if (!path || !name) return;
    const a = document.createElement('a');
    a.href = path;
    a.download = name;
    a.click();
  }
}
