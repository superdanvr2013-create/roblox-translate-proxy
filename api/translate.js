export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, source = 'en', target = 'ru' } = req.body;

  try {
    const libreResponse = await fetch('https://translate.argosopentech.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        q: text,
        source,
        target,
        format: 'text'
      })
    });

    const data = await libreResponse.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Translation failed' });
  }
}
