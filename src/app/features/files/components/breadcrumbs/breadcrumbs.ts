import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-files-breadcrumbs',
  imports: [],
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.scss',
})
export class FilesBreadcrumbs {
  items = input<{ id: string; name: string }[]>([]);
  onJump = output<number>();
}
