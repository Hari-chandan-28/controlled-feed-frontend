import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup, login, createProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  // Step 1 = account details, Step 2 = sport preferences
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [genres, setGenres] = useState([]);
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  // Toggle sport selection
  const toggleGenre = (genre) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  // Step 1 - Create account
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      const loginRes = await login({ email: form.email, password: form.password });
      loginUser(loginRes.data.token);
      setStep(2); // go to step 2
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 - Create profile
  const handleProfile = async (e) => {
    e.preventDefault();
    if (genres.length === 0) { setError('Select at least one sport.'); return; }
    setError('');
    setLoading(true);
    try {
      await createProfile({ bio, genres });
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Profile creation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <Link to="/" className="text-2xl font-display tracking-wider mb-8 block text-center">
          CONTROLLED<span className="text-primary">FEED</span>
        </Link>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step >= s ? 'bg-primary text-white' : 'bg-surface text-muted border border-border'
              }`}>
                {s}
              </div>
              {s < 2 && (
                <div className={`h-px w-16 ${step > 1 ? 'bg-primary' : 'bg-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1 - Account Details */}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-semibold text-white mb-2">Create account</h1>
            <p className="text-muted text-sm mb-8">Join thousands of sports fans</p>

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-sm text-muted mb-2">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  required
                  className="w-full bg-surface border border-border text-white px-4 py-3 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted/50"
                />
              </div>

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
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-surface border border-border text-white px-4 py-3 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all"
              >
                {loading ? 'Creating account...' : 'Continue →'}
              </button>
            </form>

            <p className="text-center text-muted text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </>
        )}

        {/* STEP 2 - Sport Preferences */}
        {step === 2 && (
          <>
            <h1 className="text-2xl font-semibold text-white mb-2">Your interests</h1>
            <p className="text-muted text-sm mb-8">Choose your sports to personalize your feed</p>

            <form onSubmit={handleProfile} className="space-y-6">

              <div>
                <label className="block text-sm text-muted mb-3">Sports (select at least one)</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'F1', label: '🏎️ Formula 1', desc: 'Race data & standings' },
                    { key: 'CRICKET', label: '🏏 Cricket', desc: 'Live scores & news' },
                  ].map((sport) => (
                    <button
                      key={sport.key}
                      type="button"
                      onClick={() => toggleGenre(sport.key)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        genres.includes(sport.key)
                          ? 'border-primary bg-primary/10 text-white'
                          : 'border-border bg-surface text-muted hover:border-white'
                      }`}
                    >
                      <div className="font-medium text-sm">{sport.label}</div>
                      <div className="text-xs mt-1 opacity-70">{sport.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted mb-2">Bio (optional)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full bg-surface border border-border text-white px-4 py-3 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all"
              >
                {loading ? 'Setting up...' : 'Go to Feed →'}
              </button>

            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default Signup;