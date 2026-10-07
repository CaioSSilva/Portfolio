import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { MarkdownPipe } from './markdown-pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MarkdownPipe],
    });
    pipe = TestBed.inject(MarkdownPipe);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string when value is falsy (empty string)', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should return empty string when value is null-like (undefined coerced)', () => {
    expect(pipe.transform(undefined as unknown as string)).toBe('');
  });

  it('should convert **bold** markdown to <b> HTML tags', () => {
    const result = pipe.transform('**hello**');
    expect(result.toString()).toContain('<b>hello</b>');
  });

  it('should convert multiple bold spans', () => {
    const result = pipe.transform('**one** and **two**');
    expect(result.toString()).toContain('<b>one</b>');
    expect(result.toString()).toContain('<b>two</b>');
  });

  it('should convert newlines to <br> tags', () => {
    const result = pipe.transform('line1\nline2');
    expect(result.toString()).toContain('<br>');
  });

  it('should apply both bold and linebreak transformations together', () => {
    const result = pipe.transform('**hello**\nworld');
    expect(result.toString()).toContain('<b>hello</b>');
    expect(result.toString()).toContain('<br>');
  });

  it('should return the original text when no markdown present', () => {
    const result = pipe.transform('plain text no markdown');
    expect(result.toString()).toContain('plain text no markdown');
  });
});
