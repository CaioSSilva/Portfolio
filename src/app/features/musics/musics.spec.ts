import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Musics } from './musics';
import { LanguageService } from '../../core/services/language';
import { FileSystem } from '../../core/services/file-system';
import { Apps } from '../../core/services/apps';
import { Sound } from '../../core/services/sound';
import { AudioPlayer } from './player/audio-player';

describe('Musics', () => {
  let component: Musics;
  let fixture: ComponentFixture<Musics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Musics],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LanguageService,
        FileSystem,
        Apps,
        AudioPlayer,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Musics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
