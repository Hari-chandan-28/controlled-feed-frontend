import { useState, useRef, useEffect } from 'react';
import { askQuestion } from '../services/api';
import PageWrapper from '../components/PageWrapper';

const MessageBubble = ({ message }) => (
  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
      message.role === 'user'
        ? 'bg-primary text-white rounded-br-sm'
        : 'glass text-white rounded-bl-sm'
    }`}>
      {message.role === 'bot' && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30
                          flex items-center justify-center text-xs">🤖</div>
          <span className="text-xs text-white/40 font-semibold">AI Sports Expert</span>
        </div>
      )}
      <p className="whitespace-pre-wrap">{message.text}</p>
    </div>
  </div>
);

const Chatbot = () => {
  const [messages, setMessages] = useState([{
    role: 'bot',
    text: "Hi! I'm your AI sports expert \n\nAsk me anything about Formula 1, Cricket, Football, Tennis, or Badminton — drivers, teams, records, rules, history, and more!"
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

const suggestions = [
  "Why do F1 cars spark at high speeds?",
  "What happens if a cricket ball hits a spider cam?",
  "Why is Wimbledon played only on grass?",
  "Why is the offside rule needed in football?",
  "Why do badminton shuttlecocks have exactly 16 feathers?",
  "Why do F1 teams sometimes tell drivers not to overtake?",
];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question || loading) return;
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);
    try {
      const res = await askQuestion(question);
      setMessages((prev) => [...prev, { role: 'bot', text: res.data.answer }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'bot',
        text: 'Sorry, I could not process that right now. Please try again!'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <PageWrapper beam="chat">
      <div className="max-w-3xl mx-auto px-6 py-10 pb-3 flex flex-col"
           style={{ minHeight: 'calc(100vh - 64px)' }}>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h1 className="text-3xl font-black tracking-tight text-white">AI Chat</h1>
          </div>
          <p className="text-white/40 text-sm font-medium ml-4">
            Powered by Google Gemini · F1 , Cricket, Football, Tennis & Badminton only
          </p>
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="mb-6">
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">
              Suggested questions
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="glass px-4 py-3 text-white/60 text-xs font-medium rounded-xl
                             hover:text-white hover:border-primary/40 transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 glass rounded-2xl p-5 space-y-4 overflow-y-auto
                        mb-4 min-h-[180px] max-h-[490px]">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🤖</span>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-white/30 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about F1, Cricket, Football, Tennis, or Badminton  ..."
            rows={1}
            className="flex-1 glass text-white px-4 py-3 rounded-xl outline-none
                       focus:border-primary/50 transition-all placeholder:text-white/20
                       resize-none text-sm font-medium"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="btn-primary px-6 py-3 rounded-xl disabled:opacity-40
                       disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>

        <p className="text-white/20 text-xs text-center mt-3 font-medium">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </PageWrapper>
  );
};

export default Chatbot;