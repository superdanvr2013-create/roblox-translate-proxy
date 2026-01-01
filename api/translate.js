export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, source = 'en', target = 'ru' } = req.body;
  
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await response.json();
    const translated = data[0][0][0];
    
    res.json({ translatedText: translated });
  } catch (error) {
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
}
