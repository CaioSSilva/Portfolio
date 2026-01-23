import { Component, inject } from '@angular/core';
import { DesktopIconsService } from '../../core/services/desktop-icons';
import { Apps } from '../../core/services/apps';

@Component({
  selector: 'app-desktop-icons',
  imports: [],
  templateUrl: './desktop-icons.html',
  styleUrl: './desktop-icons.scss',
})
export class DesktopIcons {
  desktop = inject(DesktopIconsService);
  appsService = inject(Apps);
}
