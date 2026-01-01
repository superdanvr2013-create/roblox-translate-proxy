export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, source = 'en', target = 'ru' } = req.body;

  if (!text) return res.status(400).json({ error: 'Text required' });

  // Множество публичных серверов с fallback
  const servers = [
    'https://libretranslate.de/translate',
    'https://translate.argosopentech.com/translate',
    'https://translate.terraprint.co/translate'
  ];

  for (const server of servers) {
    try {
      const response = await fetch(server, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify({
          q: text.slice(0, 500),  // Лимит символов
          source,
          target,
          format: 'text'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return res.json({ translatedText: data.translatedText || data });
      }
    } catch (e) {
      console.log(`Failed server ${server}:`, e.message);
      continue;
    }
  }

  res.status(503).json({ error: 'All translation servers unavailable' });
}
