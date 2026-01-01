export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, source = 'en', target = 'ru' } = req.body;

  try {
    const libreResponse = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Roblox-Proxy/1.0'  // Добавьте UA
      },
      body: new URLSearchParams({
        q: text,
        source,
        target,
        format: 'text'
      })
    });

    if (!libreResponse.ok) {
      throw new Error(`LibreTranslate error: ${libreResponse.status}`);
    }

    const data = await libreResponse.json();
    res.json(data);
  } catch (error) {
    console.error('Translate error:', error);  // Логи для Vercel
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
}
