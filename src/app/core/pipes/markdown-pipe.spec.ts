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
    expect(pipe.transform(undefined as never)).toBe('');
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

  it('should convert # heading to <h1> with id', () => {
    expect(pipe.transform('# Title').toString()).toContain('<h1 id="title">Title</h1>');
  });

  it('should convert ## heading to <h2> with id', () => {
    expect(pipe.transform('## My Section').toString()).toContain(
      '<h2 id="my-section">My Section</h2>',
    );
  });

  it('should convert ### heading to <h3> with id', () => {
    expect(pipe.transform('### Sub Title').toString()).toContain(
      '<h3 id="sub-title">Sub Title</h3>',
    );
  });

  it('should convert #### heading to <h4> with id', () => {
    expect(pipe.transform('#### Deep Title').toString()).toContain(
      '<h4 id="deep-title">Deep Title</h4>',
    );
  });

  it('should slugify heading: lowercase and spaces to hyphens', () => {
    expect(pipe.transform('## Hello World').toString()).toContain('id="hello-world"');
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

  it('should convert anchor links [text](#id) to <a href="#id">', () => {
    const result = pipe.transform('[Overview](#overview)').toString();
    expect(result).toContain('<a href="#overview"');
    expect(result).toContain('Overview');
  });

  it('should convert relative links [text](path) to <a href="path">', () => {
    const result = pipe.transform('[Docs](./docs/readme.md)').toString();
    expect(result).toContain('<a href="./docs/readme.md"');
  });

  it('should not add target="_blank" to anchor links', () => {
    const result = pipe.transform('[Section](#section)').toString();
    expect(result).not.toContain('target="_blank"');
  });

  it('should convert ordered list to <ol><li>', () => {
    const result = pipe.transform('1. first\n2. second\n3. third').toString();
    expect(result).toContain('<ol>');
    expect(result).toContain('<li>first</li>');
    expect(result).toContain('<li>second</li>');
    expect(result).toContain('<li>third</li>');
    expect(result).toContain('</ol>');
  });

  it('should close ol and open ul when list types switch', () => {
    const result = pipe.transform('1. one\n- bullet').toString();
    expect(result).toContain('</ol>');
    expect(result).toContain('<ul>');
  });

  it('should close ul and open ol when list types switch', () => {
    const result = pipe.transform('- bullet\n1. one').toString();
    expect(result).toContain('</ul>');
    expect(result).toContain('<ol>');
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
