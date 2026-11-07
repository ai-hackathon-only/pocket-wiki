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

// Bold then italic ('''x''' before ''x''). Quotes are escaped as &#39;.
function quotes(s) {
  s = s.replace(/&#39;&#39;&#39;(.+?)&#39;&#39;&#39;/g, '<b>$1</b>');
  return s.replace(/&#39;&#39;(.+?)&#39;&#39;/g, '<i>$1</i>');
}

// Inline markup on a line that is already escaped. Links become placeholders
// first, so bold/italic never touch an href and never cross a link boundary.
function inline(s, exists, normalize) {
  const links = [];
  const hold = html => '\u0000' + (links.push(html) - 1) + '\u0000';
  // Internal links [[Page]] / [[Page|text]]. Titles were escaped, so unescape for the href.
  s = s.replace(/\[\[([^\[\]|]+)(?:\|([^\[\]]*))?\]\]/g, (m, target, label) => {
    const title = normalize(unescapeHtml(target));
    if (!title) return m;
    const text = label !== undefined && label !== '' ? quotes(label) : target.trim();
    const cls = exists(title) ? 'wikilink' : 'wikilink new';
    const tip = exists(title) ? title : title + ' (page does not exist)';
    return hold(`<a class="${cls}" href="${pageHref(title)}" title="${escapeHtml(tip)}">${text}</a>`);
  });
  // External links [https://example.org text]; only http(s).
  s = s.replace(/\[(https?:\/\/[^\s\]]+)(?:\s+([^\]]+))?\]/g, (m, url, label) =>
    hold(`<a class="external" href="${url}" rel="noopener noreferrer" target="_blank">${label ? quotes(label) : url}</a>`));
  s = s.split(/(\u0000\d+\u0000)/).map((part, i) => (i % 2 ? part : quotes(part))).join('');
  return s.replace(/\u0000(\d+)\u0000/g, (m, n) => links[n]);
}

function unescapeHtml(s) {
  return s.replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[e]);
}

function splitCells(s) {
  const cells = [];
  let depth = 0, cur = '';
  for (let i = 0; i < s.length; i++) {
    if (s.startsWith('[[', i)) { depth++; cur += '[['; i++; continue; }
    if (s.startsWith(']]', i) && depth) { depth--; cur += ']]'; i++; continue; }
    if (!depth && s.startsWith('||', i)) { cells.push(cur); cur = ''; i++; continue; }
    cur += s[i];
  }
  cells.push(cur);
  return cells;
}

function slug(text) {
  return text.replace(/<[^>]*>/g, '').trim().replace(/\s+/g, '_');
}

// {{Name}} includes the page Template:Name; {{:Name}} includes the page Name.
// Runs on raw text before escaping, so included text is escaped like any other.
// A missing template becomes a red link; nesting stops at 5 levels and on loops.
export function expandTemplates(text, load, normalize = t => t.trim(), seen = []) {
  return String(text).replace(/\{\{([^{}|\n]+)\}\}/g, (m, name) => {
    const raw = name.trim();
    const title = normalize(raw.startsWith(':') ? raw.slice(1) : 'Template:' + raw);
    if (!title || title === 'Template:') return m;
    if (seen.includes(title)) return `''(template loop: ${title})''`;
    if (seen.length >= 5) return `''(templates nested too deep)''`;
    const body = load(title);
    if (body == null) return `[[${title}]]`;
    return expandTemplates(String(body).replace(/\n+$/, ''), load, normalize, [...seen, title]);
  });
}

export function render(text, { exists = () => true, normalize = t => t.trim(), load = null } = {}) {
  if (load) text = expandTemplates(text, load, normalize);
  const lines = escapeHtml(String(text).replace(/\u0000/g, '')).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let para = [];
  let lists = []; // stack of 'ul' | 'ol'
  let table = null; // { rows: [[{ th, html }]], caption } while inside {| ... |}

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

  // Tables: {| opens, |+ caption, |- new row, ! header cells (!! between),
  // | data cells (|| between), |} closes. Attributes are not supported.
  const closeTable = () => {
    if (!table) return;
    const rows = table.rows.filter(r => r.length);
    const label = table.caption ? table.caption.replace(/<[^>]*>/g, '').trim() : 'Table';
    // The wrapper scrolls on narrow screens, so it takes focus for keyboard scrolling.
    let html = `<div class="wiki-table-wrap" tabindex="0" role="region" aria-label="${label}">` + '<table class="wikitable">';
    if (table.caption) html += `<caption>${table.caption}</caption>`;
    html += rows.map(r => '<tr>' + r.map(c => `<${c.th ? 'th' : 'td'}>${c.html}</${c.th ? 'th' : 'td'}>`).join('') + '</tr>').join('');
    out.push(html + '</table></div>');
    table = null;
  };
  const tableLine = (line) => {
    const t = line.trim();
    if (t.startsWith('|}')) { closeTable(); return; }
    if (t.startsWith('|+')) { table.caption = inline(t.slice(2).trim(), exists, normalize); return; }
    if (t.startsWith('|-')) { table.rows.push([]); return; }
    const row = table.rows[table.rows.length - 1];
    if (t.startsWith('!')) {
      for (const c of t.slice(1).split('!!')) row.push({ th: true, html: inline(c.trim(), exists, normalize) });
    } else if (t.startsWith('|')) {
      // Split on || that is not inside [[ ]].
      for (const c of splitCells(t.slice(1))) row.push({ th: false, html: inline(c.trim(), exists, normalize) });
    } else if (t && row.length) {
      row[row.length - 1].html += ' ' + inline(t, exists, normalize); // continuation line
    }
  };

  for (const line of lines) {
    if (table) { tableLine(line); continue; }
    if (line.trim().startsWith('{|')) {
      closePara(); setLists([]);
      table = { rows: [[]], caption: '' };
      continue;
    }
    const h = line.match(/^(={2,6})\s*(.+?)\s*\1\s*$/);
    const li = line.match(/^([*#]+)\s*(.*)$/);
    if (h) {
      closePara(); setLists([]);
      const level = h[1].length;
      const body = inline(h[2], exists, normalize);
      out.push(`<h${level} id="h-${escapeHtml(slug(body))}">${body}</h${level}>`);
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
  closeTable(); closePara(); setLists([]);
  return out.join('\n');
}
