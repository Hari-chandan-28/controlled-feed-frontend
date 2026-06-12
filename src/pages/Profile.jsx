import  { useState, useEffect } from 'react';
import { getProfile, uploadPicture } from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');

  // Load profile on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Handle profile picture upload
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
      // Reload profile to show new picture
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
        <div className="mb-8">
          <h1 className="text-3xl font-display tracking-wider text-white">PROFILE</h1>
          <p className="text-muted text-sm mt-1">Your account details and preferences</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
            ✅ Profile picture updated!
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">

          {/* Profile picture section */}
          <div className="p-6 border-b border-border flex items-center gap-6">

            {/* Avatar */}
            <div className="relative">
              {profile?.profilePicture ? (
                <img
                  src={`http://localhost:8080/${profile.profilePicture}`}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-surface border-2 border-border flex items-center justify-center text-3xl">
                  👤
                </div>
              )}

              {/* Upload overlay */}
              <label className="absolute inset-0 rounded-full cursor-pointer flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">Change</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <h2 className="text-white font-semibold text-lg">
                {profile?.bio ? profile.bio : 'No bio yet'}
              </h2>
              <p className="text-muted text-sm mt-1">
                {uploading ? '⏳ Uploading...' : 'Hover over picture to change'}
              </p>
            </div>
          </div>

          {/* Profile details */}
          <div className="p-6 space-y-4">

            {/* Bio */}
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-2">Bio</label>
              <p className="text-white text-sm bg-surface border border-border rounded-lg px-4 py-3">
                {profile?.bio || 'No bio added'}
              </p>
            </div>

            {/* Sports preferences */}
            <div>
              <label className="block text-xs text-muted uppercase tracking-wider mb-2">
                Sports Preferences
              </label>
              <div className="flex gap-2">
                {profile?.genres?.map((genre) => (
                  <span
                    key={genre}
                    className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-sm rounded-lg font-medium"
                  >
                    {genre === 'F1' ? '🏎️ Formula 1' : '🏏 Cricket'}
                  </span>
                ))}
                {(!profile?.genres || profile.genres.length === 0) && (
                  <span className="text-muted text-sm">No preferences set</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Stats Card */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <div className="text-3xl font-display text-primary mb-1">
              {profile?.genres?.length || 0}
            </div>
            <div className="text-muted text-xs uppercase tracking-wider">Sports Followed</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <div className="text-3xl font-display text-primary mb-1">
              {profile?.genres?.includes('F1') && profile?.genres?.includes('CRICKET') ? '2' :
               profile?.genres?.length === 1 ? '1' : '0'}
            </div>
            <div className="text-muted text-xs uppercase tracking-wider">Active Feeds</div>
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-6 bg-card border border-border rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Account Info</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted text-sm">Feed personalization</span>
              <span className="text-green-400 text-sm">✅ Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted text-sm">Redis caching</span>
              <span className="text-green-400 text-sm">✅ Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted text-sm">Auto content refresh</span>
              <span className="text-green-400 text-sm">✅ Every 10 mins</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted text-sm">AI chatbot</span>
              <span className="text-green-400 text-sm">✅ Active</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;