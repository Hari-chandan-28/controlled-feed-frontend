import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import logo from '../assets/logo.png';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();
// Add this at the top of both Login.jsx and Signup.jsx components
const extractError = (err) => {
  const data = err.response?.data;
  if (!data) return 'Something went wrong';
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  return 'Something went wrong';
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ email, password });
      loginUser(res.data.token);
      navigate('/feed');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-beam flex items-center justify-center px-4 py-12">

      {/* Mac-style glass window */}
      <div className="w-full max-w-4xl glass rounded-3xl overflow-hidden"
           style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>

        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[540px]">

          {/* ── Left — branding ── */}
          <div className="relative flex flex-col justify-between p-10 border-r border-white/8"
               style={{ background: 'rgba(0,0,0,0.25)' }}>

            {/* Mac window dots */}
            <Link to="/" className="flex gap-2 group w-fit">
              <div className="relative w-3 h-3 rounded-full bg-[#FF5F57] flex items-center justify-center cursor-pointer">
                <span className="absolute opacity-0 group-hover:opacity-100 text-[#800000] text-[8px] font-black transition-opacity">✕</span>
              </div>
              <div className="relative w-3 h-3 rounded-full bg-[#FFBD2E] flex items-center justify-center cursor-pointer">
                <span className="absolute opacity-0 group-hover:opacity-100 text-[#7d5900] text-[8px] font-black transition-opacity">−</span>
              </div>
              <div className="relative w-3 h-3 rounded-full bg-[#28C840] flex items-center justify-center cursor-pointer">
                <span className="absolute opacity-0 group-hover:opacity-100 text-[#006400] text-[8px] font-black transition-opacity">+</span>
              </div>
            </Link>

            {/* Logo + name */}
            <div className="flex flex-col items-start gap-6">
              <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
                <img src={logo} alt="Sportiva" className="w-14 h-14 object-contain" />
                <div className="text-2xl font-black tracking-tight text-white">
                  SPORT<span className="text-primary">IVA</span>
                </div>
              </Link>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white leading-tight mb-3">
                  Welcome<br />back.
                </h2>
                <p className="text-white/50 text-sm leading-relaxed max-w-[200px]">
                  Your live sports feed is waiting — F1 timing, cricket scores, and more.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {['⚪  Live F1 timing', '⚪  Cricket scorecards', '⚪  AI sports chat'].map((f) => (
                  <div key={f} className="text-white/40 text-xs font-medium">{f}</div>
                ))}
              </div>
            </div>

            {/* Bottom tagline */}
            <div className="text-white/20 text-xs">
              Built for fans who don't miss a moment
            </div>
          </div>

          {/* ── Right — form ── */}
          <div className="flex flex-col justify-center p-10"
               style={{ background: 'rgba(255,255,255,0.02)' }}>

            <h3 className="text-xl font-black text-white mb-1">Sign in</h3>
            <p className="text-white/40 text-sm mb-8">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:text-white transition-colors font-semibold">
                Sign up free
              </Link>
            </p>

            {error && (
  <div className="relative flex items-start gap-3 px-4 py-3.5 mb-5 rounded-xl overflow-hidden"
       style={{ background: 'rgba(255,30,60,0.25)', border: '1px solid rgba(255,30,60,0.18)' }}>
    {/* Animated left accent bar */}
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />
    
    {/* Icon */}
    <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
      <span className="text-sm">⚠️</span>
    </div>

    {/* Text */}
    <div className="flex-1 min-w-0">
      <div className="text-xs font-black text-primary tracking-widest mb-0.5">ERROR</div>
      <div className="text-white/80 text-sm leading-snug">{error}</div>
    </div>

    {/* Dismiss */}
    <button
      onClick={() => setError('')}
      className="text-white/20 hover:text-white/60 text-sm transition-colors flex-shrink-0 mt-0.5"
    >
      ✕
    </button>
  </div>
)}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-white/40 tracking-widest mb-2 block">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full glass rounded-xl px-4 py-3 text-white text-sm
                             placeholder-white/20 outline-none border border-white/8
                             focus:border-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 tracking-widest mb-2 block">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full glass rounded-xl px-4 py-3 text-white text-sm
                             placeholder-white/20 outline-none border border-white/8
                             focus:border-primary/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 rounded-xl text-sm mt-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;