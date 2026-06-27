import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-files-breadcrumbs',
  imports: [],
  templateUrl: './breadcrumbs.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './breadcrumbs.scss',
})
export class FilesBreadcrumbs {
  items = input<{ id: string; name: string }[]>([]);
  onJump = output<number>();
}
