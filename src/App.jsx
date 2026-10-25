import { useEffect, useState } from 'react';
import { ArrowDownUp, BookOpen, Clock3, Gift, Heart, Plus, Repeat2, Search, Send, SlidersHorizontal, Sparkles, UserRound, X } from 'lucide-react';
import { initialBooks, readStored } from './data/books.js';

function BookCover({ book }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="cover" style={{ '--cover': book.color }}>
      {imageFailed ? <div className="cover-fallback"><span>{book.title}</span><small>{book.author}</small></div> : <img src={`https://covers.openlibrary.org/b/isbn/${encodeURIComponent(book.cover)}-M.jpg?default=false`} alt={`${book.title} cover`} loading="lazy" onError={() => setImageFailed(true)} />}
      <span className={`availability ${book.available ? '' : 'reserved'}`}>{book.swap ? 'BOOK SWAP' : book.donated ? 'DONATION' : book.free || book.price === 0 ? 'FREE BOOK' : book.available ? 'AVAILABLE' : 'RESERVED'}</span>
    </div>
  );
}

function BookCard({ book, saved, onSave, onContact, onWaitlist }) {
  return (
    <article className="book-card">
      <div className="cover-wrap">
        <BookCover book={book} />
        <button className={`save-button ${saved ? 'saved' : ''}`} aria-label={saved ? 'Remove from saved books' : 'Save to saved books'} onClick={() => onSave(book.id)}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button>
      </div>
      <div className="book-info">
        <div className="book-kicker"><div className="course">{book.course}</div>{book.difficulty && <span className={`difficulty-tag difficulty-${book.difficulty.toLowerCase()}`}>{book.difficulty}</span>}</div>
        <h2 className="book-title">{book.title}</h2>
        <div className="author">{book.author}</div>
        <div className="card-meta"><strong className="price">{book.swap ? 'Swap' : book.donated ? 'Donated' : book.free || book.price === 0 ? 'Free' : `$${book.price}`}</strong><span className="condition">{book.condition}</span></div>
        <div className="card-bottom"><span className="freshness"><Clock3 size={12} />{book.available ? `Checked ${book.updated}` : `Updated ${book.updated}`}</span><button className="card-action" onClick={() => (book.available ? onContact(book) : onWaitlist(book))}>{book.available ? book.swap ? 'Propose a swap' : book.free || book.price === 0 ? 'Claim this book' : 'Message seller' : 'Join waitlist'} <span aria-hidden="true">→</span></button></div>
      </div>
    </article>
  );
}

function FilterPanel({ course, setCourse, difficulty, setDifficulty, condition, setCondition, min, setMin, max, setMax, available, setAvailable, courses, onClear, mobile = false }) {
  return (
    <aside className={`filters ${mobile ? 'mobile-open' : ''}`}>
      <div className="filter-heading"><strong>Refine results</strong><button className="text-button" onClick={onClear}>Clear all</button></div>
      <div className="filter-block"><label className="filter-label" htmlFor={mobile ? 'course-mobile' : 'course-filter'}>Course</label><select id={mobile ? 'course-mobile' : 'course-filter'} value={course} onChange={event => setCourse(event.target.value)}><option value="">All courses</option>{courses.map(item => <option key={item}>{item}</option>)}</select></div>
      <div className="filter-block"><label className="filter-label" htmlFor={mobile ? 'difficulty-mobile' : 'difficulty-filter'}>Difficulty</label><select id={mobile ? 'difficulty-mobile' : 'difficulty-filter'} value={difficulty} onChange={event => setDifficulty(event.target.value)}><option value="">Any level</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
      <div className="filter-block"><label className="filter-label" htmlFor={mobile ? 'condition-mobile' : 'condition-filter'}>Condition</label><select id={mobile ? 'condition-mobile' : 'condition-filter'} value={condition} onChange={event => setCondition(event.target.value)}><option value="">Any condition</option><option>Like new</option><option>Good</option><option>Well loved</option></select></div>
      <div className="filter-block"><p className="filter-label">Price range</p><div className="price-inputs"><input aria-label="Minimum price" type="number" min="0" placeholder="$ min" value={min} onChange={event => setMin(event.target.value)} /><span>–</span><input aria-label="Maximum price" type="number" min="0" placeholder="$ max" value={max} onChange={event => setMax(event.target.value)} /></div></div>
      <div className="filter-block"><p className="filter-label">Availability</p><label className="checkline"><input type="checkbox" checked={available} onChange={event => setAvailable(event.target.checked)} /> Available now</label><div className="filter-note">Sellers confirm availability when they post. Each listing shows when it was last checked.</div></div>
    </aside>
  );
}

