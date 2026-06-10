import { Link } from 'react-router-dom';

const Landing = () => {

  const features = [
    { icon: '🏎️', title: 'F1 Dashboard', desc: 'Live standings, race results, lap timing and driver positions during race weekends.' },
    { icon: '🏏', title: 'Cricket Live', desc: 'Real-time scorecards, live match updates for IPL, Test, ODI and T20 matches.' },
    { icon: '📰', title: 'News Feed', desc: 'Aggregated news from 8+ premium sources including BBC Sport, Sky Sports and more.' },
    { icon: '📺', title: 'Video Hub', desc: 'Latest highlights from official YouTube channels, updated every 10 minutes.' },
    { icon: '🤖', title: 'AI Chatbot', desc: 'Ask anything about F1 or Cricket. Powered by Google Gemini AI.' },
    { icon: '⚡', title: 'Personalized', desc: 'Your feed tailored to your sports preferences. F1, Cricket, or both.' },
  ];

  const stats = [
    { value: '8+', label: 'News Sources' },
    { value: '22', label: 'API Endpoints' },
    { value: '100x', label: 'Faster with Cache' },
    { value: '24/7', label: 'Live Updates' },
  ];

  return (
    <div className="min-h-screen bg-dark">

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 border-b border-border bg-dark/80 backdrop-blur">
        <span className="text-2xl font-display tracking-wider">
          CONTROLLED<span className="text-primary">FEED</span>
        </span>
        <div className="flex gap-3">
          <Link to="/login" className="px-5 py-2 text-sm text-muted hover:text-white border border-border hover:border-white rounded-lg transition-all">
            Login
          </Link>
          <Link to="/signup" className="px-5 py-2 text-sm bg-primary hover:bg-red-700 text-white rounded-lg font-medium transition-all">
            Get Started
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">

        {/* Grid background */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(232,0,45,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(232,0,45,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        {/* Red glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center px-4 max-w-5xl mx-auto">

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse" />
            Live F1 & Cricket Updates
          </div>

          {/* Title */}
          <h1 className="font-display text-6xl md:text-9xl tracking-wider text-white mb-6 leading-none">
            YOUR SPORTS<br />
            <span className="text-primary">UNIVERSE</span><br />
            ONE FEED
          </h1>

          {/* Subtitle */}
          <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            The only platform that unifies F1 race data, cricket live scores,
            breaking news, and AI-powered insights into one intelligent feed.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="px-8 py-4 bg-primary hover:bg-red-700 text-white font-semibold rounded-lg transition-all text-lg">
              Start for Free →
            </Link>
            <Link to="/login" className="px-8 py-4 border border-border hover:border-white text-white font-semibold rounded-lg transition-all text-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-5xl text-primary mb-2">{stat.value}</div>
              <div className="text-muted text-sm uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl tracking-wider text-white mb-4">EVERYTHING YOU NEED</h2>
          <p className="text-muted text-lg">Built for serious sports fans who want more than just scores.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card-hover p-6 rounded-xl bg-card border border-border">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section className="py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-muted text-sm uppercase tracking-widest mb-8">Powered by</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Spring Boot', 'Kotlin', 'Redis', 'Kafka', 'Resilience4j', 'OpenF1 API', 'CricAPI', 'Gemini AI'].map((tech) => (
              <span key={tech} className="px-4 py-2 border border-border text-muted text-sm rounded-lg hover:border-primary hover:text-white transition-all">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-5xl tracking-wider text-white mb-6">READY TO RACE?</h2>
          <p className="text-muted mb-8">Join now and get your personalized sports feed instantly.</p>
          <Link to="/signup" className="inline-block px-10 py-4 bg-primary hover:bg-red-700 text-white font-semibold rounded-lg transition-all text-lg">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 text-center text-muted text-sm">
        <p>© 2025 Controlled Feed. Built with Spring Boot + React.</p>
      </footer>

    </div>
  );
};

export default Landing;