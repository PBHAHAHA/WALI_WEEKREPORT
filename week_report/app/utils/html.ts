/**
 * 将 HTML 字符串转换为纯文本
 */
export function stripHtml(html: string): string {
  if (!html) return ''
  // 移除 HTML 标签
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
