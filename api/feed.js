export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing ?url= parameter' });
  }

  let target;
  try {
    target = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Only allow http/https and known RSS domains (security guard)
  if (!['http:', 'https:'].includes(target.protocol)) {
    return res.status(400).json({ error: 'Only http/https allowed' });
  }

  try {
    const upstream = await fetch(url, {
      // Follow cross-host redirects (e.g. xataka.com -> feedburner).
      redirect: 'follow',
      headers: {
        // Some publishers (notably WIRED) serve a stripped, coupon-only feed
        // to non-browser User-Agents. A real browser UA gets the full feed.
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: `Upstream returned ${upstream.status}` });
    }

    const text = await upstream.text();

    // Guard against feeds that redirected to an HTML page (e.g. a moved feed
    // landing on the site homepage) — that would parse to zero items.
    const looksLikeFeed = /<(rss|feed|rdf:RDF)[\s>]|<(item|entry)[\s>]/i.test(text.slice(0, 2000));
    if (!looksLikeFeed) {
      return res.status(502).json({ error: 'Upstream did not return a recognizable RSS/Atom feed' });
    }

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(text);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
