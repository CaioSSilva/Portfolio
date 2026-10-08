import { TestBed } from '@angular/core/testing';
import { Gemini, GENAI_FACTORY, GenAIFactory } from './gemini';
import { LanguageService } from './language';

describe('Gemini', () => {
  let service: Gemini;
  let langService: LanguageService;
  let generateContentSpy: ReturnType<typeof vi.fn>;
  let generateContentStreamSpy: ReturnType<typeof vi.fn>;

  const makeFactory = (): GenAIFactory => {
    generateContentSpy = vi.fn().mockResolvedValue({
      response: { text: () => 'Mocked Hermes response' },
    });

    generateContentStreamSpy = vi.fn().mockResolvedValue({
      stream: (async function* () {
        yield { text: () => 'Hello ' };
        yield { text: () => 'World!' };
      })(),
    });

    return (_apiKey: string) => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: generateContentSpy,
        generateContentStream: generateContentStreamSpy,
      }),
    });
  };

  const makeFactoryWithFallback = (primaryError: Error): GenAIFactory => {
    generateContentSpy = vi
      .fn()
      .mockRejectedValueOnce(primaryError)
      .mockResolvedValue({ response: { text: () => 'Fallback response' } });

    generateContentStreamSpy = vi
      .fn()
      .mockRejectedValueOnce(primaryError)
      .mockResolvedValue({
        stream: (async function* () {
          yield { text: () => 'Fallback ' };
          yield { text: () => 'stream!' };
        })(),
      });

    return (_apiKey: string) => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: generateContentSpy,
        generateContentStream: generateContentStreamSpy,
      }),
    });
  };

  const makeFactoryBothFail = (error: Error): GenAIFactory => {
    generateContentSpy = vi.fn().mockRejectedValue(error);
    generateContentStreamSpy = vi.fn().mockRejectedValue(error);

    return (_apiKey: string) => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: generateContentSpy,
        generateContentStream: generateContentStreamSpy,
      }),
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

  it('should generateResponse with file attachment and history', async () => {
    const response = await service.generateResponse('Describe this image', 'Previous context', {
      mimeType: 'image/png',
      b64: 'base64data==',
    });
    expect(response).toBe('Mocked Hermes response');
    expect(generateContentSpy).toHaveBeenCalledWith([
      'Previous context',
      'Describe this image',
      { inlineData: { data: 'base64data==', mimeType: 'image/png' } },
    ]);
  });

  it('should generateResponseStream and call onChunk callback', async () => {
    const chunks: string[] = [];
    const response = await service.generateResponseStream('Stream test', '', undefined, (text) => {
      chunks.push(text);
    });

    expect(response).toBe('Hello World!');
    expect(chunks).toEqual(['Hello ', 'Hello World!']);
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

  describe('listModels', () => {
    const mockModelsResponse = {
      models: [
        {
          name: 'models/gemini-2.0-flash-lite',
          displayName: 'Gemini 2.0 Flash Lite',
          description: 'Fast and efficient',
          supportedGenerationMethods: ['generateContent'],
        },
        {
          name: 'models/gemini-1.5-pro',
          displayName: 'Gemini 1.5 Pro',
          description: 'Powerful model',
          supportedGenerationMethods: ['generateContent', 'countTokens'],
        },
        {
          name: 'models/text-embedding-004',
          displayName: 'Text Embedding',
          description: 'Embedding only',
          supportedGenerationMethods: ['embedContent'],
        },
      ],
    };

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return only models that support generateContent', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockModelsResponse,
      } as Response);

      const models = await service.listModels();
      expect(models.length).toBe(2);
      expect(models.map((m) => m.name)).toEqual(['gemini-2.0-flash-lite', 'gemini-1.5-pro']);
    });

    it('should strip "models/" prefix from name', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockModelsResponse,
      } as Response);

      const models = await service.listModels();
      expect(models[0].name).toBe('gemini-2.0-flash-lite');
    });

    it('should throw when fetch response is not ok', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({}),
      } as Response);

      await expect(service.listModels()).rejects.toThrow('Failed to list models: 403');
    });

    it('should return empty array when models list is empty', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ models: [] }),
      } as Response);

      const models = await service.listModels();
      expect(models).toEqual([]);
    });
  });

  describe('fallback to geminiApiKey2', () => {
    const apiError = new Error('API key exhausted');

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          Gemini,
          LanguageService,
          { provide: GENAI_FACTORY, useValue: makeFactoryWithFallback(apiError) },
        ],
      });
      service = TestBed.inject(Gemini);
    });

    it('generateResponse should retry with key2 and succeed', async () => {
      const response = await service.generateResponse('Hello', '', undefined);
      expect(response).toBe('Fallback response');
      expect(generateContentSpy).toHaveBeenCalledTimes(2);
    });

    it('generateResponseStream should retry with key2 and succeed', async () => {
      const chunks: string[] = [];
      const response = await service.generateResponseStream('Stream', '', undefined, (t) => chunks.push(t));
      expect(response).toBe('Fallback stream!');
      expect(generateContentStreamSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('both keys fail', () => {
    const apiError = new Error('All keys exhausted');

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          Gemini,
          LanguageService,
          { provide: GENAI_FACTORY, useValue: makeFactoryBothFail(apiError) },
        ],
      });
      service = TestBed.inject(Gemini);
    });

    it('generateResponse should throw after both keys fail', async () => {
      await expect(service.generateResponse('Hello', '', undefined)).rejects.toThrow('All keys exhausted');
    });

    it('generateResponseStream should throw after both keys fail', async () => {
      await expect(
        service.generateResponseStream('Stream', '', undefined, () => {})
      ).rejects.toThrow('All keys exhausted');
    });
  });
});
