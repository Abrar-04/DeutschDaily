import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, Bookmark, Check, CheckCircle2, ChevronDown,
  ChevronLeft, ChevronRight, Clock3, Headphones, Heart, Home, LibraryBig,
  Menu, Minus, Moon, Pause, Plus, Search, Sparkles, Sun, TrendingUp,
  X
} from 'lucide-react';
import type { Level, LevelFilter, Story } from './data/types';
import { getReadingMinutes, getStory, getWordCount, stories } from './data/stories';

const levels: Level[] = ['A2', 'B1', 'B2'];

function useStoredState<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved === null ? fallback : JSON.parse(saved) as T;
    } catch { return fallback; }
  });
  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue(previous => {
      const changed = typeof next === 'function'
        ? (next as (previous: T) => T)(previous) : next;
      try { localStorage.setItem(key, JSON.stringify(changed)); } catch { /* disabled storage */ }
      return changed;
    });
  }, [key]);
  return [value, update];
}

type AppState = {
  saved: string[];
  completed: string[];
  recent: string[];
  toggleSaved: (id: string) => void;
  markComplete: (id: string) => void;
  markViewed: (id: string) => void;
};

function App() {
  const [saved, setSaved] = useStoredState<string[]>('dd:saved', []);
  const [completed, setCompleted] = useStoredState<string[]>('dd:completed', []);
  const [recent, setRecent] = useStoredState<string[]>('dd:recent', []);
  const [dark, setDark] = useStoredState<boolean>('dd:dark', false);
  const location = useLocation();
  const toggleSaved = useCallback((id: string) => setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]), [setSaved]);
  const markComplete = useCallback((id: string) => setCompleted(prev => prev.includes(id) ? prev : [...prev, id]), [setCompleted]);
  const markViewed = useCallback((id: string) => setRecent(prev => [id, ...prev.filter(x => x !== id)].slice(0, 15)), [setRecent]);
  const state: AppState = { saved, completed, recent, toggleSaved, markComplete, markViewed };

  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, [dark]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [location.pathname]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="DeutschDaily home">
            <span className="brand-mark"><BookOpen size={21} strokeWidth={2.2} /></span>
            <span className="brand-name">deutsch<span>daily</span><span className="brand-dot">.</span></span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/library">Explore</NavLink>
            <NavLink to="/saved">Saved</NavLink>
            <NavLink to="/progress">My progress</NavLink>
          </nav>
          <button className="icon-button theme-toggle" type="button" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setDark(prev => !prev)}>
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main id="main" className="page-container">
        <Routes>
          <Route path="/" element={<HomePage state={state} />} />
          <Route path="/library" element={<LibraryPage state={state} />} />
          <Route path="/saved" element={<SavedPage state={state} />} />
          <Route path="/progress" element={<ProgressPage state={state} />} />
          <Route path="/story/:id" element={<ReaderRoute state={state} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'bottom-link active' : 'bottom-link'}><Home size={21} /><span>Home</span></NavLink>
        <NavLink to="/library" className={({ isActive }) => isActive ? 'bottom-link active' : 'bottom-link'}><LibraryBig size={21} /><span>Explore</span></NavLink>
        <NavLink to="/saved" className={({ isActive }) => isActive ? 'bottom-link active' : 'bottom-link'}><Bookmark size={21} /><span>Saved</span></NavLink>
        <NavLink to="/progress" className={({ isActive }) => isActive ? 'bottom-link active' : 'bottom-link'}><TrendingUp size={21} /><span>Progress</span></NavLink>
      </nav>
    </div>
  );
}

