import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

// Updated to 2026 grid
const LIVE_TIMING_MOCK = [
  { pos: 1, name: 'Max Verstappen',   team: 'Red Bull Racing', gap: 'LEADER', color: '#1E41FF' },
  { pos: 2, name: 'Charles Leclerc', team: 'Ferrari',          gap: '+1.203', color: '#DC0000' },
  { pos: 3, name: 'Lando Norris',    team: 'McLaren',          gap: '+3.671', color: '#FF8700' },
  { pos: 4, name: 'Kimi Antonelli',  team: 'Mercedes',         gap: '+5.982', color: '#00D2BE' },
  { pos: 5, name: 'Fernando Alonso', team: 'Aston Martin',     gap: '+8.441', color: '#006F62' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-beam font-sans overflow-x-hidden">

      {/* ── Ticker strip ── */}
      <div className="w-full h-9 overflow-hidden flex items-center border-b border-white/5"
           style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)' }}>
        <div className="ticker-track flex gap-16 whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-8">
              <span className="flex items-center gap-2 text-xs font-medium text-white/60">
                <span className="dot-live" /> LIVE
                <span className="text-white font-semibold ml-1">P1 VERSTAPPEN</span>
                <span className="text-white/40 ml-1">1:23.456</span>
              </span>
              <span className="text-xs font-medium text-white/60">
                IND <span className="text-white font-semibold">287/4</span>
                <span className="text-white/40 ml-1">(42.3 OV)</span>
              </span>
              <span className="text-xs font-medium text-white/60">
                NEXT RACE <span className="text-white font-semibold">BRITISH GP</span>
                <span className="text-white/40 ml-1">in 3d 06h 14m</span>
              </span>
              <span className="text-xs font-medium text-white/60">
                ENG <span className="text-white font-semibold">312/8</span>
                <span className="text-white/40 ml-1">(50 OV)</span>
              </span>
            </div>
          ))}
        </div>
      </div>


      {/* ── Nav ── */}
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo with spider icon */}
        <div className="flex items-center gap-2.5">
          <img
            src={logo}
            alt="Sportiva logo"
            className="w-20 h-20 object-contain"
            // style={{ filter: 'brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(320deg)' }}
          />
          <div className="text-xl font-black tracking-tight text-white">
            SPORT<span className="text-primary">IVA</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-glass text-sm px-5 py-2">Sign in</Link>
          <Link to="/signup" className="btn-primary text-sm px-5 py-2">Get started →</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-8 text-center">
        <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8">
          <span className="dot-live" />
          <span className="text-xs font-semibold text-live tracking-widest">
            LIVE F1 + CRICKET DATA
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6 text-white">
          It's time to{' '}
          <span className="text-gradient">stop refreshing</span>
        </h1>

        <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Race timing, live scores, and breaking news — unified into one
          feed that updates while you watch.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/signup" className="btn-primary text-base px-8 py-4">
            Get Sportiva for free →
          </Link>
          <Link to="/login"
            className="text-white/70 hover:text-white text-sm font-semibold transition-colors underline underline-offset-4">
            Already have an account?
          </Link>
        </div>
      </section>

      {/* ── Floating product window ── */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="glass rounded-2xl overflow-hidden"
             style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>

          {/* Mac-style window chrome with hover effect */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8"
               style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex gap-2 group">
              {/* Red close */}
              <div className="relative w-3 h-3 rounded-full bg-[#FF5F57] cursor-pointer
                              flex items-center justify-center">
                <span className="absolute opacity-0 group-hover:opacity-100 text-[#800000]
                                 text-[8px] font-black leading-none transition-opacity">✕</span>
              </div>
              {/* Yellow minimise */}
              <div className="relative w-3 h-3 rounded-full bg-[#FFBD2E] cursor-pointer
                              flex items-center justify-center">
                <span className="absolute opacity-0 group-hover:opacity-100 text-[#7d5900]
                                 text-[8px] font-black leading-none transition-opacity">−</span>
              </div>
              {/* Green maximise */}
              <div className="relative w-3 h-3 rounded-full bg-[#28C840] cursor-pointer
                              flex items-center justify-center">
                <span className="absolute opacity-0 group-hover:opacity-100 text-[#006400]
                                 text-[8px] font-black leading-none transition-opacity">+</span>
              </div>
            </div>

            <div className="flex gap-1">
              {['Live Timing', 'Cricket', 'News Feed'].map((tab, i) => (
                <div key={tab}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    i === 0
                      ? 'bg-primary text-white'
                      : 'text-white/50 hover:text-white/80'
                  }`}>
                  {tab}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="dot-live" />
              <span className="text-xs font-bold text-live">LIVE</span>
            </div>
          </div>

          {/* Window content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* F1 timing tower — 2026 drivers */}
            <div className="p-6 border-r border-white/5">
              <div className="text-xs font-bold text-white/50 tracking-widest mb-4">
                DRIVER POSITIONS · LAP 42/58
              </div>
              {LIVE_TIMING_MOCK.map((d) => (
                <div key={d.pos}
                  className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <div className={`w-6 text-center text-xs font-bold ${
                    d.pos === 1 ? 'text-orange' : 'text-white/50'
                  }`}>
                    {d.pos}
                  </div>
                  <div className="w-0.5 h-5 rounded-full flex-shrink-0"
                       style={{ background: d.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{d.name}</div>
                    <div className="text-white/50 text-xs">{d.team}</div>
                  </div>
                  <div className={`text-xs font-bold ${
                    d.pos === 1 ? 'text-live' : 'text-white/70'
                  }`}>
                    {d.gap}
                  </div>
                </div>
              ))}
            </div>

            {/* Cricket + news */}
            <div className="p-6 flex flex-col gap-5">
              <div className="glass rounded-xl p-4">
                <div className="text-xs font-bold text-orange tracking-widest mb-3">
                  CRICKET · LIVE
                </div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-white font-bold text-sm">India</span>
                  <span className="text-white text-2xl font-black">287/4</span>
                </div>
                <div className="text-white/50 text-xs mb-3">
                  42.3 overs · need 64 off 46 balls
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-white/60 font-semibold text-sm">England</span>
                  <span className="text-white/60 text-lg font-bold">312/8</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-white/50 tracking-widest mb-3">
                  LATEST NEWS
                </div>
                {[
                  { source: 'BBC SPORT F1', title: 'Verstappen extends championship lead after Suzuka win' },
                  { source: 'ESPNCRICINFO', title: 'India clinch series with commanding 6-wicket victory' },
                ].map((n) => (
                  <div key={n.source} className="glass rounded-xl p-3 mb-2 last:mb-0
                                                  hover:border-primary/30 transition-all">
                    <div className="text-xs font-bold text-primary mb-1">{n.source}</div>
                    <div className="text-white/80 text-sm font-medium leading-snug">{n.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="glass rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8">
          {[
            { val: '8+', label: 'NEWS SOURCES' },
            { val: '22', label: 'API ENDPOINTS' },
            { val: '4s', label: 'LIVE REFRESH' },
            { val: '24/7', label: 'ALWAYS ON' },
          ].map((s) => (
            <div key={s.label} className="py-6 text-center">
              <div className="text-2xl font-black mb-1" style={{ color: '#BAE6FD' }}>{s.val}</div>
              <div className="text-xs font-semibold text-white/50 tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-xs font-bold text-primary tracking-widest mb-3">HOW IT WORKS</div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-12 text-white">
          One feed that updates itself
        </h2>
        <div className="flex flex-col gap-6 max-w-xl">
          {[
            { n: '01', text: 'Pick F1, Cricket, or both — your feed personalizes instantly to what you follow.' },
            { n: '02', text: 'We pull live timing, scores, and news from 8+ sources automatically every few seconds.' },
            { n: '03', text: 'Just leave it open. The feed refreshes itself — no manual checking required.' },
          ].map((s) => (
            <div key={s.n} className="flex gap-5 items-start">
              <div className="glass w-10 h-10 rounded-xl flex items-center justify-center
                              flex-shrink-0 text-sm font-black text-white/60">
                {s.n}
              </div>
              <p className="text-white/70 text-base leading-relaxed pt-2">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      {/* <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-xs font-bold text-primary tracking-widest mb-3">LOVED BY FANS</div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-10 text-white">
          Built for people who don't miss a moment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { q: "I used to have six tabs open during a race weekend. Now it's just one.", name: 'Aanya R.', role: 'F1 fan', init: 'A' },
            { q: 'The live cricket scorecard updates faster than the app I was using before.', name: 'Karthik M.', role: 'Cricket fan', init: 'K' },
            { q: 'The AI chat actually knows F1 history. Asked it about 2004 and it nailed it.', name: 'Sara P.', role: 'Beta user', init: 'S' },
          ].map((t) => (
            <div key={t.name} className="glass rounded-2xl p-6 hover:border-white/15 transition-all">
              <p className="text-white/70 text-sm leading-relaxed mb-5">"{t.q}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30
                                flex items-center justify-center text-sm font-bold text-primary">
                  {t.init}
                </div>
                <div>
                  <div className="text-white text-sm font-bold">{t.name}</div>
                  <div className="text-white/50 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section> */}
      {/* ── AI Chatbot feature ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Left — text */}
          <div>
           <div className="text-xs font-bold tracking-widest mb-3" style={{ color: '#93C5FD' }}>
            AI CHATBOT
          </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-5 text-white">
              Ask anything about{' '}
              <span style={{ color: '#BAE6FD' }}>F1 and Cricket</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-6">
              Our AI knows the full history of Formula 1 and Cricket —
              race results, driver stats, team records, legendary moments.
              Ask it anything, get an instant answer.
            </p>
            <div className="flex flex-col gap-3">
              {[
                '🏎️  Who has the most pole positions in F1 history?',
                '🏏  What was India\'s highest ODI score?',
                '🏆  Which team won the 2021 constructors championship?',
              ].map((q) => (
                <div key={q}
                  className="glass rounded-xl px-4 py-3 text-sm text-white/70 font-medium
                             hover:text-white hover:border-primary/30 transition-all cursor-default">
                  {q}
                </div>
              ))}
            </div>
          </div>

          {/* Right — chat window mockup */}
          <div className="glass rounded-2xl overflow-hidden"
               style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>

            {/* Mac chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 group"
                 style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="relative w-3 h-3 rounded-full bg-[#FF5F57] cursor-pointer
                              flex items-center justify-center">
                <span className="absolute opacity-0 group-hover:opacity-100 text-[#800000]
                                 text-[8px] font-black leading-none transition-opacity">✕</span>
              </div>
              <div className="relative w-3 h-3 rounded-full bg-[#FFBD2E] cursor-pointer
                              flex items-center justify-center">
                <span className="absolute opacity-0 group-hover:opacity-100 text-[#7d5900]
                                 text-[8px] font-black leading-none transition-opacity">−</span>
              </div>
              <div className="relative w-3 h-3 rounded-full bg-[#28C840] cursor-pointer
                              flex items-center justify-center">
                <span className="absolute opacity-0 group-hover:opacity-100 text-[#006400]
                                 text-[8px] font-black leading-none transition-opacity">+</span>
              </div>
              <span className="ml-2 text-xs font-semibold text-white/40">
                Sportiva AI · F1 & Cricket
              </span>
            </div>

            {/* Chat messages */}
            <div className="p-5 flex flex-col gap-4">
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-primary/20 border border-primary/30 rounded-2xl
                                rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                  <p className="text-white text-sm font-medium">
                    Who has the most F1 championships?
                  </p>
                </div>
              </div>

              {/* AI response */}
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30
                                flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">🤖</span>
                </div>
                <div className="glass rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                  <p className="text-white/80 text-sm leading-relaxed">
                    <span className="text-white font-bold">Lewis Hamilton</span> and{' '}
                    <span className="text-white font-bold">Michael Schumacher</span> share
                    the record with <span className="text-primary font-bold">7 World Championships</span> each.
                    Hamilton achieved his titles with McLaren (2008) and Mercedes (2014–2020).
                  </p>
                </div>
              </div>

              {/* User message 2 */}
              <div className="flex justify-end">
                <div className="bg-primary/20 border border-primary/30 rounded-2xl
                                rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                  <p className="text-white text-sm font-medium">
                    What about cricket's highest individual score?
                  </p>
                </div>
              </div>

              {/* AI response 2 */}
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30
                                flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">🤖</span>
                </div>
                <div className="glass rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                  <p className="text-white/80 text-sm leading-relaxed">
                    <span className="text-white font-bold">Brian Lara</span> holds the
                    record with <span className="text-primary font-bold">400* (not out)</span> for
                    West Indies vs England in 2004 — the highest individual Test score ever.
                  </p>
                </div>
              </div>

              {/* Input bar */}
              <div className="flex items-center gap-2 mt-2 glass rounded-xl px-4 py-3">
                <span className="text-white/30 text-sm flex-1">Ask about F1 or Cricket...</span>
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center
                                cursor-pointer hover:bg-primary-hover transition-colors">
                  <span className="text-white text-xs font-bold">↑</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 mt-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <img src={logo}
            alt="Sportiva logo"
            className="w-20 h-20 object-contain"  />
            <div className="text-base font-black tracking-tight text-white">
              SPORT<span className="text-primary">IVA</span>
            </div>
          </div>
          <div className="text-white/30 text-xs">
            Built with Spring Boot · React · OpenF1 · CricAPI
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;