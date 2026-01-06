import { TestBed } from '@angular/core/testing';

import { AudioPlayer } from './audio-player';
describe('AudioPlayer', () => {
  let service: AudioPlayer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioPlayer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
