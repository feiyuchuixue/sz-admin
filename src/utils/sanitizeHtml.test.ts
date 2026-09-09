// @vitest-environment jsdom

import { describe, expect, test } from 'vitest';
import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  test('removes executable tags, event handlers and unsafe URLs', () => {
    const result = sanitizeHtml(
      '<p onclick="run()">正文</p><script>alert(1)</script><iframe src="https://example.com"></iframe><a href="javascript:run()">链接</a>'
    );

    expect(result).toContain('<p>正文</p>');
    expect(result).not.toMatch(/script|iframe|onclick|javascript:/i);
  });

  test('keeps ordinary rich text content', () => {
    const result = sanitizeHtml('<h2>标题</h2><p><strong>正文</strong></p><table><tbody><tr><td>内容</td></tr></tbody></table>');

    expect(result).toContain('<h2>标题</h2>');
    expect(result).toContain('<strong>正文</strong>');
    expect(result).toContain('<td>内容</td>');
  });
});
