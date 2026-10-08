import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(value: string): SafeHtml {
    if (!value) return '';

    let html = value;

    const codeBlocks: string[] = [];
    html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) => {
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

    codeBlocks.forEach((block, i) => {
      html = html.replace(`\x00CODEBLOCK${i}\x00`, block);
    });

    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    html = html.replace(/^---+$/gm, '<hr>');

    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    html = html.replace(/(?<!`)``?(?!`)([^`\n]+)``?(?!`)/g, '<code>$1</code>');

    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    const lines = html.split('\n');
    const out: string[] = [];
    let inList = false;

    for (const line of lines) {
      const listMatch = line.match(/^[-*] (.+)/);
      if (listMatch) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push(`<li>${listMatch[1]}</li>`);
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(line);
      }
    }
    if (inList) out.push('</ul>');
    html = out.join('\n');

    html = html.replace(/(?<!<\/(?:h[1-4]|li|blockquote|pre|ul|hr)>)\n(?!<(?:h[1-4]|li|blockquote|pre|ul|hr))/g, '<br>');

    html = html.replace(/(<br>\s*){2,}/g, '<br><br>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
