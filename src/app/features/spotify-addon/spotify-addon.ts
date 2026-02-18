import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spotify-addon',
  imports: [],
  templateUrl: './spotify-addon.html',
  styleUrl: './spotify-addon.scss',
})
export class SpotifyAddon {
  isNotificationCenterOpen = input.required<boolean>();
}
