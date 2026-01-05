export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let { text, source = 'auto', target = 'ru' } = req.body;
  
  // ✅ Фикс: source='auto' по умолчанию (автоопределение)
  // ✅ Обязательная проверка target
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
    const translated = data[0][0][0];  // Основной перевод
    
    res.json({ 
      translatedText: translated,
      detectedSource: data[2] || source,  // Бонус: обнаруженный язык
      target: target 
    });
    
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      error: 'Translation failed', 
      details: error.message,
      input: { text: text?.substring(0, 50), source, target }
    });
  }
}
