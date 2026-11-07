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

function slug(text) {
  return text.replace(/<[^>]*>/g, '').trim().replace(/\s+/g, '_');
}

function expandTemplates(text, resolveTemplate, normalize, seen = new Set(), depth = 0) {
  if (!resolveTemplate || depth >= 5) return text;
  return text.replace(/\{\{([^{}\n]+)\}\}/g, (match, rawName) => {
    const name = rawName.trim();
    if (!name) return match;
    const norm = normalize ? normalize(name) : name;
    if (seen.has(norm)) {
      return `[Template loop: ${norm}]`;
    }
    const templateContent = resolveTemplate(norm);
    if (templateContent === null || templateContent === undefined) {
      return match;
    }
    const nextSeen = new Set(seen);
    nextSeen.add(norm);
    return expandTemplates(templateContent, resolveTemplate, normalize, nextSeen, depth + 1);
  });
}

function cleanCell(raw) {
  let text = raw.trim();
  const pipePos = text.indexOf('|');
  if (pipePos > 0 && !text.startsWith('[[') && (text.slice(0, pipePos).includes('=') || /^(class|style|scope|width|colspan|rowspan)\b/i.test(text.slice(0, pipePos)))) {
    text = text.slice(pipePos + 1).trim();
  }
  return text;
}

export function render(text, { exists = () => true, normalize = t => t.trim(), resolveTemplate } = {}) {
  const expanded = expandTemplates(String(text).replace(/\u0000/g, ''), resolveTemplate, normalize);
  const lines = escapeHtml(expanded).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let para = [];
  let lists = []; // stack of 'ul' | 'ol'
  let inTable = false;
  let tableRows = [];
  let tableCaption = null;
  let tableClass = 'wikitable';
  let curRow = null;
  let curCell = null;

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

  const closeTableCell = () => {
    if (curCell && curRow) {
      curRow.push(curCell);
      curCell = null;
    }
  };

  const closeTableRow = () => {
    closeTableCell();
    if (curRow && curRow.length) {
      tableRows.push(curRow);
    }
    curRow = null;
  };

  const closeTable = () => {
    if (!inTable) return;
    closeTableRow();
    let html = `<div class="table-wrapper"><table class="${escapeHtml(tableClass)}">`;
    if (tableCaption) {
      html += `<caption>${tableCaption}</caption>`;
    }
    if (tableRows.length) {
      const hasOnlyHeaders = tableRows[0].every(c => c.isHeader);
      let startIdx = 0;
      if (hasOnlyHeaders) {
        html += '<thead><tr>';
        for (const c of tableRows[0]) {
          html += `<th>${c.content}</th>`;
        }
        html += '</tr></thead>';
        startIdx = 1;
      }
      if (startIdx < tableRows.length) {
        html += '<tbody>';
        for (let i = startIdx; i < tableRows.length; i++) {
          html += '<tr>';
          for (const c of tableRows[i]) {
            const tag = c.isHeader ? 'th' : 'td';
            html += `<${tag}>${c.content}</${tag}>`;
          }
          html += '</tr>';
        }
        html += '</tbody>';
      }
    }
    html += '</table></div>';
    out.push(html);
    inTable = false;
    tableRows = [];
    tableCaption = null;
    tableClass = 'wikitable';
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('{|')) {
      closePara(); setLists([]);
      if (inTable) closeTable();
      inTable = true;
      tableCaption = null;
      tableRows = [];
      curRow = null;
      curCell = null;
      const attr = trimmed.slice(2).trim();
      const classMatch = attr.match(/class=(?:&quot;|["'])(.*?)(?:&quot;|["'])/) || attr.match(/class=([^\s]+)/);
      tableClass = classMatch && classMatch[1] ? classMatch[1] : 'wikitable';
      continue;
    }

    if (inTable) {
      if (trimmed.startsWith('|}')) {
        closeTable();
        continue;
      }
      if (trimmed.startsWith('|+')) {
        closeTableCell();
        tableCaption = inline(trimmed.slice(2).trim(), exists, normalize);
        continue;
      }
      if (trimmed.startsWith('|-')) {
        closeTableRow();
        curRow = [];
        continue;
      }
      if (trimmed.startsWith('!')) {
        if (!curRow) curRow = [];
        closeTableCell();
        const parts = trimmed.slice(1).split('!!');
        for (let i = 0; i < parts.length - 1; i++) {
          curRow.push({ isHeader: true, content: inline(cleanCell(parts[i]), exists, normalize) });
        }
        curCell = { isHeader: true, content: inline(cleanCell(parts[parts.length - 1]), exists, normalize) };
        continue;
      }
      if (trimmed.startsWith('|')) {
        if (!curRow) curRow = [];
        closeTableCell();
        const parts = trimmed.slice(1).split('||');
        for (let i = 0; i < parts.length - 1; i++) {
          curRow.push({ isHeader: false, content: inline(cleanCell(parts[i]), exists, normalize) });
        }
        curCell = { isHeader: false, content: inline(cleanCell(parts[parts.length - 1]), exists, normalize) };
        continue;
      }
      if (curCell) {
        if (trimmed === '') {
          curCell.content += '<br>';
        } else {
          curCell.content += (curCell.content ? ' ' : '') + inline(trimmed, exists, normalize);
        }
        continue;
      }
      if (trimmed === '') continue;
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
  closePara(); setLists([]);
  if (inTable) closeTable();
  return out.join('\n');
}