function HomePage({ state }: { state: AppState }) {
  const latestStory = state.recent.map(getStory).find(Boolean);
  const storyPicks = [
    ...levels.map(level => stories.find(story => story.level === level)),
    stories.find(story => story.level === 'A2' && story.id !== stories.find(s => s.level === 'A2')?.id)
  ].filter((story): story is Story => Boolean(story));
  const completedExisting = stories.filter(s => state.completed.includes(s.id)).length;
  return (
    <div className="home-page page-enter">
      <div className="eyebrow top-eyebrow"><span className="eyebrow-star">✳</span> LITTLE STORIES, BIG PROGRESS</div>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-kicker"><span className="kicker-dot" /> DEIN TÄGLICHES DEUTSCH</div>
          <h1>Make room for<br /><em>a little German.</em></h1>
          <p>Curious stories, real-life language, and just a few minutes a day. Your German reading habit starts here.</p>
          <Link to="/library" className="button button-primary hero-cta">Find your next story <ArrowRight size={18} /></Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="hero-art-circle circle-one" /><span className="hero-art-circle circle-two" />
          <span className="hero-book">Aa<span>ä ö ü</span></span>
          <span className="hero-sticker sticker-top">Guten Tag! <span>✦</span></span>
          <span className="hero-sticker sticker-bottom">One story at a time ↗</span>
        </div>
      </section>

      <section className="section-block" aria-labelledby="level-title">
        <div className="section-heading"><div><div className="eyebrow">PICK YOUR PATH</div><h2 id="level-title">Choose your level<span className="heading-period">.</span></h2></div><Link to="/library" className="text-link">Explore all <ArrowRight size={16} /></Link></div>
        <div className="level-grid">
          <Link to="/library?level=A2" className="level-tile level-a2"><div className="level-top"><span>BUILD THE BASICS</span><ArrowRight size={19}/></div><div className="level-big">A2</div><div className="level-bottom">Simple, everyday stories <span>↗</span></div></Link>
          <Link to="/library?level=B1" className="level-tile level-b1"><div className="level-top"><span>FIND YOUR FLOW</span><ArrowRight size={19}/></div><div className="level-big">B1</div><div className="level-bottom">More words, more confidence <span>↗</span></div></Link>
          <Link to="/library?level=B2" className="level-tile level-b2"><div className="level-top"><span>GO A LITTLE DEEPER</span><ArrowRight size={19}/></div><div className="level-big">B2</div><div className="level-bottom">Thoughtful, interesting reads <span>↗</span></div></Link>
        </div>
        <div className="soon-strip"><span className="soon-icon">✧</span><span><strong>C1 & C2</strong> are on their way</span><span className="coming-pill">Coming soon</span></div>
      </section>

      {latestStory && (
        <section className="section-block compact-section">
          <div className="section-heading"><div><div className="eyebrow">PICK UP WHERE YOU LEFT OFF</div><h2>Continue reading<span className="heading-period">.</span></h2></div></div>
          <Link className={`continue-card color-${latestStory.color}`} to={`/story/${latestStory.id}`}><span className="continue-emoji">{latestStory.emoji}</span><span className="continue-copy"><span className="story-meta">{latestStory.level} · {getReadingMinutes(latestStory)} min read</span><strong>{latestStory.title}</strong><span>{state.completed.includes(latestStory.id) ? 'Read again' : 'Pick up your story'}</span></span><ArrowRight size={21} /></Link>
        </section>
      )}

      <section className="section-block" aria-labelledby="discover-title">
        <div className="section-heading"><div><div className="eyebrow">A GOOD PLACE TO START</div><h2 id="discover-title">Fresh on the shelf<span className="heading-period">.</span></h2></div><Link to="/library" className="text-link">See all stories <ArrowRight size={16} /></Link></div>
        <div className="story-grid">{storyPicks.map(story => <StoryCard key={story.id} story={story} state={state} />)}</div>
      </section>

      <section className="bottom-message"><div className="message-flower">✳</div><div><h2>Small steps count.</h2><p>{completedExisting ? `You've finished ${completedExisting} ${completedExisting === 1 ? 'story' : 'stories'}. Keep the momentum going!` : 'Even five minutes of reading can become a habit worth keeping.'}</p></div><Link to="/progress" className="button button-secondary">My progress <ArrowRight size={16}/></Link></section>
      <footer className="page-footer">Made for curious German learners <Heart size={14} fill="currentColor" /> <span>Original stories · No account needed</span></footer>
    </div>
  );
}

function StoryCard({ story, state }: { story: Story; state: AppState }) {
  const bookmarked = state.saved.includes(story.id);
  const finished = state.completed.includes(story.id);
  return (
    <article className="story-card">
      <Link to={`/story/${story.id}`} className="story-main-link" aria-label={`Read ${story.title}`}>
        <div className={`story-art color-${story.color}`}><span>{story.emoji}</span>{finished && <span className="read-badge"><Check size={13}/> Read</span>}</div>
        <div className="story-card-content"><div className="story-meta"><span className="level-badge">{story.level}</span><span>{story.category}</span><span className="meta-dot">·</span><Clock3 size={13} /><span>{getReadingMinutes(story)} min</span></div><h3>{story.title}</h3><p>{story.subtitle}</p></div>
      </Link>
      <button className={`bookmark-card ${bookmarked ? 'is-saved' : ''}`} aria-label={bookmarked ? `Remove ${story.title} from saved` : `Save ${story.title}`} title={bookmarked ? 'Remove bookmark' : 'Bookmark'} onClick={() => state.toggleSaved(story.id)}><Bookmark size={19} fill={bookmarked ? 'currentColor' : 'none'}/></button>
    </article>
  );
}

