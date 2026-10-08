import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DesktopIconsService } from '../../core/services/desktop-icons';
import { Apps } from '../../core/services/apps';
import { Settings } from '../../core/services/settings';

@Component({
  selector: 'app-desktop-icons',
  imports: [],
  templateUrl: './desktop-icons.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './desktop-icons.scss',
})
export class DesktopIcons {
  readonly desktop = inject(DesktopIconsService);
  readonly appsService = inject(Apps);
  readonly settings = inject(Settings);
}
