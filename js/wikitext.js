// Wikitext subset -> HTML. All page text is HTML-escaped first,
// so markup can only produce the tags this file writes.
// exists(title) decides blue or red internal links.

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

export function pageHref(title) {
  const special = title.match(/^Special:(.+)$/);
  if (special) return '#/special/' + encodeURIComponent(special[1].replace(/ /g, ''));
  return '#/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
}

// Inline markup on a line that is already escaped.
function inline(s, exists, normalize) {
  // Internal links [[Page]] / [[Page|text]]. Titles were escaped, so unescape for the href.
  s = s.replace(/\[\[([^\[\]|]+)(?:\|([^\[\]]*))?\]\]/g, (m, target, label) => {
    const raw = unescapeHtml(target);
    const title = normalize(raw);
    if (!title) return m;
    const text = label !== undefined && label !== '' ? label : target.trim();
    const cls = exists(title) ? 'wikilink' : 'wikilink new';
    const tip = exists(title) ? title : title + ' (page does not exist)';
    return `<a class="${cls}" href="${pageHref(title)}" title="${escapeHtml(tip)}">${text}</a>`;
  });
  // External links [https://example.org text]; only http(s).
  s = s.replace(/\[(https?:\/\/[^\s\]]+)(?:\s+([^\]]+))?\]/g, (m, url, label) =>
    `<a class="external" href="${url}" rel="noopener noreferrer" target="_blank">${label || url}</a>`);
  // Bold then italic ('''x''' before ''x''). Quotes are escaped as &#39;.
  s = s.replace(/&#39;&#39;&#39;(.+?)&#39;&#39;&#39;/g, '<b>$1</b>');
  s = s.replace(/&#39;&#39;(.+?)&#39;&#39;/g, '<i>$1</i>');
  return s;
}

function unescapeHtml(s) {
  return s.replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[e]);
}

function slug(text) {
  return text.replace(/<[^>]*>/g, '').trim().replace(/\s+/g, '_');
}

export function render(text, { exists = () => true, normalize = t => t.trim() } = {}) {
  const lines = escapeHtml(text).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let para = [];
  let lists = []; // stack of 'ul' | 'ol'

  const closePara = () => {
    if (para.length) out.push('<p>' + para.join(' ') + '</p>');
    para = [];
  };
  const setLists = (want) => {
    // Pop until the stack is a prefix of want, then push the rest.
    let i = 0;
    while (i < lists.length && i < want.length && lists[i] === want[i]) i++;
    while (lists.length > i) out.push(`</li></${lists.pop()}>`);
    if (lists.length === want.length && want.length) out.push('</li>');
    while (lists.length < want.length) {
      const t = want[lists.length];
      out.push(`<${t}>`);
      lists.push(t);
    }
  };

  for (const line of lines) {
    const h = line.match(/^(={2,6})\s*(.+?)\s*\1\s*$/);
    const li = line.match(/^([*#]+)\s*(.*)$/);
    if (h) {
      closePara(); setLists([]);
      const level = h[1].length;
      const body = inline(h[2], exists, normalize);
      out.push(`<h${level} id="${escapeHtml(slug(body))}">${body}</h${level}>`);
    } else if (li) {
      closePara();
      setLists([...li[1]].map(c => (c === '*' ? 'ul' : 'ol')));
      out.push('<li>' + inline(li[2], exists, normalize));
    } else if (line.trim() === '') {
      closePara(); setLists([]);
    } else {
      setLists([]);
      para.push(inline(line, exists, normalize));
    }
  }
  closePara(); setLists([]);
  return out.join('\n');
}
