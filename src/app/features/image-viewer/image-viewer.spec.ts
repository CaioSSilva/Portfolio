import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ImageViewer } from './image-viewer';
import { LanguageService } from '../../core/services/language';
import { Apps } from '../../core/services/apps';
import { FileSystem } from '../../core/services/file-system';
import { Sound } from '../../core/services/sound';
import { AppRegistry } from '../../core/services/app-registry';
import { AppLauncher } from '../../core/services/app-launcher';
import { ContextMenuService } from '../../core/services/context-menu';

describe('ImageViewer', () => {
  let component: ImageViewer;
  let fixture: ComponentFixture<ImageViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageViewer],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LanguageService,
        Apps,
        FileSystem,
        AppRegistry,
        AppLauncher,
        ContextMenuService,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
