import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FilesList } from './list';
import { FileSystem } from '../../../../core/services/file-system';
import { LanguageService } from '../../../../core/services/language';
import { NotificationService } from '../../../../core/services/notification';
import { Sound } from '../../../../core/services/sound';

describe('FilesList', () => {
  let component: FilesList;
  let fixture: ComponentFixture<FilesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FileSystem,
        LanguageService,
        NotificationService,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
