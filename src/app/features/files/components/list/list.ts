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
  readonly fileSystem = inject(FileSystem);
  readonly lang = inject(LanguageService);
  readonly files = input<FileItem[]>([]);
  readonly selectedId = input<string | null>(null);
  readonly onSelect = output<string>();
  readonly onNavigate = output<FileItem>();
}
