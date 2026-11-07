// Serverless page sharing module: compress page data into URL token and decompress it back.
// Uses web standard CompressionStream/DecompressionStream (deflate) with safe base64url encoding.
import { normalizeTitle } from './storage.js';

export const MAX_TEXT_SIZE = 100 * 1024; // 100 KB limit for link sharing
export const MAX_TOKEN_LEN = 150 * 1024; // 150 KB limit for URL tokens

export function bytesToBase64Url(bytes) {
  let binary = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 8192) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + 8192, len)));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlToBytes(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function compressPageData(payload) {
  if (payload.text && typeof payload.text === 'string' && payload.text.length > MAX_TEXT_SIZE) {
    throw new Error('Page text exceeds the 100 KB limit for link sharing.');
  }
  const jsonStr = JSON.stringify(payload);
  if (typeof CompressionStream !== 'undefined') {
    const cs = new CompressionStream('deflate');
    const writer = cs.writable.getWriter();
    writer.write(new TextEncoder().encode(jsonStr));
    writer.close();
    const reader = cs.readable.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const total = chunks.reduce((acc, c) => acc + c.length, 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) {
      out.set(c, off);
      off += c.length;
    }
    return 'd.' + bytesToBase64Url(out);
  }
  // Fallback for environments without CompressionStream
  return 'r.' + bytesToBase64Url(new TextEncoder().encode(jsonStr));
}

export async function decompressPageData(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Missing or empty share token');
  }
  if (token.length > MAX_TOKEN_LEN) {
    throw new Error('Share link exceeds maximum allowed length.');
  }

  let jsonStr = '';
  if (token.startsWith('d.')) {
    const raw = base64UrlToBytes(token.slice(2));
    if (typeof DecompressionStream !== 'undefined') {
      const ds = new DecompressionStream('deflate');
      const writer = ds.writable.getWriter();
      writer.write(raw);
      writer.close();
      const reader = ds.readable.getReader();
      const chunks = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        if (total > MAX_TEXT_SIZE * 2) {
          try { await reader.cancel(); } catch {}
          throw new Error('Decompressed data exceeds maximum allowed size (100 KB).');
        }
        chunks.push(value);
      }
      const out = new Uint8Array(total);
      let off = 0;
      for (const c of chunks) {
        out.set(c, off);
        off += c.length;
      }
      jsonStr = new TextDecoder().decode(out);
    } else {
      throw new Error('Decompression is not supported by your browser.');
    }
  } else if (token.startsWith('r.')) {
    const raw = base64UrlToBytes(token.slice(2));
    if (raw.length > MAX_TEXT_SIZE * 2) {
      throw new Error('Shared data exceeds maximum allowed size (100 KB).');
    }
    jsonStr = new TextDecoder().decode(raw);
  } else {
    throw new Error('Unrecognized or invalid share link format.');
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    throw new Error('Invalid JSON payload in share link: ' + err.message);
  }

  if (!parsed || typeof parsed !== 'object' || typeof parsed.title !== 'string' || typeof parsed.text !== 'string') {
    throw new Error('Shared link does not contain valid page data.');
  }

  if (parsed.text.length > MAX_TEXT_SIZE) {
    throw new Error('Shared page text exceeds maximum allowed size (100 KB).');
  }

  const normTitle = normalizeTitle(parsed.title);
  if (!normTitle || normTitle.startsWith('Special:')) {
    throw new Error('Shared page title is invalid or reserved.');
  }

  let ts = new Date().toISOString();
  if (typeof parsed.ts === 'string' && !isNaN(Date.parse(parsed.ts))) {
    ts = parsed.ts;
  } else if (typeof parsed.ts === 'number' && !isNaN(parsed.ts)) {
    ts = new Date(parsed.ts).toISOString();
  }

  return {
    title: normTitle,
    text: parsed.text,
    ts,
    summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : 'Shared page import'
  };
}

export function makeShareUrl(token) {
  const base = `${location.origin}${location.pathname}`;
  return `${base}#/share-import/${token}`;
}
