import { useState, useRef, useEffect } from 'react';
import { askAI } from '../services/agriService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Alert from '../components/Alert.jsx';

const SUGGESTED = [
  'Show rainfall trend in Coimbatore',
  'Which crops have historical records in this district?',
  'Why is rainfall important?',
  'What is the average yield in Erode?'
];

export default function AIFarmingAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Hi ${user?.name || ''}! I'm your AI Farming Assistant. Ask me about rainfall, crops, or yield using real historical data for your district.`, source: null }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (question) => {
    const q = question ?? input;
    if (!q.trim()) return;
    setError('');
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    try {
      const res = await askAI(q);
      setMessages((m) => [...m, { role: 'bot', text: res.answer, source: res.usedAI ? 'AI' : 'Rule-based (offline)' }]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>AI Farming Assistant</h1>
          <p>Answers are grounded in real MongoDB agricultural data. Works with or without an AI API key.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="card">
        <div className="chat-window" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>
              {m.text}
              {m.source && (
                <div style={{ fontSize: 11, marginTop: 6, opacity: 0.6 }}>Source: {m.source}</div>
              )}
            </div>
          ))}
          {loading && <div className="chat-bubble bot"><span className="spinner"></span></div>}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {SUGGESTED.map((s) => (
            <button key={s} className="tab-btn" onClick={() => send(s)} disabled={loading}>{s}</button>
          ))}
        </div>

        <form className="chat-input-row" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input
            className="form-input"
            placeholder="Ask about rainfall, crops, or yield..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>Send</button>
        </form>
      </div>
    </DashboardLayout>
  );
}