function Modal({ modal, onClose, onSubmit }) {
  const [listingType, setListingType] = useState('sale');
  useEffect(() => {
    if (modal?.type === 'listing') setListingType(modal.listingType || 'sale');
  }, [modal]);
  if (!modal) return null;

  const isListing = modal.type === 'listing';
  const isWaitlist = modal.type === 'waitlist';
  const isSwap = modal.type === 'swap';
  const title = isListing ? 'List a textbook' : isWaitlist ? 'Join the waitlist' : isSwap ? 'Propose a book swap' : 'Message the seller';
  const subtitle = isListing ? 'Give it a second life with someone in your class.' : isWaitlist ? `${modal.book.title} is reserved right now. Leave your email and we’ll let you know if it opens up.` : isSwap ? `${modal.book.title} · offered by ${modal.book.seller}` : `${modal.book.title} · ${modal.book.price === 0 ? 'Free' : `$${modal.book.price}`} · ${modal.book.seller}`;

  return (
    <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-head"><div><h2 id="modal-title">{title}</h2><p>{subtitle}</p></div><button className="close-button" aria-label="Close" onClick={onClose}><X size={18} /></button></div>
        <form onSubmit={event => { event.preventDefault(); onSubmit(new FormData(event.currentTarget)); }}>
          {isListing ? <>
            <label>Book title<input name="title" required maxLength="90" placeholder="e.g. Calculus: Early Transcendentals" /></label>
            <div className="form-row"><label>Course<input name="course" required maxLength="50" placeholder="MATH 151" /></label><label>Listing type<select name="listingType" value={listingType} onChange={event => setListingType(event.target.value)}><option value="sale">For sale</option><option value="free">Free</option><option value="donate">Donate</option><option value="swap">Book swap</option></select></label></div>
            {listingType === 'sale' && <label>Price ($)<input name="price" required type="number" min="1" max="999" placeholder="35" /></label>}
            <div className="form-row"><label>Difficulty<select name="difficulty" defaultValue="Intermediate"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label><label>Condition<select name="condition" defaultValue="Good"><option>Like new</option><option>Good</option><option>Well loved</option></select></label></div>
            <label>ISBN (optional)<input name="isbn" inputMode="numeric" maxLength="17" placeholder="978..." /></label>
            <label>Your name<input name="seller" required maxLength="40" placeholder="First name and last initial" /></label>
          </> : isWaitlist ? <label>Email address<input name="email" type="email" required placeholder="you@university.edu" /></label> : <>
            <label>Your email<input name="email" type="email" required placeholder="you@university.edu" /></label>
            <label>Message<textarea name="message" required maxLength="400" defaultValue={isSwap ? `Hi ${modal.book.seller}, I’d like to swap another textbook for ${modal.book.title}.` : `Hi ${modal.book.seller}, is this textbook still available? I’d love to arrange a campus pickup.`} /></label>
          </>}
          <button className="primary-button" type="submit">{isListing ? 'Publish listing' : isWaitlist ? 'Notify me' : <><Send size={15} /> {isSwap ? 'Send swap proposal' : 'Send message'}</>}</button>
        </form>
      </section>
    </div>
  );
}

