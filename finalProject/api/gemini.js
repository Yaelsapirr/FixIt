export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const key = process.env.GROQ_API_KEY;
  if (!key) { res.status(500).json({ error: 'No API key configured' }); return; }

  // Convert Gemini format → OpenAI/Groq format
  const contents = req.body.contents || [];
  const messages = [
    {
      role: 'system',
      content: 'אתה עוזר בית חכם בשם FixIt AI. אתה מסייע לאנשים לאבחן ולפתור בעיות בית נפוצות כמו אינסטלציה, חשמל, ריצוף, דלתות וחלונות, מיזוג ועוד. ענה תמיד בעברית, בצורה ברורה, מובנת ומעשית. פרט שלבים קצרים וממוספרים כשרלוונטי. אם הבעיה מסוכנת (חשמל, גז) המלץ לפנות לאיש מקצוע. היה ידידותי וקצר.'
    }
  ].concat(
    contents
      .filter(function(c) { return c.role !== 'model' || c.parts[0].text !== 'מובן! אני FixIt AI, כאן לעזור.'; })
      .map(function(c) {
        return {
          role: c.role === 'model' ? 'assistant' : 'user',
          content: c.parts && c.parts[0] ? c.parts[0].text : ''
        };
      })
  );

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        max_tokens: 512,
        temperature: 0.7
      })
    });
    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: data.error || 'Groq error' });
      return;
    }

    // Convert Groq response → Gemini format so frontend needs no changes
    const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    res.status(200).json({
      candidates: [{ content: { parts: [{ text: text || '' }], role: 'model' } }]
    });
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}
