import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FilesGrid } from './grid';
import { FileSystem } from '../../../../core/services/file-system';
import { LanguageService } from '../../../../core/services/language';
import { NotificationService } from '../../../../core/services/notification';
import { Sound } from '../../../../core/services/sound';

describe('FilesGrid', () => {
  let component: FilesGrid;
  let fixture: ComponentFixture<FilesGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesGrid],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FileSystem,
        LanguageService,
        NotificationService,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
