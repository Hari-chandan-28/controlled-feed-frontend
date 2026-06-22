import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup, createProfile } from '../services/api';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
const SPORTS = [
  { id: 'F1',        label: 'Formula 1', icon: '🏎️', desc: 'Race data, standings & live timing' },
  { id: 'CRICKET',   label: 'Cricket',   icon: '🏏', desc: 'Live scores & match news' },
  { id: 'FOOTBALL',  label: 'Football',  icon: '⚽', desc: 'Match results & transfer news' },
  { id: 'TENNIS',    label: 'Tennis',    icon: '🎾', desc: 'Tournament results & rankings' },
  { id: 'BADMINTON', label: 'Badminton', icon: '🏸', desc: 'BWF tournaments & match highlights' },
];
// Add this at the top of both Login.jsx and Signup.jsx components
const extractError = (err) => {
  const data = err.response?.data;
  if (!data) return 'Something went wrong';
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  return 'Something went wrong';
};
const Signup = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleStep1 = async (e) => {
  e.preventDefault();
  setError('');
  if (form.password !== form.confirmPassword) {
    setError('Passwords do not match');
    return;
  }
  setLoading(true);
  try {
    const res = await signup({
      name: form.name,
      email: form.email,
      password: form.password
    });
    // Save token so step 2's createProfile call is authenticated
    loginUser(res.data.token);
    setStep(2);
  } catch (err) {
  setError(extractError(err));
} finally {
    setLoading(false);
  }
};

  const toggleGenre = (id) => {
    setGenres((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  };

const handleStep2 = async (e) => {
  e.preventDefault();
  if (genres.length === 0) { setError('Pick at least one sport'); return; }
  setError('');
  setLoading(true);
  try {
    await createProfile({ genres, bio: '' });
    navigate('/feed');
  } catch (err) {
  const msg = extractError(err);
  if (msg.toLowerCase().includes('already exists')) {
    navigate('/feed');
    return;
  }
  setError(msg);
} finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-beam flex items-center justify-center px-4 py-12">

      <div className="w-full max-w-4xl glass rounded-3xl overflow-hidden"
           style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>

        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[580px]">

          {/* ── Left — branding ── */}
          <div className="relative flex flex-col justify-between p-10 border-r border-white/8"
               style={{ background: 'rgba(0,0,0,0.25)' }}>

            {/* Mac dots */}
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

            {/* Logo */}
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
                  {step === 1 ? 'Join the\ncommunity.' : 'Almost\nthere.'}
                </h2>
                <p className="text-white/50 text-sm leading-relaxed max-w-[200px]">
                  {step === 1
                    ? 'Get live F1 timing, cricket scores, and AI-powered sports chat — all in one place.'
                    : 'Pick the sports you follow and we\'ll personalize your feed instantly.'}
                </p>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black
                    ${step >= 1 ? 'bg-primary text-white' : 'glass text-white/40'}`}>
                    1
                  </div>
                  <span className={`text-xs font-semibold ${step >= 1 ? 'text-white' : 'text-white/30'}`}>
                    Account
                  </span>
                </div>
                <div className="w-6 h-px bg-white/20" />
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black
                    ${step >= 2 ? 'bg-primary text-white' : 'glass text-white/40'}`}>
                    2
                  </div>
                  <span className={`text-xs font-semibold ${step >= 2 ? 'text-white' : 'text-white/30'}`}>
                    Preferences
                  </span>
                </div>
              </div>
            </div>

            <div className="text-white/20 text-xs">
              Built for fans who don't miss a moment
            </div>
          </div>

          {/* ── Right — form ── */}
          <div className="flex flex-col justify-center p-10"
               style={{ background: 'rgba(255,255,255,0.02)' }}>

            {step === 1 ? (
              <>
                <h3 className="text-xl font-black text-white mb-1">Create account</h3>
                <p className="text-white/40 text-sm mb-8">
                  Already have one?{' '}
                  <Link to="/login" className="text-primary hover:text-white transition-colors font-semibold">
                    Sign in
                  </Link>
                </p>

                {error && (
                  <div className="glass border border-primary/30 rounded-xl px-4 py-3 mb-5 text-sm text-primary">
                    {error}
                  </div>
                )}

                <form onSubmit={handleStep1} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-white/40 tracking-widest mb-2 block">
  NAME
</label>
                    <input
  name="name"
  value={form.name}
  onChange={handleChange}
  placeholder="Your name"
  required
  className="w-full glass rounded-xl px-4 py-3 text-white text-sm
             placeholder-white/20 outline-none border border-white/8
             focus:border-primary/50 transition-all"
/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/40 tracking-widest mb-2 block">
                      EMAIL
                    </label>
                    <input
                      name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="you@example.com" required
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
                      name="password" type="password" value={form.password} onChange={handleChange}
                      placeholder="••••••••" required
                      className="w-full glass rounded-xl px-4 py-3 text-white text-sm
                                 placeholder-white/20 outline-none border border-white/8
                                 focus:border-primary/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/40 tracking-widest mb-2 block">
                      CONFIRM PASSWORD
                    </label>
                    <input
                      name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                      placeholder="••••••••" required
                      className="w-full glass rounded-xl px-4 py-3 text-white text-sm
                                 placeholder-white/20 outline-none border border-white/8
                                 focus:border-primary/50 transition-all"
                    />
                  </div>
                  <button
                    type="submit" disabled={loading}
                    className="btn-primary w-full py-3.5 rounded-xl text-sm mt-2
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating account...' : 'Continue →'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h3 className="text-xl font-black text-white mb-1">Pick your sports</h3>
                <p className="text-white/40 text-sm mb-8">
                  Select everything you want in your feed
                </p>

                {error && (
  <div className="relative flex items-start gap-3 px-4 py-3.5 mb-5 rounded-xl overflow-hidden"
       style={{ background: 'rgba(255,30,60,0.08)', border: '1px solid rgba(255,30,60,0.3)' }}>
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />
    <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
      <span className="text-sm">⚠️</span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-black text-primary tracking-widest mb-0.5">ERROR</div>
      <div className="text-white/80 text-sm leading-snug">{error}</div>
    </div>
    <button
      onClick={() => setError('')}
      className="text-white/20 hover:text-white/60 text-sm transition-colors flex-shrink-0 mt-0.5"
    >
      ✕
    </button>
  </div>
)}
                <form onSubmit={handleStep2} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    {SPORTS.map((sport) => (
                      <div
                        key={sport.id}
                        onClick={() => toggleGenre(sport.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer
                                   transition-all select-none
                                   ${genres.includes(sport.id)
                                     ? 'border-primary/60 bg-primary/10'
                                     : 'border-white/8 glass hover:border-white/20'
                                   }`}
                      >
                        <span className="text-2xl">{sport.icon}</span>
                        <div className="flex-1">
                          <div className="text-white font-bold text-sm">{sport.label}</div>
                          <div className="text-white/40 text-xs mt-0.5">
                            {sport.id === 'F1'
                              ? 'Live timing, standings, race results'
                              : 'Live scores, match cards, scorecards'}
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                        transition-all ${genres.includes(sport.id)
                                          ? 'border-primary bg-primary'
                                          : 'border-white/20'}`}>
                          {genres.includes(sport.id) && (
                            <span className="text-white text-xs font-black">✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="btn-primary w-full py-3.5 rounded-xl text-sm mt-2
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Setting up your feed...' : 'Go to my feed →'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-white/30 hover:text-white/60 text-xs text-center transition-colors"
                  >
                    ← Back
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;