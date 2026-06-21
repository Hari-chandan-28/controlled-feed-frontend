import { useState, useEffect } from 'react';
import { getProfile, uploadPicture, updateProfile,updateUsername } from '../services/api';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

const SPORTS = [
  { key: 'F1',      label: 'Formula 1', icon: '🏎️', desc: 'Race data & standings' },
  { key: 'CRICKET', label: 'Cricket',   icon: '🏏', desc: 'Live scores & news' },
];

const EditModal = ({ profile, onClose, onSaved }) => {
  const [name, setName] = useState(profile?.user?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [genres, setGenres] = useState(profile?.genres || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const toggleGenre = (key) => {
    setGenres((prev) =>
      prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Name cannot be empty.'); return; }
    if (genres.length === 0) { setError('Select at least one sport.'); return; }
    setSaving(true);
    setError('');
    try {
      // Run both updates in parallel
      await Promise.all([
        updateUsername({ name: name.trim() }),
        updateProfile({ bio, genres }),
      ]);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
               background: 'rgba(8,9,12,0.75)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mac chrome */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8"
             style={{ background: 'rgba(0,0,0,0.25)' }}>
          <div className="flex gap-2 group">
            <div onClick={onClose}
                 className="relative w-3 h-3 rounded-full bg-[#FF5F57] cursor-pointer
                            flex items-center justify-center">
              <span className="absolute opacity-0 group-hover:opacity-100 text-[#800000]
                               text-[8px] font-black transition-opacity">✕</span>
            </div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <span className="text-white/50 text-xs font-semibold">EDIT PROFILE</span>
          <span className="text-white/20 text-xs">ESC to close</span>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl overflow-hidden"
                 style={{ background: 'rgba(255,30,60,0.08)',
                          border: '1px solid rgba(255,30,60,0.3)' }}>
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              <span className="text-primary text-sm font-semibold">⚠️ {error}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs font-bold text-white/40 tracking-widest mb-2 block">
              USERNAME
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full glass text-white px-4 py-3 rounded-xl outline-none
                         focus:border-primary/50 transition-all placeholder:text-white/20
                         text-sm font-medium"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-bold text-white/40 tracking-widest mb-2 block">
              BIO
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="w-full glass text-white px-4 py-3 rounded-xl outline-none
                         focus:border-primary/50 transition-all placeholder:text-white/20
                         resize-none text-sm font-medium"
            />
          </div>

          {/* Sports */}
          <div>
            <label className="text-xs font-bold text-white/40 tracking-widest mb-3 block">
              SPORTS PREFERENCES
            </label>
            <div className="grid grid-cols-2 gap-3">
              {SPORTS.map((sport) => (
                <div
                  key={sport.key}
                  onClick={() => toggleGenre(sport.key)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all select-none ${
                    genres.includes(sport.key)
                      ? 'border-primary/60 bg-primary/10'
                      : 'glass hover:border-white/20'
                  }`}
                >
                  <div className="text-2xl mb-2">{sport.icon}</div>
                  <div className="text-white font-bold text-sm">{sport.label}</div>
                  <div className="text-white/40 text-xs mt-0.5">{sport.desc}</div>
                  {genres.includes(sport.key) && (
                    <div className="mt-2 text-primary text-xs font-bold">✓ Selected</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 glass py-3 rounded-xl text-white/50 hover:text-white
                         text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 btn-primary py-3 rounded-xl text-sm
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Profile Page ─────────────────────────────────────
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      setProfile(res.data);
    } catch {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setUploadSuccess(false);
    try {
      await uploadPicture(formData);
      setUploadSuccess(true);
      await loadProfile();
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch {
      setError('Upload failed. Max size is 5MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaved = async () => {
    await loadProfile();
    setTimeout(() => navigate('/feed'), 1500);
  };

  if (loading) return (
    <PageWrapper beam="profile">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent
                        rounded-full animate-spin" />
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper beam="profile">
      {/* Edit modal */}
      {editOpen && (
        <EditModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={handleSaved}
        />
      )}

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Upload success toast */}
        {uploadSuccess && (
          <div className="fixed top-20 right-6 z-40 glass px-5 py-3 rounded-2xl
                          border border-live/30 text-live text-sm font-semibold
                          shadow-lg animate-pulse">
            ✓ Photo updated
          </div>
        )}

        {/* ── Hero profile section ── */}
        <div className="text-center mb-12">

          {/* Avatar */}
          <div className="relative inline-block mb-6">
            <div className="w-28 h-28 rounded-full mx-auto relative">
              {profile?.profilePicturePath ? (
                <img
                  src={`http://localhost:8080/${profile.profilePicturePath}`}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover"
                  style={{ boxShadow: '0 0 0 3px rgba(255,30,60,0.5), 0 0 30px rgba(255,30,60,0.2)' }}
                />
              ) : (
                <div className="w-28 h-28 rounded-full glass flex items-center
                                justify-center text-5xl"
                     style={{ boxShadow: '0 0 0 3px rgba(255,30,60,0.3), 0 0 30px rgba(255,30,60,0.1)' }}>
                  👤
                </div>
              )}
              {/* Upload overlay */}
              <label className="absolute inset-0 rounded-full cursor-pointer flex items-center
                                justify-center transition-all duration-200"
                     style={{ background: 'rgba(0,0,0,0)' }}
                     onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                     onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                <span className="text-white text-xs font-bold opacity-0 hover:opacity-100 transition-opacity">
                  {uploading ? '...' : 'Change'}
                </span>
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
            </div>

            {/* Live indicator */}
            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-live
                            border-2 border-ink flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-live animate-ping absolute" />
            </div>
          </div>

          {/* Name */}
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            {profile?.user?.name || 'Your Name'}
          </h1>

          {/* Bio */}
          {profile?.bio ? (
            <p className="text-white/50 text-base max-w-sm mx-auto leading-relaxed mb-6">
              {profile.bio}
            </p>
          ) : (
            <p className="text-white/20 text-sm italic mb-6">No bio yet — add one!</p>
          )}

          {/* Genre badges */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {profile?.genres?.map((genre) => (
              <div key={genre}
                   className="flex items-center gap-2 glass px-4 py-2 rounded-full
                              border border-primary/30">
                <span>{genre === 'F1' ? '🏎️' : '🏏'}</span>
                <span className="text-white font-semibold text-sm">
                  {genre === 'F1' ? 'Formula 1' : 'Cricket'}
                </span>
              </div>
            ))}
          </div>

          {/* Edit button */}
          <button
            onClick={() => setEditOpen(true)}
            className="btn-primary px-8 py-3 rounded-2xl text-sm"
          >
            Edit Profile
          </button>
        </div>

        {/* ── Stats strip ── */}
        <div className="glass rounded-2xl grid grid-cols-2 divide-x divide-white/8">
          <div className="py-6 text-center">
            <div className="text-2xl font-black text-white mb-1">
              {profile?.genres?.length || 0}
            </div>
            <div className="text-xs font-semibold text-white/30 tracking-widest uppercase">
              Sports
            </div>
          </div>
          <div className="py-6 text-center">
            <div className="text-2xl font-black text-white mb-1">
              {profile?.genres?.includes('F1') && profile?.genres?.includes('CRICKET')
                ? 'All' : profile?.genres?.[0] || '—'}
            </div>
            <div className="text-xs font-semibold text-white/30 tracking-widest uppercase">
              Following
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
};

export default Profile;