function LibraryPage({ state }: { state: AppState }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const raw = params.get('level');
  const currentLevel: LevelFilter = raw && levels.includes(raw as Level) ? raw as Level : 'All';
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  useEffect(() => { setVisibleCount(12); }, [currentLevel, query]);
  const filtered = useMemo(() => stories.filter(story => {
    const matchesLevel = currentLevel === 'All' || story.level === currentLevel;
    const search = `${story.title} ${story.subtitle} ${story.category}`.toLocaleLowerCase('de');
    return matchesLevel && search.includes(query.trim().toLocaleLowerCase('de'));
  }), [currentLevel, query]);
  const setFilter = (level: LevelFilter) => navigate(level === 'All' ? '/library' : `/library?level=${level}`);

  return (
    <div className="page-enter">
      <div className="interior-heading"><div className="eyebrow">YOUR STORY LIBRARY</div><h1>Find something <em>good to read.</em></h1><p>Interesting little stories, carefully written for your level. Pick one and settle in.</p></div>
      <div className="library-controls"><label className="search-box"><Search size={19}/><span className="sr-only">Search stories</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search stories or topics..." type="search" /></label><div className="filter-row" aria-label="Filter by German level"><span className="filter-label">LEVEL</span>{(['All', ...levels] as LevelFilter[]).map(level => <button type="button" key={level} className={`filter-chip ${currentLevel === level ? 'selected' : ''}`} aria-pressed={currentLevel === level} onClick={() => setFilter(level)}>{level === 'All' ? 'All levels' : level}</button>)}</div></div>
      <div className="results-heading"><span>{filtered.length} {filtered.length === 1 ? 'story' : 'stories'} available</span><span className="target-note">150 reading texts · 50 per level</span></div>
      {filtered.length ? <><div className="story-grid library-grid">{filtered.slice(0, visibleCount).map(story => <StoryCard key={story.id} story={story} state={state}/>)}</div>{visibleCount < filtered.length && <div className="load-more"><p>Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} stories</p><button className="button button-secondary" type="button" onClick={() => setVisibleCount(count => count + 12)}>Load more stories <ChevronDown size={17}/></button></div>}</> : <div className="empty-state"><Search size={31}/><h2>No stories found</h2><p>Try a different search or choose another level.</p><button className="button button-secondary" onClick={() => {setQuery('');setFilter('All');}}>Clear filters</button></div>}
      <div className="upcoming-block"><div className="upcoming-symbol">✦</div><div><h3>Keep exploring, one level at a time.</h3><p>Explore 50 reading texts in each of A2, B1, and B2. C1 and C2 will follow later.</p></div><span className="coming-pill">C1 · C2 soon</span></div>
    </div>
  );
}

function SavedPage({ state }: { state: AppState }) {
  const savedStories = state.saved.map(getStory).filter((s): s is Story => Boolean(s));
  return <div className="page-enter"><div className="interior-heading"><div className="eyebrow">YOUR LITTLE COLLECTION</div><h1>Stories worth <em>keeping.</em></h1><p>All the reads you bookmarked, in one cozy place.</p></div>{savedStories.length ? <div className="story-grid library-grid">{savedStories.map(story => <StoryCard key={story.id} story={story} state={state}/>)}</div> : <div className="empty-state"><Bookmark size={34}/><h2>Nothing saved yet</h2><p>See a story you like? Tap the bookmark and it’ll show up here.</p><Link to="/library" className="button button-primary">Explore stories <ArrowRight size={17}/></Link></div>}</div>;
}

