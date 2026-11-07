// diff.js — Line-by-line diff computation and HTML rendering
// Uses Myers diff algorithm with common prefix/suffix optimization.
// Zero external dependencies.

export function computeDiff(textA, textB) {
  if (textA === textB) {
    return (textA === '' ? [] : textA.split('\n')).map(text => ({ type: 'eq', text }));
  }
  const a = textA === '' ? [] : textA.split('\n');
  const b = textB === '' ? [] : textB.split('\n');
  const n = a.length;
  const m = b.length;

  let start = 0;
  while (start < n && start < m && a[start] === b[start]) start++;

  let endA = n - 1;
  let endB = m - 1;
  while (endA >= start && endB >= start && a[endA] === b[endB]) {
    endA--;
    endB--;
  }

  const prefix = a.slice(0, start).map(text => ({ type: 'eq', text }));
  const suffix = a.slice(endA + 1).map(text => ({ type: 'eq', text }));

  const midA = a.slice(start, endA + 1);
  const midB = b.slice(start, endB + 1);
  const midN = midA.length;
  const midM = midB.length;

  if (midN === 0) {
    const added = midB.map(text => ({ type: 'add', text }));
    return [...prefix, ...added, ...suffix];
  }
  if (midM === 0) {
    const deleted = midA.map(text => ({ type: 'del', text }));
    return [...prefix, ...deleted, ...suffix];
  }

  const max = midN + midM;
  const offset = max;
  const v = new Int32Array(2 * max + 1);
  v.fill(-1);
  v[offset + 1] = 0;
  const trace = [];

  let reached = false;
  for (let d = 0; d <= max; d++) {
    trace.push(new Int32Array(v));
    for (let k = -d; k <= d; k += 2) {
      let x;
      if (k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1])) {
        x = v[offset + k + 1];
      } else {
        x = v[offset + k - 1] + 1;
      }
      let y = x - k;
      while (x < midN && y < midM && midA[x] === midB[y]) {
        x++;
        y++;
      }
      v[offset + k] = x;
      if (x >= midN && y >= midM) {
        reached = true;
        break;
      }
    }
    if (reached) break;
  }

  let x = midN;
  let y = midM;
  const midEdits = [];

  for (let d = trace.length - 1; d > 0; d--) {
    const prevV = trace[d];
    const k = x - y;
    let prevK;
    if (k === -d || (k !== d && prevV[offset + k - 1] < prevV[offset + k + 1])) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }
    const prevX = prevV[offset + prevK];
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) {
      midEdits.unshift({ type: 'eq', text: midA[x - 1] });
      x--;
      y--;
    }
    if (d > 0) {
      if (x === prevX) {
        midEdits.unshift({ type: 'add', text: midB[prevY] });
        y--;
      } else if (y === prevY) {
        midEdits.unshift({ type: 'del', text: midA[prevX] });
        x--;
      }
    }
  }
  while (x > 0 && y > 0) {
    midEdits.unshift({ type: 'eq', text: midA[x - 1] });
    x--;
    y--;
  }

  return [...prefix, ...midEdits, ...suffix];
}

export function renderDiffHtml(diffRows, escapeHtml) {
  let oldLine = 1;
  let newLine = 1;
  let additions = 0;
  let deletions = 0;

  const rowsHtml = diffRows.map(row => {
    if (row.type === 'add') {
      additions++;
      const currentNew = newLine;
      newLine++;
      return `<tr class="diff-row diff-row-add">
        <td class="diff-num" aria-hidden="true"></td>
        <td class="diff-num">${currentNew}</td>
        <td class="diff-marker" aria-hidden="true">+</td>
        <td class="diff-content"><span class="visually-hidden">Added line ${currentNew}: </span><code>${escapeHtml(row.text)}</code></td>
      </tr>`;
    } else if (row.type === 'del') {
      deletions++;
      const currentOld = oldLine;
      oldLine++;
      return `<tr class="diff-row diff-row-del">
        <td class="diff-num">${currentOld}</td>
        <td class="diff-num" aria-hidden="true"></td>
        <td class="diff-marker" aria-hidden="true">−</td>
        <td class="diff-content"><span class="visually-hidden">Deleted line ${currentOld}: </span><code>${escapeHtml(row.text)}</code></td>
      </tr>`;
    } else {
      const currentOld = oldLine;
      const currentNew = newLine;
      oldLine++;
      newLine++;
      return `<tr class="diff-row diff-row-eq">
        <td class="diff-num">${currentOld}</td>
        <td class="diff-num">${currentNew}</td>
        <td class="diff-marker" aria-hidden="true"></td>
        <td class="diff-content"><code>${escapeHtml(row.text)}</code></td>
      </tr>`;
    }
  }).join('');

  return { rowsHtml, additions, deletions };
}
