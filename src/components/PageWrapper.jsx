const PageWrapper = ({ children, className = '', beam = 'feed' }) => {
  const beamClass = {
    feed:    'bg-beam-feed',
    f1:      'bg-beam-f1',
    live:    'bg-beam-live',
    cricket: 'bg-beam-cricket',
    chat:    'bg-beam-chat',
    profile: 'bg-beam-profile',
  }[beam] || 'bg-beam-feed';

  return (
    <div className={`min-h-screen ${beamClass} pt-16 ${className}`}>
      {children}
    </div>
  );
};

export default PageWrapper;