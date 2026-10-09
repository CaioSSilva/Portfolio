import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { FileItem } from '../../../../core/models/file';
import { NgTemplateOutlet } from '@angular/common';
import { LanguageService } from '../../../../core/services/language';

@Component({
  selector: 'app-files-sidebar',
  imports: [NgTemplateOutlet],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sidebar.scss',
})
export class FilesSidebar {
  readonly lang = inject(LanguageService);

  readonly tree = input<FileItem | null>(null);
  readonly width = input(240);
  readonly currentFolderId = input<string>('');
  readonly selectedId = input<string | null>(null);
  readonly expandedFolders = input<Set<string>>(new Set());
  readonly onNavigate = output<FileItem>();
  readonly onToggle = output<string>();

  isSelected(item: FileItem): boolean {
    return item.type === 'file'
      ? this.selectedId() === item.id
      : this.currentFolderId() === item.id;
  }

  isExpanded(id: string): boolean {
    return this.expandedFolders().has(id);
  }

  getFileLabel(id: string, fallback: string): string {
    return (this.lang.t().files as Record<string, string>)[id.toLowerCase()] || fallback;
  }
}
