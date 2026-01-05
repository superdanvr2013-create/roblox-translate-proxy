export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let { text, source = 'auto', target = 'ru' } = req.body;
  
  if (!text || !target) {
    return res.status(400).json({ error: 'Missing text or target language' });
  }

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`
    );
    
    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // ✅ ИСПРАВЛЕНИЕ: собираем ВСЕ предложения!
    let translated = '';
    if (data[0] && Array.isArray(data[0])) {
      for (let sentence of data[0]) {
        if (sentence[0]) {
          translated += sentence[0] + ' ';
        }
      }
      translated = translated.trim();  // Убираем лишние пробелы
    } else {
      translated = data[0]?.[0]?.[0] || text;  // Fallback для коротких текстов
    }
    
    res.json({ 
      translatedText: translated,
      detectedSource: data[2] || source,
      sentencesCount: data[0] ? data[0].length : 0,
      target: target 
    });
    
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      error: 'Translation failed', 
      details: error.message,
      inputLength: text.length
    });
  }
}
