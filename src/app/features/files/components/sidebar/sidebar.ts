import { Component, input, output, inject } from '@angular/core';
import { FileItem } from '../../../../core/models/file';
import { NgTemplateOutlet } from '@angular/common';
import { LanguageService } from '../../../../core/services/language';

@Component({
  selector: 'app-files-sidebar',
  imports: [NgTemplateOutlet],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class FilesSidebar {
  tree = input<FileItem | null>(null);
  width = input(240);
  currentFolderId = input<string>('');
  selectedId = input<string | null>(null);
  expandedFolders = input<Set<string>>(new Set());

  lang = inject(LanguageService);

  onNavigate = output<FileItem>();
  onToggle = output<string>();

  isSelected(item: FileItem) {
    return item.type === 'file'
      ? this.selectedId() === item.id
      : this.currentFolderId() === item.id;
  }

  isExpanded(id: string) {
    return this.expandedFolders().has(id);
  }
}
