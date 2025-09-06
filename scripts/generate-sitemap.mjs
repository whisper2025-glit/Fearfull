#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function fetchPublicCharacters() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase env vars for sitemap generation');
    return [];
  }
  const url = `${SUPABASE_URL}/rest/v1/characters?select=id,updated_at&visibility=eq.public`;
  try {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) {
      console.error('Failed to fetch characters for sitemap:', res.status, await res.text());
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Error fetching characters for sitemap:', e);
    return [];
  }
}

function buildXml(urls) {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  const add = (loc, lastmod) => {
    lines.push('  <url>');
    lines.push(`    <loc>${loc}</loc>`);
    if (lastmod) lines.push(`    <lastmod>${new Date(lastmod).toISOString()}</lastmod>`);
    lines.push('    <changefreq>daily</changefreq>');
    lines.push('    <priority>0.8</priority>');
    lines.push('  </url>');
  };

  const origin = process.env.DEPLOY_PRIME_URL || process.env.URL || 'https://example.com';

  add(`${origin}/`, new Date().toISOString());

  for (const u of urls) {
    add(`${origin}/character/${u.id}`, u.updated_at || new Date().toISOString());
  }

  lines.push('</urlset>');
  return lines.join('\n');
}

(async () => {
  const items = await fetchPublicCharacters();
  const xml = buildXml(items);
  const outPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, xml, 'utf-8');
  console.log(`Sitemap written: ${outPath} (${items.length} entries)`);
})();