function ProgressPage({ state }: { state: AppState }) {
  const finished = stories.filter(s => state.completed.includes(s.id));
  const visited = stories.filter(s => state.recent.includes(s.id));
  return <div className="page-enter"><div className="interior-heading"><div className="eyebrow">EVERY PAGE COUNTS</div><h1>Your reading <em>journey.</em></h1><p>Progress is about showing up. See how far you've come and keep going.</p></div>
    <div className="stat-grid"><div className="stat-card"><div className="stat-icon stat-peach"><CheckCircle2 size={23}/></div><strong>{finished.length}</strong><span>Stories finished</span></div><div className="stat-card"><div className="stat-icon stat-lavender"><BookOpen size={23}/></div><strong>{visited.length}</strong><span>Stories opened</span></div><div className="stat-card"><div className="stat-icon stat-sage"><Bookmark size={23}/></div><strong>{state.saved.filter(id => Boolean(getStory(id))).length}</strong><span>Stories saved</span></div></div>
    <div className="progress-panel"><div className="eyebrow">LEVEL BY LEVEL</div><h2>Keep building your confidence</h2><p>Your completed stories across all three levels.</p><div className="progress-bars">{levels.map(level => { const available = stories.filter(s => s.level === level).length; const done = finished.filter(s => s.level === level).length; return <div className="progress-row" key={level}><div className="progress-label"><strong>{level}</strong><span>{done} of {available} stories</span></div><div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={available} aria-valuenow={done} aria-label={`${level} stories finished`}><div className={`progress-fill fill-${level.toLowerCase()}`} style={{ width: `${available ? done / available * 100 : 0}%` }}/></div></div>; })}</div></div>
    <div className="tip-panel"><div className="tip-icon"><Sparkles size={24}/></div><div><h3>A gentle reminder</h3><p>Ten good minutes with one story can be more useful than an hour of distracted studying. You're doing great just by coming back.</p></div></div>
    <div className="install-panel"><div><div className="eyebrow">MAKE IT FEEL LIKE AN APP</div><h3>Put DeutschDaily on your home screen</h3><p>On Android Chrome, open the browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>. The PWA works best when visited on HTTPS after deployment.</p></div><div className="install-emoji" aria-hidden="true">📱</div></div>
    <Link to="/library" className="button button-primary progress-action">Read another story <ArrowRight size={17}/></Link>
  </div>;
}

function ReaderRoute({ state }: { state: AppState }) {
  const { id } = useParams<{id: string}>();
  const story = id ? getStory(id) : undefined;
  if (!story) return <NotFound />;
  return <StoryReader key={story.id} story={story} state={state} />;
}

