import React, { useState, useEffect } from 'react';
import { getProfile, uploadPicture, createProfile } from '../services/api';
import { updateProfile } from '../services/api';
import { useNavigate } from 'react-router-dom';


const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  // Editable fields
  const [bio, setBio] = useState('');
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
        setBio(res.data.bio || '');
        setGenres(res.data.genres || []);
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleGenre = (genre) => {
    setGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  // Save bio + genres
const handleSave = async () => {
  if (genres.length === 0) {
    setError('Select at least one sport.');
    return;
  }
  setSaving(true);
  setError('');
  setSaveSuccess(false);
  try {
    await updateProfile({ bio, genres });
    setSaveSuccess(true);
    setEditMode(false);
    const res = await getProfile();
    setProfile(res.data);
    // Show success then redirect to feed
      setTimeout(() => {
        navigate('/feed');
      }, 1500);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to save changes.');
  } finally {
    setSaving(false);
  }
};

  // Upload profile picture
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setUploadSuccess(false);
    setError('');
    try {
      await uploadPicture(formData);
      setUploadSuccess(true);
      const res = await getProfile();
      setProfile(res.data);
    } catch (err) {
      setError('Upload failed. Max size is 5MB.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center pt-16">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark pt-16">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display tracking-wider text-white">PROFILE</h1>
            <p className="text-muted text-sm mt-1">Manage your account and preferences</p>
          </div>
          <button
            onClick={() => {
              setEditMode(!editMode);
              setError('');
              setSaveSuccess(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              editMode
                ? 'bg-surface border border-border text-muted hover:text-white'
                : 'bg-primary hover:bg-red-700 text-white'
            }`}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        {uploadSuccess && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
            ✅ Profile picture updated!
          </div>
        )}
        {saveSuccess && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
            ✅ Profile saved successfully!
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">

          {/* Avatar section */}
          <div className="p-6 border-b border-border flex items-center gap-6">
            <div className="relative">
              {profile?.profilePicturePath ? (
              <img
              src={`http://localhost:8080/${profile.profilePicturePath}`}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-primary"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-surface border-2 border-border flex items-center justify-center text-3xl">
              👤
            </div>
          )}
              <label className="absolute inset-0 rounded-full cursor-pointer flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">
                  {uploading ? '...' : 'Change'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <p className="text-white font-semibold">
                {profile?.bio || 'No bio yet'}
              </p>
              <p className="text-muted text-xs mt-1">
                {uploading ? '⏳ Uploading...' : 'Hover picture to change'}
              </p>
            </div>
          </div>

          {/* Details section */}
          <div className="p-6 space-y-6">

            {/* Bio */}
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-2">Bio</label>
              {editMode ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full bg-surface border border-border text-white px-4 py-3 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted/50 resize-none"
                />
              ) : (
                <p className="text-white text-sm bg-surface border border-border rounded-lg px-4 py-3">
                  {profile?.bio || 'No bio added'}
                </p>
              )}
            </div>

            {/* Sports preferences */}
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-3">
                Sports Preferences
              </label>
              {editMode ? (
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
              ) : (
                <div className="flex gap-2">
                  {profile?.genres?.map((genre) => (
                    <span
                      key={genre}
                      className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-sm rounded-lg font-medium"
                    >
                      {genre === 'F1' ? '🏎️ Formula 1' : '🏏 Cricket'}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Save button - only in edit mode */}
            {editMode && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}

          </div>
        </div>

        {/* Account Info */}
        <div className="mt-6 bg-card border border-border rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Account Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Feed personalization', status: true },
              { label: 'Redis caching', status: true },
              { label: 'Auto content refresh', status: true },
              { label: 'AI chatbot', status: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-muted text-sm">{item.label}</span>
                <span className="text-green-400 text-sm">✅ Active</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;