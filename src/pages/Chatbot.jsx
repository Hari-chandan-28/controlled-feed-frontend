import  { useState, useRef, useEffect } from 'react';
import { askQuestion } from '../services/api';

// Single message bubble component
const MessageBubble = ({ message }) => (
  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
      message.role === 'user'
        ? 'bg-primary text-white rounded-br-sm'
        : 'bg-card border border-border text-white rounded-bl-sm'
    }`}>
      {/* Bot avatar */}
      {message.role === 'bot' && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🤖</span>
          <span className="text-xs text-muted font-medium">AI Sports Expert</span>
        </div>
      )}
      <p className="whitespace-pre-wrap">{message.text}</p>
    </div>
  </div>
);

// Suggested question pill
const SuggestedQuestion = ({ question, onClick }) => (
  <button
    onClick={() => onClick(question)}
    className="px-3 py-2 bg-surface border border-border text-muted text-xs rounded-lg hover:border-primary hover:text-white transition-all text-left"
  >
    {question}
  </button>
);

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi! I'm your AI sports expert 🏎️🏏\n\nAsk me anything about Formula 1 or Cricket — drivers, teams, records, rules, history, and more!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Suggested questions to help user get started
  const suggestions = [
    "Who won the 2024 F1 championship?",
    "Who has the most F1 wins ever?",
    "Explain DRS in F1",
    "Who has the most test centuries?",
    "Which team won IPL 2024?",
    "What is the Duckworth-Lewis method?",
  ];

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question || loading) return;

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);

    try {
      const res = await askQuestion(question);
      // Add bot response
      setMessages((prev) => [...prev, { role: 'bot', text: res.data.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'bot',
        text: 'Sorry, I could not process that right now. Please try again!'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-dark pt-16 flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 py-8 flex flex-col flex-1">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl">🤖</span>
          <div>
            <h1 className="text-3xl font-display tracking-wider text-white">AI CHAT</h1>
            <p className="text-muted text-sm">Powered by Google Gemini · F1 & Cricket only</p>
          </div>
        </div>

        {/* Suggested questions - show only at start */}
        {messages.length === 1 && (
          <div className="mb-6">
            <p className="text-muted text-xs uppercase tracking-wider mb-3">Suggested questions</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((q) => (
                <SuggestedQuestion key={q} question={q} onClick={sendMessage} />
              ))}
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 bg-surface border border-border rounded-xl p-4 space-y-4 overflow-y-auto mb-4 min-h-[400px] max-h-[500px]">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-muted rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auto scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about F1 or Cricket..."
            rows={1}
            className="flex-1 bg-surface border border-border text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary transition-colors placeholder:text-muted/50 resize-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="px-6 py-3 bg-primary hover:bg-red-700 disabled:opacity-40 text-white font-semibold rounded-xl transition-all"
          >
            Send
          </button>
        </div>

        <p className="text-muted text-xs text-center mt-3">
          Press Enter to send · Shift+Enter for new line
        </p>

      </div>
    </div>
  );
};

export default Chatbot;