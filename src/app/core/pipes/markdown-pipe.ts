import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string): SafeHtml {
    if (!value) return '';

    let html = this.sanitizeAndNormalise(value);
    html = this.applyHeadingsAndInlines(html);
    html = this.renderLists(html);
    html = this.collapseLineBreaks(html);

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private sanitizeAndNormalise(value: string): string {
    const codeBlocks: string[] = [];
    let html = value.replace(/```[\w]*\n?([\s\S]*?)```/g, (match, code) => {
      const placeholder = `\x00CODEBLOCK${codeBlocks.length}\x00`;
      codeBlocks.push(`<pre><code>${this.escapeHtml(code.trim())}</code></pre>`);
      return placeholder;
    });

    html = html.replace(/<br\s*\/?>/gi, '\n');
    html = html.replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**');
    html = html.replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**');
    html = html.replace(/<i>([\s\S]*?)<\/i>/gi, '*$1*');
    html = html.replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*');
    html = html.replace(/<[^>]+>/g, '');

    codeBlocks.forEach((block, index) => {
      html = html.replace(`\x00CODEBLOCK${index}\x00`, block);
    });
    return html;
  }

  private applyHeadingsAndInlines(html: string): string {
    let text = this.applyHeadings(html);
    text = this.applyInlineStyles(text);
    return this.applyLinks(text);
  }

  private applyHeadings(html: string): string {
    let text = html.replace(
      /^#### (.+)$/gm,
      (match, title) => `<h4 id="${this.slugify(title)}">${title}</h4>`,
    );
    text = text.replace(
      /^### (.+)$/gm,
      (match, title) => `<h3 id="${this.slugify(title)}">${title}</h3>`,
    );
    text = text.replace(
      /^## (.+)$/gm,
      (match, title) => `<h2 id="${this.slugify(title)}">${title}</h2>`,
    );
    text = text.replace(
      /^# (.+)$/gm,
      (match, title) => `<h1 id="${this.slugify(title)}">${title}</h1>`,
    );
    text = text.replace(/^---+$/gm, '<hr>');
    return text.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  }

  private applyInlineStyles(html: string): string {
    let text = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    text = text.replace(/(?<!`)``([^`\n]+)``(?!`)/g, '<code>$1</code>');
    return text.replace(/(?<!`)(`(?!`))([^`\n]+)`(?!`)/g, '<code>$2</code>');
  }

  private applyLinks(html: string): string {
    const linked = html.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>',
    );
    return linked.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, href) => {
      const lower = href.toLowerCase().trim();
      if (
        lower.startsWith('javascript:') ||
        lower.startsWith('vbscript:') ||
        lower.startsWith('data:')
      ) {
        return text;
      }
      return `<a href="${href}">${text}</a>`;
    });
  }

  private renderLists(html: string): string {
    const lines = html.split('\n');
    const out: string[] = [];
    let state = { inList: false, inOl: false };

    for (const line of lines) {
      state = this.processListLine(line, out, state);
    }

    if (state.inList) out.push('</ul>');
    if (state.inOl) out.push('</ol>');
    return out.join('\n');
  }

  private processListLine(
    line: string,
    out: string[],
    state: { inList: boolean; inOl: boolean },
  ): { inList: boolean; inOl: boolean } {
    const ulMatch = line.match(/^[-*] (.+)/);
    const olMatch = line.match(/^\d+\. (.+)/);

    if (ulMatch) {
      if (state.inOl) out.push('</ol>');
      if (!state.inList) out.push('<ul>');
      out.push(`<li>${ulMatch[1]}</li>`);
      return { inList: true, inOl: false };
    }
    if (olMatch) {
      if (state.inList) out.push('</ul>');
      if (!state.inOl) out.push('<ol>');
      out.push(`<li>${olMatch[1]}</li>`);
      return { inList: false, inOl: true };
    }
    if (state.inList) out.push('</ul>');
    if (state.inOl) out.push('</ol>');
    out.push(line);
    return { inList: false, inOl: false };
  }

  private collapseLineBreaks(html: string): string {
    html = html.replace(
      /(?<!<\/(?:h[1-4]|li|blockquote|pre|ul|ol|hr)>)\n(?!<(?:h[1-4]|li|blockquote|pre|ul|ol|hr))/g,
      '<br>',
    );
    return html.replace(/(<br>\s*){2,}/g, '<br><br>');
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\u00C0-\u024F -]/g, '-')
      .replace(/ /g, '-')
      .replace(/-+/g, '-')
      .replace(/-$/g, '');
  }

  private escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
