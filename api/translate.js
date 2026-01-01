export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, source = 'en', target = 'ru' } = req.body;

  try {
    // Рабочий публичный endpoint
    const libreResponse = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',  // JSON, не form!
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({
        q: text,
        source: source,
        target: target,
        format: 'text'
      })
    });

    if (!libreResponse.ok) {
      const errorData = await libreResponse.text();
      throw new Error(`LibreTranslate ${libreResponse.status}: ${errorData}`);
    }

    const data = await libreResponse.json();
    res.json({ translatedText: data.translatedText });
  } catch (error) {
    console.error('Translate error:', error);
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
}
