import { TestBed } from '@angular/core/testing';
import { Gemini, GENAI_FACTORY, GenAIFactory } from './gemini';
import { LanguageService } from './language';

describe('Gemini', () => {
  let service: Gemini;
  let langService: LanguageService;
  let generateContentSpy: ReturnType<typeof vi.fn>;

  const makeFactory = (): GenAIFactory => {
    generateContentSpy = vi.fn().mockResolvedValue({
      response: { text: () => 'Mocked Hermes response' },
    });

    return (_apiKey: string) => ({
      getGenerativeModel: vi.fn().mockReturnValue({ generateContent: generateContentSpy }),
    });
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Gemini,
        LanguageService,
        { provide: GENAI_FACTORY, useValue: makeFactory() },
      ],
    });
    service = TestBed.inject(Gemini);
    langService = TestBed.inject(LanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generateResponse and return text from AI', async () => {
    const response = await service.generateResponse('Hello Hermes', '', undefined);
    expect(response).toBe('Mocked Hermes response');
    expect(generateContentSpy).toHaveBeenCalledWith(['Hello Hermes']);
  });

  it('should generateResponse with file attachment', async () => {
    const response = await service.generateResponse('Describe this image', '', {
      mimeType: 'image/png',
      b64: 'base64data==',
    });
    expect(response).toBe('Mocked Hermes response');
    expect(generateContentSpy).toHaveBeenCalledWith([
      'Describe this image',
      { inlineData: { data: 'base64data==', mimeType: 'image/png' } },
    ]);
  });

  it('should use pt system instruction when language is pt', async () => {
    langService.setLanguage('pt');
    const response = await service.generateResponse('Olá', '', undefined);
    expect(response).toBe('Mocked Hermes response');
    expect(generateContentSpy).toHaveBeenCalled();
  });

  it('should use en system instruction when language is en', async () => {
    langService.setLanguage('en');
    const response = await service.generateResponse('Hello', '', undefined);
    expect(response).toBe('Mocked Hermes response');
    expect(generateContentSpy).toHaveBeenCalled();
  });
});
