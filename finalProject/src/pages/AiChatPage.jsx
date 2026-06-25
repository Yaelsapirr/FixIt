import { useState, useRef, useEffect } from 'react';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './AiChatPage.css';

const API_URL = '/api/gemini';

const SYSTEM_PROMPT = 'אתה עוזר בית חכם בשם FixIt AI. אתה מסייע לאנשים לאבחן ולפתור בעיות בית נפוצות כמו אינסטלציה, חשמל, ריצוף, דלתות וחלונות, מיזוג ועוד. ענה תמיד בעברית, בצורה ברורה, מובנת ומעשית. פרט שלבים קצרים וממוספרים כשרלוונטי. אם הבעיה מסוכנת (חשמל, גז) המלץ לפנות לאיש מקצוע. היה ידידותי וקצר.';

const STARTERS = [
  { label: 'הברז מטפטף', prompt: 'הברז שלי במטבח מטפטף כל הזמן, איך לתקן?' },
  { label: 'שקע לא עובד', prompt: 'יש לי שקע חשמל שהפסיק לעבוד, מה לבדוק?' },
  { label: 'דלת לא נסגרת', prompt: 'הדלת שלי לא נסגרת טוב, מה הסיבה ואיך לתקן?' },
  { label: 'מיזוג לא מקרר', prompt: 'המיזוג עובד אבל לא מקרר, מה הבעיה?' },
  { label: 'ריצוף שבור', prompt: 'אריח ריצוף נשבר, איך להחליף אותו?' },
  { label: 'נזילה בתקרה', prompt: 'יש לי כתם רטיבות בתקרה, מה הסיבות האפשריות ומה לעשות?' },
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={'chat-msg ' + (isUser ? 'chat-msg--user' : 'chat-msg--ai')}>
      {!isUser && <span className="chat-msg__avatar">🤖</span>}
      <div className="chat-msg__bubble">{msg.text}</div>
      {isUser && <span className="chat-msg__avatar">👤</span>}
    </div>
  );
}

export default function AiChatPage() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'שלום! אני FixIt AI 🔧 תבחרו נושא או תכתבו את הבעיה שלכם:' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);

  useEffect(function() {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function sendMessage(text) {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    setStarted(true);

    const newMessages = messages.concat([{ role: 'user', text: trimmed }]);
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'מובן! אני FixIt AI, כאן לעזור.' }] }
    ].concat(
      newMessages.map(function(m) {
        return { role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] };
      })
    );

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: contents })
      });
      const data = await res.json();
      const reply = data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0].text;
      setMessages(function(prev) {
        return prev.concat([{ role: 'ai', text: reply || 'לא הצלחתי לענות. נסי שוב.' }]);
      });
    } catch (e) {
      setMessages(function(prev) {
        return prev.concat([{ role: 'ai', text: 'שגיאת רשת — נסי שוב.' }]);
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="page-container ai-chat-page">
      <AppHeader title="עוזר AI" showBack={false} />

      <main className="ai-chat-page__messages">
        {messages.map(function(msg, i) {
          return <Message key={i} msg={msg} />;
        })}

        {!started && (
          <div className="chat-starters">
            {STARTERS.map(function(s) {
              return (
                <button
                  key={s.label}
                  className="chat-starter-btn"
                  onClick={function() { sendMessage(s.prompt); }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}

        {loading && (
          <div className="chat-msg chat-msg--ai">
            <span className="chat-msg__avatar">🤖</span>
            <div className="chat-msg__bubble chat-msg__bubble--loading">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      <div className="ai-chat-page__input-bar">
        <textarea
          className="ai-chat-page__textarea"
          value={input}
          onChange={function(e) { setInput(e.target.value); }}
          onKeyDown={handleKey}
          placeholder="תאר את הבעיה בבית..."
          rows={1}
          disabled={loading}
        />
        <button
          className="ai-chat-page__send"
          onClick={function() { sendMessage(); }}
          disabled={loading || !input.trim()}
          aria-label="שלח"
        >
          ➤
        </button>
      </div>

      <Navbar />
    </div>
  );
}
