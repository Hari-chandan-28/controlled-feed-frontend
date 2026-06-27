import { useState, useEffect } from 'react';
import { getProfile, uploadPicture, updateProfile, updateUsername } from '../services/api';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

const SPORTS = [
  { id: 'F1',        label: 'Formula 1', icon: '', desc: 'Race data, standings & live timing' },
  { id: 'CRICKET',   label: 'Cricket',   icon: '', desc: 'Live scores & match news' },
  { id: 'FOOTBALL',  label: 'Football',  icon: '', desc: 'Match results & transfer news' },
  { id: 'TENNIS',    label: 'Tennis',    icon: '', desc: 'Tournament results & rankings' },
  { id: 'BADMINTON', label: 'Badminton', icon: '', desc: 'BWF tournaments & match highlights' },
];

const getSportMeta = (genreId) =>
  SPORTS.find(s => s.id === genreId) || { icon: '🏅', label: genreId };

// ── Edit Modal ─────────────────────────────────────────────
const EditModal = ({ profile, onClose, onSaved }) => {
  const [name, setName] = useState(profile?.user?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [genres, setGenres] = useState(() => {
    if (!Array.isArray(profile?.genres)) return [];
    return profile.genres
      .filter(g => g != null && g !== '' && g !== 'UNDEFINED')
      .map(g => typeof g === 'string' ? g.toUpperCase() : String(g).toUpperCase())
      .filter(g => SPORTS.map(s => s.id).includes(g));
  });

  // Track original genres to detect if preferences changed
  const originalGenres = profile?.genres
    ?.filter(g => g != null)
    ?.map(g => String(g).toUpperCase())
    ?.sort()
    ?.join(',') || '';

  // Track original pic path for detecting pic change
  const [previewPic, setPreviewPic] = useState(
    profile?.profilePicturePath
      ? `http://localhost:8080/${profile.profilePicturePath}`
      : null
  );
  const [picFile, setPicFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const toggleGenre = (id) => {
    setGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  // Handle pic selection — show preview immediately, don't upload yet
  const handlePicSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPicFile(file);
    setPreviewPic(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Name cannot be empty.'); return; }
    if (genres.length === 0) { setError('Select at least one sport.'); return; }

    setSaving(true);
    setError('');

    try {
      // Check if preferences actually changed
      const newGenres = [...genres].sort().join(',');
      const preferencesChanged = newGenres !== originalGenres;

      // Run name + profile updates in parallel
      const updates = [
        updateUsername({ name: name.trim() }),
        updateProfile({
          bio: bio || '',
          genres: genres.filter(g => SPORTS.map(s => s.id).includes(g))
        }),
      ];

      // Upload pic if a new one was selected
      if (picFile) {
        const formData = new FormData();
        formData.append('file', picFile);
        updates.push(uploadPicture(formData));
      }

      await Promise.all(updates);

      // Navigate based on what changed
      onSaved(preferencesChanged);
      onClose();

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    // Backdrop — pure gradient, no solid background components
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 "
      style={{
        background: 'rgba(0,0,0,0.15)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
      onClick={onClose}
    >
      {/* Modal — transparent, only gradient border + blur */}
      <div
  className="relative w-full max-w-2xl rounded-3xl my-8"
  style={{
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(70px)',
    WebkitBackdropFilter: 'blur(70px)',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 20px 80px rgba(0,0,0,0.35)',
    display: 'flex',
    flexDirection: 'column'
  }}

        onClick={(e) => e.stopPropagation()}
      >
        {/* Mac chrome */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-white/8 rounded-t-3xl"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
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
          <span className="text-white/50 text-xs font-semibold tracking-widest">
            EDIT PROFILE
          </span>
          <span className="text-white/20 text-xs">ESC to close</span>
        </div>

        <div className="p-8 space-y-6">

          {/* Error */}
          {error && (
            <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl overflow-hidden"
                 style={{ background: 'rgba(255,30,60,0.08)',
                          border: '1px solid rgba(255,30,60,0.3)' }}>
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />
              <span className="text-primary text-sm font-semibold pl-2">⚠️ {error}</span>
            </div>
          )}

          {/* Profile pic — now inside edit modal */}
          <div>
            <label className="text-xs font-bold text-white/40 tracking-widest mb-3 block">
              PROFILE PICTURE
            </label>
            <div className="flex items-center gap-5">
              {/* Avatar preview */}
              <div className="relative flex-shrink-0">
                {previewPic ? (
                  <img
                    src={previewPic}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                    style={{ boxShadow: '0 0 0 3px rgba(255,30,60,0.4)' }}
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                    style={{ background: 'rgba(255,255,255,0.05)',
                             border: '2px solid rgba(255,255,255,0.1)' }}
                  >
                    👤
                  </div>
                )}
                {picFile && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full
                                  bg-live flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </div>

              {/* Upload button */}
              <div>
                <label className="btn-glass cursor-pointer text-sm font-semibold px-5 py-2.5
                                   rounded-xl inline-block">
                  {picFile ? 'Change photo' : 'Upload photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePicSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-white/25 text-xs mt-2">
                  {picFile ? picFile.name : 'JPG, PNG up to 5MB'}
                </p>
              </div>
            </div>
          </div>

          {/* Name + Bio side by side */}
          <div className="grid grid-cols-2 gap-5">
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
            <div>
              <label className="text-xs font-bold text-white/40 tracking-widest mb-2 block">
                BIO
              </label>
              <input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full glass text-white px-4 py-3 rounded-xl outline-none
                           focus:border-primary/50 transition-all placeholder:text-white/20
                           text-sm font-medium"
              />
            </div>
          </div>

          {/* Sports preferences */}
          <div>
            <label className="text-xs font-bold text-white/40 tracking-widest mb-3 block">
              SPORTS PREFERENCES
            </label>
            <p className="text-white/25 text-xs mb-3">
              Changing preferences will refresh your feed
            </p>
            <div className="grid grid-cols-3 gap-3">
              {SPORTS.map((sport) => {
                const selected = genres.includes(sport.id);
                return (
                  <div
                    key={sport.id}
                    onClick={(e) => { e.stopPropagation(); toggleGenre(sport.id); }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all select-none ${
                      selected
                        ? 'border-primary/60 bg-primary/10'
                        : 'border-white/8 hover:border-white/20'
                    }`}
                    style={selected ? {} : { background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="text-2xl mb-2">{}</div>
                    <div className="text-white font-bold text-sm">{sport.label}</div>
                    <div className="text-white/40 text-xs mt-0.5 leading-snug">{sport.desc}</div>
                    {selected && (
                      <div className="mt-2 text-primary text-xs font-black">✓ Selected</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-white/50 hover:text-white
                         text-sm font-semibold transition-all border border-white/8"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 btn-primary py-3 rounded-xl text-sm font-bold
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

// ── Main Profile Page ──────────────────────────────────────
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
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

  // Called from modal — preferencesChanged drives navigation
  const handleSaved = (preferencesChanged) => {
    if (preferencesChanged) {
      // Preferences changed → go to feed so new content loads
      navigate('/feed');
    } else {
      // Only name/bio/pic changed → stay, refresh profile data
      loadProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
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
      {editOpen && (
        <EditModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={handleSaved}
        />
      )}

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Success toast */}
        {saveSuccess && (
          <div className="fixed top-20 right-6 z-40 glass px-5 py-3 rounded-2xl
                          border border-live/30 text-live text-sm font-semibold shadow-lg">
            ✓ Profile updated
          </div>
        )}

        {error && (
          <div className="glass rounded-xl px-4 py-3 mb-6 text-primary text-sm
                          border border-primary/30">
            {error}
          </div>
        )}

        {/* ── Hero ── */}
        <div className="text-center mb-12">

          {/* Avatar — no upload here, moved to edit modal */}
          <div className="relative inline-block mb-6">
            <div className="relative w-28 h-28 mx-auto">
              {profile?.profilePicturePath ? (
                <img
                  src={`http://localhost:8080/${profile.profilePicturePath}`}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover"
                  style={{
                    boxShadow: '0 0 0 3px rgba(255,30,60,0.5), 0 0 30px rgba(255,30,60,0.2)'
                  }}
                />
              ) : (
                <div
                  className="w-28 h-28 rounded-full glass flex items-center
                              justify-center text-5xl"
                  style={{
                    boxShadow: '0 0 0 3px rgba(255,30,60,0.3), 0 0 30px rgba(255,30,60,0.1)'
                  }}
                >
                  👤
                </div>
              )}
            </div>
            {/* Online dot */}
            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-live
                            border-2 border-ink">
              <span className="absolute bottom-0 right-0 w-full h-full rounded-full bg-live animate-ping opacity-75" />
            </div>
          </div>

          {/* Name */}
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            {profile?.user?.name || 'Your Name'}
          </h1>

          {/* Bio */}
          {profile?.bio ? (
            <p
              className="text-white/70 text-3xl max-w-sm mx-auto leading-relaxed mb-6"
              style={{ fontFamily: '"Great Vibes", cursive' }}
            >
              {profile.bio}
            </p>
          ) : (
            <p className="text-white/20 text-sm italic mb-6">No bio yet — add one!</p>
          )}

          {/* Genre badges */}
          <div className="flex items-center justify-center flex-wrap gap-3 mb-8">
            {profile?.genres?.map((genre) => {
              const meta = getSportMeta(genre);
              return (
                <div
                  key={genre}
                  className="flex items-center gap-2 glass px-4 py-2 rounded-full
                             border border-primary/30"
                >
                  <span className="text-white font-semibold text-sm">{meta.label}</span>
                </div>
              );
            })}
          </div>

          {/* Edit button */}
          <button
            onClick={() => setEditOpen(true)}
            className="btn-primary px-8 py-3 rounded-2xl text-sm font-bold"
          >
            Edit Profile
          </button>
        </div>

        {/* Stats */}
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
              {profile?.genres?.length === SPORTS.length ? 'All' : profile?.genres?.[0] || '—'}
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