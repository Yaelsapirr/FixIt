import { useState, useRef, useEffect } from 'react';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './AiChatPage.css';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_KEY;

const SYSTEM_PROMPT = 'אתה עוזר בית חכם בשם FixIt AI. אתה מסייע לאנשים לאבחן ולפתור בעיות בית נפוצות כמו אינסטלציה, חשמל, ריצוף, דלתות וחלונות, מיזוג ועוד. ענה תמיד בעברית, בצורה ברורה ומובנת. אם הבעיה מסוכנת (חשמל, גז) — המלץ לפנות לאיש מקצוע. היה ידידותי, מעשי וקצר.';

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
    { role: 'ai', text: 'שלום! אני FixIt AI 🔧 איזו בעיה בבית אוכל לעזור לך לפתור?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(function() {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    if (!GEMINI_KEY) {
      setMessages(function(prev) {
        return prev.concat([
          { role: 'user', text: text },
          { role: 'ai', text: 'חסר VITE_GEMINI_API_KEY ב-.env — הוסיפי את המפתח כדי להשתמש בעוזר AI.' }
        ]);
      });
      setInput('');
      return;
    }

    const newMessages = messages.concat([{ role: 'user', text: text }]);
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
        return prev.concat([{ role: 'ai', text: reply || 'מצטערת, לא הצלחתי לענות. נסי שוב.' }]);
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
          onClick={sendMessage}
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