export default function App() {
  const [books, setBooks] = useState(() => [...readStored('leaflet-user-books', []), ...initialBooks]);
  const [saved, setSaved] = useState(() => new Set(readStored('leaflet-saved', [])));
  const [view, setView] = useState('browse');
  const [profileName, setProfileName] = useState(() => readStored('leaflet-profile-name', 'Student member'));
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [condition, setCondition] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [available, setAvailable] = useState(true);
  const [sort, setSort] = useState('recent');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const courses = [...new Set(books.map(book => book.course))].sort();

  useEffect(() => localStorage.setItem('leaflet-saved', JSON.stringify([...saved])), [saved]);

  const visibleBooks = books.filter(book => {
    const term = search.trim().toLowerCase();
    const matchesTerm = !term || [book.title, book.author, book.course, book.isbn].some(value => value.toLowerCase().includes(term));
    const matchesView = view === 'saved' ? saved.has(book.id) : view === 'free' ? book.free || book.price === 0 : view === 'donated' ? book.owner === 'me' && book.donated : view === 'swap' ? book.swap : view === 'my-listings' ? book.owner === 'me' : true;
    return matchesTerm && (!course || book.course === course) && (!difficulty || book.difficulty === difficulty) && (!condition || book.condition === condition) && (!min || book.price >= Number(min)) && (!max || book.price <= Number(max)) && (!available || book.available) && matchesView;
  }).sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : b.created - a.created);

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  function clearFilters() {
    setCourse(''); setDifficulty(''); setCondition(''); setMin(''); setMax(''); setAvailable(true);
  }

  function toggleSaved(id) {
    setSaved(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    showToast(saved.has(id) ? 'Removed from saved books.' : 'Saved to your books.');
  }

  function submitModal(data) {
    if (modal.type === 'listing') {
      const isbn = String(data.get('isbn')).replace(/[^0-9Xx]/g, '');
      const listingType = data.get('listingType');
      const book = { id: crypto.randomUUID(), title: data.get('title').trim(), author: 'Student listing', course: data.get('course').trim(), isbn, price: listingType === 'sale' ? Number(data.get('price')) : 0, difficulty: data.get('difficulty'), condition: data.get('condition'), seller: data.get('seller').trim(), updated: 'just now', cover: isbn, color: '#35634f', available: true, created: Date.now(), owner: 'me', free: listingType === 'free', donated: listingType === 'donate', swap: listingType === 'swap' };
      setBooks(current => {
        localStorage.setItem('leaflet-user-books', JSON.stringify([book, ...current.filter(item => item.owner === 'me')]));
        return [book, ...current];
      });
      setView('my-listings');
      showToast(listingType === 'donate' ? 'Your donation is listed.' : 'Your book is live and marked available.');
    } else if (modal.type === 'waitlist') {
      showToast('You’re on the list. We’ll be in touch.');
    } else {
      showToast(modal.type === 'swap' ? 'Swap proposal sent.' : 'Message sent. Check your inbox for their reply.');
    }
    setModal(null);
  }

  function setActiveView(nextView) {
    setView(nextView);
    setMobileFiltersOpen(false);
  }

  const views = [{ id: 'browse', label: 'All books', icon: BookOpen }, { id: 'free', label: 'Free books', icon: Gift }, { id: 'donated', label: 'Donated', icon: Heart }, { id: 'swap', label: 'Book swap', icon: Repeat2 }, { id: 'saved', label: 'Saved', icon: Heart }, { id: 'profile', label: 'Profile', icon: UserRound }];
  const viewDetails = {
    browse: ['Find your next textbook.', 'Real books from students on your campus. No stale posts, no full-price surprises.'],
    free: ['Books, no price tag.', 'Browse textbooks students are giving away for free.'],
    donated: ['Your donated books.', 'Keep track of the textbooks you have passed on to another student.'],
    swap: ['Trade a book, not money.', 'Find students open to exchanging textbooks instead of buying.'],
    saved: ['Your saved books.', 'The titles you’ve bookmarked for later.'],
    profile: ['Your Leaflet profile.', 'Your campus bookshelf, all in one place.'],
    'my-listings': ['Your active listings.', 'Books you have shared with the campus community.'],
  };
  const [heading, description] = viewDetails[view] || viewDetails.browse;
  const donatedCount = books.filter(book => book.owner === 'me' && book.donated).length;
  const freeBookCount = books.filter(book => book.free || book.price === 0).length;
  const swapBookCount = books.filter(book => book.swap).length;

  return (
    <div className="shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Leaflet home"><span className="brand-mark"><BookOpen size={18} /></span><span>leaflet<small>CAMPUS BOOK EXCHANGE</small></span></a>
        <nav className="nav" aria-label="Main navigation">{views.map(item => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setActiveView(item.id)}><item.icon size={15} />{item.label}{item.id === 'saved' && saved.size > 0 && <span className="nav-count">{saved.size}</span>}</button>)}</nav>
        <div className="top-actions"><div className="campus"><span className="campus-dot" /><span><b>Northbridge University</b> · Campus only</span></div><button className="sell-button" onClick={() => setModal({ type: 'listing' })}><Plus size={16} /> List a book</button></div>
      </header>
      <main>
        <section className="intro"><div><div className="eyebrow"><Sparkles size={13} /> The smarter campus bookshelf</div><h1>{heading}</h1><p>{description}</p></div>{view !== 'profile' && <div className="intro-aside" aria-label="Marketplace overview"><div className="intro-stat"><strong>{books.length}</strong><span>Books listed</span></div><div className="intro-stat"><strong>{freeBookCount}</strong><span>Free</span></div><div className="intro-stat"><strong>{swapBookCount}</strong><span>For swap</span></div></div>}</section>
        {view === 'profile' ? <section className="profile-page" aria-label="Your profile"><div className="profile-heading"><span className="profile-avatar"><UserRound size={26} /></span><div><label htmlFor="profile-name">Display name</label><input id="profile-name" value={profileName} maxLength="40" onChange={event => { setProfileName(event.target.value); localStorage.setItem('leaflet-profile-name', JSON.stringify(event.target.value)); }} /></div></div><div className="profile-stats"><div><strong>{books.filter(book => book.owner === 'me').length}</strong><span>Active listings</span></div><div><strong>{donatedCount}</strong><span>Books donated</span></div><div><strong>{saved.size}</strong><span>Saved books</span></div></div><div className="profile-actions"><button onClick={() => setActiveView('my-listings')}>View my listings <span aria-hidden="true">→</span></button><button onClick={() => setActiveView('donated')}>View donated books <span aria-hidden="true">→</span></button><button onClick={() => setActiveView('saved')}>View saved books <span aria-hidden="true">→</span></button></div></section> : <div className="content">
          <FilterPanel course={course} setCourse={setCourse} difficulty={difficulty} setDifficulty={setDifficulty} condition={condition} setCondition={setCondition} min={min} setMin={setMin} max={max} setMax={setMax} available={available} setAvailable={setAvailable} courses={courses} onClear={clearFilters} />
          <section className="results" aria-label="Textbook listings">
            <div className="toolbar"><label className="search-wrap"><Search size={17} /><input type="search" placeholder="Search title, author, course or ISBN" aria-label="Search listings" value={search} onChange={event => setSearch(event.target.value)} /></label><button className="mobile-filter" onClick={() => setMobileFiltersOpen(open => !open)}><SlidersHorizontal size={15} /> Filters</button><label className="sort-wrap"><ArrowDownUp size={14} /><select value={sort} aria-label="Sort results" onChange={event => setSort(event.target.value)}><option value="recent">Recently listed</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div>
            {mobileFiltersOpen && <FilterPanel mobile course={course} setCourse={setCourse} difficulty={difficulty} setDifficulty={setDifficulty} condition={condition} setCondition={setCondition} min={min} setMin={setMin} max={max} setMax={setMax} available={available} setAvailable={setAvailable} courses={courses} onClear={clearFilters} />}
            <div className="results-heading"><strong>{visibleBooks.length} {visibleBooks.length === 1 ? 'book' : 'books'}</strong><span>{[course, difficulty].filter(Boolean).join(' · ') || 'All courses and levels'}</span></div>
            {visibleBooks.length ? <div className="grid">{visibleBooks.map(book => <BookCard key={book.id} book={book} saved={saved.has(book.id)} onSave={toggleSaved} onContact={book => setModal({ type: book.swap ? 'swap' : 'contact', book })} onWaitlist={book => setModal({ type: 'waitlist', book })} />)}</div> : <div className="empty"><strong>{view === 'saved' ? 'No saved books yet' : view === 'donated' ? 'No donated books yet' : view === 'my-listings' ? 'No listings yet' : view === 'swap' ? 'No swap books found' : view === 'free' ? 'No free books found' : 'No books found'}</strong><span>{view === 'saved' ? 'Tap the heart on a book to keep it here.' : view === 'donated' ? 'When you list a book as a donation, it will appear here.' : view === 'my-listings' ? 'List a textbook to see it here.' : 'Try a different search or loosen your filters.'}</span>{(view === 'my-listings' || view === 'donated') && <button className="primary-button" onClick={() => setModal({ type: 'listing', listingType: view === 'donated' ? 'donate' : 'sale' })}><Plus size={15} /> {view === 'donated' ? 'Donate a book' : 'List a book'}</button>}</div>}
          </section>
        </div>}
      </main>
      <button className="sell-button mobile-sell" onClick={() => setModal({ type: 'listing' })}><Plus size={16} /> List a book</button>
      <Modal modal={modal} onClose={() => setModal(null)} onSubmit={submitModal} />
      <div className={`toast ${toast ? 'show' : ''}`} role="status">{toast}</div>
    </div>
  );
}