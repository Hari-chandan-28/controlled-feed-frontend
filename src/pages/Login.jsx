import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  // Form state
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token); // save token
      navigate('/feed');         // go to feed
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex">

      {/* LEFT PANEL - visible only on large screens */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-surface border-r border-border p-12">
        <Link to="/" className="text-3xl font-display tracking-wider mb-12">
          CONTROLLED<span className="text-primary">FEED</span>
        </Link>
        <div className="max-w-sm">
          <h2 className="font-display text-4xl tracking-wider text-white mb-6">
            WELCOME<br />BACK
          </h2>
          <p className="text-muted leading-relaxed mb-8">
            Your personalized F1 and Cricket content hub is waiting.
          </p>
          <div className="space-y-3">
            {['🏎️ Live F1 race timing', '🏏 Cricket live scorecards', '🤖 AI sports chatbot'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-muted">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-8">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="lg:hidden text-2xl font-display tracking-wider mb-8 block text-center">
            CONTROLLED<span className="text-primary">FEED</span>
          </Link>

          <h1 className="text-2xl font-semibold text-white mb-2">Sign in</h1>
          <p className="text-muted text-sm mb-8">Enter your credentials to continue</p>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm text-muted mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                className="w-full bg-surface border border-border text-white px-4 py-3 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted/50"
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full bg-surface border border-border text-white px-4 py-3 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>

          </form>

          <p className="text-center text-muted text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">Create one</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;