function StoryReader({ story, state }: { story: Story; state: AppState }) {
  const [translationOpen, setTranslationOpen] = useState(false);
  const [fontSize, setFontSize] = useStoredState<number>('dd:font-size', 19);
  const [speaking, setSpeaking] = useState(false);
  const [speed, setSpeed] = useState(0.85);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const navigate = useNavigate();
  const saved = state.saved.includes(story.id);
  const completed = state.completed.includes(story.id);
  const totalAnswered = Object.keys(answers).length;
  const score = story.questions.reduce((sum, question, idx) => sum + (answers[idx] === question.answer ? 1 : 0), 0);
  const voiceAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    state.markViewed(story.id);
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
  }, [story.id, state.markViewed]);

  const toggleSpeech = () => {
    if (!voiceAvailable) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(story.german.join('\n\n'));
    speech.lang = 'de-DE';
    speech.rate = speed;
    speech.onend = () => setSpeaking(false);
    speech.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(speech);
  };

  const currentIndex = stories.findIndex(s => s.id === story.id);
  const nextStory = stories[(currentIndex + 1) % stories.length];

  return <div className="reader-shell page-enter">
    <div className="reader-top-row"><button className="back-button" onClick={() => navigate(-1)}><ArrowLeft size={18}/> Back</button><div className="reader-top-actions"><button className={`reader-icon-button ${saved ? 'active' : ''}`} onClick={() => state.toggleSaved(story.id)} aria-label={saved ? 'Remove bookmark' : 'Save story'}><Bookmark size={19} fill={saved ? 'currentColor' : 'none'}/></button></div></div>
    <div className="reader-heading"><div className="reader-labels"><span className="level-badge reader-level">{story.level}</span><span>{story.category}</span><span className="meta-dot">·</span><Clock3 size={14}/><span>{getReadingMinutes(story)} min read</span></div><div className={`reader-cover color-${story.color}`}><span>{story.emoji}</span></div><h1>{story.title}</h1><p>{story.subtitle}</p></div>
    <div className="reader-tools"><button disabled={!voiceAvailable} className={`listen-button ${speaking ? 'is-speaking' : ''}`} onClick={toggleSpeech}>{speaking ? <Pause size={18} fill="currentColor" /> : <Headphones size={19}/>} {speaking ? 'Stop audio' : 'Listen to story'}</button><button className="speed-button" disabled={!voiceAvailable} onClick={() => { if (speaking) {window.speechSynthesis.cancel(); setSpeaking(false);} setSpeed(prev => prev === 0.85 ? 1 : 0.85); }} aria-label="Change playback speed">{speed === 0.85 ? '0.85×' : '1×'}</button><div className="font-controls" aria-label="Reading font size"><button onClick={() => setFontSize(prev => Math.max(16, prev - 1))} disabled={fontSize <= 16} aria-label="Decrease font size"><Minus size={18}/></button><span>Aa</span><button onClick={() => setFontSize(prev => Math.min(25, prev + 1))} disabled={fontSize >= 25} aria-label="Increase font size"><Plus size={18}/></button></div></div>
    {!voiceAvailable && <p className="small-note">German audio is not available in this browser.</p>}
    <article className="reading-body" lang="de" style={{ fontSize: `${fontSize}px` }}>{story.german.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}</article>
    <div className="translation-section"><button className="translation-toggle" onClick={() => setTranslationOpen(v => !v)} aria-expanded={translationOpen}><span className="translation-icon">EN</span><span><strong>English translation</strong><small>{translationOpen ? 'Hide translation' : 'Check your understanding'}</small></span>{translationOpen ? <ChevronDown className="up" size={20}/> : <ChevronDown size={20}/>}</button>{translationOpen && <div className="translation-content" lang="en">{story.english.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}</div>}</div>
    <section className="quiz-section"><div className="quiz-eyebrow"><Sparkles size={16}/> QUICK KNOWLEDGE CHECK</div><h2>Did you catch the details?</h2><p>Three little questions to see what stuck. No pressure.</p><div className="quiz-questions">{story.questions.map((q, index) => <div key={index} className="quiz-question"><div className="question-heading"><span>{String(index + 1).padStart(2, '0')}</span><h3>{q.question}</h3></div><div className="quiz-options">{q.options.map((option, optionIdx) => { const selected = answers[index] === optionIdx; const answered = answers[index] !== undefined; const correct = optionIdx === q.answer; const cls = answered && correct ? 'correct' : selected && !correct ? 'incorrect' : ''; return <button key={optionIdx} className={`quiz-option ${cls}`} disabled={answered} onClick={() => setAnswers(prev => ({ ...prev, [index]: optionIdx }))}><span className="option-letter">{String.fromCharCode(65 + optionIdx)}</span><span>{option}</span>{answered && correct && <Check size={17}/>}{selected && !correct && <X size={17}/>}</button>; })}</div>{answers[index] !== undefined && <p className={`question-feedback ${answers[index] === q.answer ? 'good' : ''}`}>{answers[index] === q.answer ? '✓ Richtig! ' : 'Not quite. '}{q.explanation}</p>}</div>)}</div>{totalAnswered === story.questions.length && <div className="quiz-finish"><div className="quiz-score"><span>YOUR SCORE</span><strong>{score} / {story.questions.length}</strong></div><p>{score === 3 ? 'Wunderbar! You caught every detail.' : 'Nice work! Every question helps you learn.'}</p><button className="button button-primary" onClick={() => state.markComplete(story.id)} disabled={completed}>{completed ? <><CheckCircle2 size={18}/> Story completed</> : <><Check size={18}/> Mark as finished</>}</button></div>}</section>
    <div className="reader-next"><div><div className="eyebrow">KEEP THE GOOD THING GOING</div><h3>One more story?</h3></div><Link className="next-story-link" to={`/story/${nextStory.id}`}><span>{nextStory.title}</span><ChevronRight size={21}/></Link></div>
    <div className="reader-bottom-link"><Link to="/library"><ChevronLeft size={16}/> Back to all stories</Link><span>{getWordCount(story)} German words</span></div>
  </div>;
}

function NotFound() { return <div className="empty-state not-found"><Menu size={32}/><h1>We got a little lost.</h1><p>That page doesn't exist, but there are plenty of stories waiting for you.</p><Link className="button button-primary" to="/">Back home <ArrowRight size={17}/></Link></div>; }

export default App;
