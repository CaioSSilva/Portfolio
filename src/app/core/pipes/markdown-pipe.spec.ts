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

  it('should convert **bold** to <strong>', () => {
    expect(pipe.transform('**hello**').toString()).toContain('<strong>hello</strong>');
  });

  it('should convert multiple bold spans', () => {
    const result = pipe.transform('**one** and **two**').toString();
    expect(result).toContain('<strong>one</strong>');
    expect(result).toContain('<strong>two</strong>');
  });

  it('should convert *italic* to <em>', () => {
    expect(pipe.transform('*hello*').toString()).toContain('<em>hello</em>');
  });

  it('should convert # heading to <h1>', () => {
    expect(pipe.transform('# Title').toString()).toContain('<h1>Title</h1>');
  });

  it('should convert ## heading to <h2>', () => {
    expect(pipe.transform('## Title').toString()).toContain('<h2>Title</h2>');
  });

  it('should convert ### heading to <h3>', () => {
    expect(pipe.transform('### Title').toString()).toContain('<h3>Title</h3>');
  });

  it('should convert #### heading to <h4>', () => {
    expect(pipe.transform('#### Title').toString()).toContain('<h4>Title</h4>');
  });

  it('should convert `inline code` to <code>', () => {
    expect(pipe.transform('`code`').toString()).toContain('<code>code</code>');
  });

  it('should convert fenced code block to <pre><code>', () => {
    const result = pipe.transform('```\nconst x = 1;\n```').toString();
    expect(result).toContain('<pre>');
    expect(result).toContain('<code>');
  });

  it('should escape HTML inside code blocks', () => {
    const result = pipe.transform('```\n<script>\n```').toString();
    expect(result).toContain('&lt;script&gt;');
    expect(result).not.toContain('<script>');
  });

  it('should convert - list items to <ul><li>', () => {
    const result = pipe.transform('- item one\n- item two').toString();
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>item one</li>');
    expect(result).toContain('<li>item two</li>');
  });

  it('should convert > blockquote to <blockquote>', () => {
    expect(pipe.transform('> quote').toString()).toContain('<blockquote>quote</blockquote>');
  });

  it('should convert --- to <hr>', () => {
    expect(pipe.transform('---').toString()).toContain('<hr>');
  });

  it('should convert markdown links to <a>', () => {
    const result = pipe.transform('[Google](https://google.com)').toString();
    expect(result).toContain('<a href="https://google.com"');
    expect(result).toContain('Google');
  });

  it('should convert newlines to <br>', () => {
    expect(pipe.transform('line1\nline2').toString()).toContain('<br>');
  });

  it('should apply bold and linebreak together', () => {
    const result = pipe.transform('**hello**\nworld').toString();
    expect(result).toContain('<strong>hello</strong>');
    expect(result).toContain('<br>');
  });

  it('should return original text when no markdown present', () => {
    expect(pipe.transform('plain text no markdown').toString()).toContain('plain text no markdown');
  });
});
