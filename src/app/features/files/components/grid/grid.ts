import { Component, inject, input, output } from '@angular/core';
import { FileItem, IMAGE_EXTENSIONS } from '../../../../core/models/file';
import { LanguageService } from '../../../../core/services/language';

@Component({
  selector: 'app-files-grid',
  imports: [],
  templateUrl: './grid.html',
  styleUrl: './grid.scss',
})
export class FilesGrid {
  lang = inject(LanguageService);
  files = input<FileItem[]>([]);
  selectedId = input<string | null>(null);
  gridSize = input<number>(110);
  onSelect = output<string>();
  onNavigate = output<FileItem>();

  readonly imageExtensions = IMAGE_EXTENSIONS;

  isImage(fileName: string): boolean {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return this.imageExtensions.includes(ext);
  }
}
