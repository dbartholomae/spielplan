import { NextRequest } from 'next/server';

// Proxy to BGG XML API2: https://boardgamegeek.com/wiki/page/BGG_XML_API2
// We use the 'search' endpoint and then fetch 'thing' for details including thumbnails.
// Returns JSON: { items: [{ id, name, thumbnail }] }

// Minimal XML parser without DOMParser in Node. We'll use a light regex approach for the specific fields.
function parseSearchXml(xml: string): { id: string; name: string }[] {
  // Extract items
  const items: { id: string; name: string }[] = [];
  const itemRegex = /<item\s+type="boardgame"\s+id="(\d+)">([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(xml))) {
    const id = m[1];
    const block = m[2];
    // Prefer primary name
    const primary = /<name\s+type="primary"\s+value="([^"]+)"\s*\/?>/.exec(block);
    const alt = /<name\s+value="([^"]+)"\s*\/?>/.exec(block);
    const name = (primary?.[1] ?? alt?.[1] ?? '').trim();
    if (name) items.push({ id, name });
  }
  return items;
}

function parseThingXml(xml: string): Record<string, { thumbnail?: string; name?: string }> {
  const res: Record<string, { thumbnail?: string; name?: string }> = {};
  const thingRegex = /<item\s+type="boardgame"\s+id="(\d+)">([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = thingRegex.exec(xml))) {
    const id = m[1];
    const block = m[2];
    const thumb = /<thumbnail>([^<]+)<\/thumbnail>/.exec(block)?.[1];
    const name = /<name\s+type="primary"\s+value="([^"]+)"\s*\/?>/.exec(block)?.[1];
    res[id] = { thumbnail: thumb, name };
  }
  return res;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  if (!q) return new Response(JSON.stringify({ items: [] }), { headers: { 'content-type': 'application/json' } });

  // Step 1: search
  const searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(q)}&type=boardgame`;
  const res1 = await fetch(searchUrl);
  if (!res1.ok) return new Response(JSON.stringify({ error: 'BGG search failed' }), { status: 502 });
  const xml1 = await res1.text();
  const basic = parseSearchXml(xml1).slice(0, 10);
  if (basic.length === 0) {
    return new Response(JSON.stringify({ items: [] }), { headers: { 'content-type': 'application/json' } });
  }

  // Step 2: get details
  const ids = basic.map(b => b.id).join(',');
  const thingUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${ids}&type=boardgame`;
  const res2 = await fetch(thingUrl);
  if (!res2.ok) {
    // Fallback to basic list only
    return new Response(
      JSON.stringify({ items: basic.map(b => ({ id: b.id, name: b.name, thumbnail: undefined })) }),
      { headers: { 'content-type': 'application/json' } }
    );
  }
  const xml2 = await res2.text();
  const details = parseThingXml(xml2);
  const items = basic.map(b => ({ id: b.id, name: b.name, thumbnail: details[b.id]?.thumbnail }));

  return new Response(JSON.stringify({ items }), { headers: { 'content-type': 'application/json' } });
}
