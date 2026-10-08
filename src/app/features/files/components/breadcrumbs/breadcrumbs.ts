import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-files-breadcrumbs',
  imports: [],
  templateUrl: './breadcrumbs.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './breadcrumbs.scss',
})
export class FilesBreadcrumbs {
  readonly items = input<{ id: string; name: string }[]>([]);
  readonly onJump = output<number>();
}
