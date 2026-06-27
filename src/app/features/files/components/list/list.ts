import { Component, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FileItem } from '../../../../core/models/file';
import { FileSystem } from '../../../../core/services/file-system';
import { LanguageService } from '../../../../core/services/language';

@Component({
  selector: 'app-files-list',
  imports: [],
  templateUrl: './list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './list.scss',
})
export class FilesList {
  public fs = inject(FileSystem);
  lang = inject(LanguageService);
  files = input<FileItem[]>([]);
  selectedId = input<string | null>(null);
  onSelect = output<string>();
  onNavigate = output<FileItem>();
}
