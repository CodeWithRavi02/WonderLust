import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  Compass,
  GraduationCap,
  Heart,
  LayoutDashboard,
  Menu,
  Moon,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Users,
  X,
} from "lucide-react";
import { Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { categories, courses, photoUrl } from "./data/courses.js";

const imageAlt = (title) => `${title} course`;

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("orbit-theme") || "light");
  const [wishlist, toggleWishlist] = useWishlist();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("orbit-user") || "null");
    } catch {
      return null;
    }
  });
  const [globalNotice, setGlobalNotice] = useState("");
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("orbit-theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    fetch("/api/health")
      .then(async (response) => {
        const health = await response.json();
        if (!response.ok) throw new Error("The API is unavailable.");
        if (health.database !== "connected") return null;
        return fetch("/api/auth/me");
      })
      .then(async (response) => {
        if (!response) return;
        if (response.status === 401) {
          localStorage.removeItem("orbit-user");
          if (active) setUser(null);
          return;
        }
        if (!response.ok) return;
        const result = await response.json();
        if (active) {
          localStorage.setItem("orbit-user", JSON.stringify(result.data.user));
          setUser(result.data.user);
        }
      })
      .catch(() => {
        if (active) setGlobalNotice("We couldn't check your session. Make sure the API server is running.");
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const signOut = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("We couldn't sign you out. Please try again.");
      localStorage.removeItem("orbit-user");
      setUser(null);
      setGlobalNotice("");
    } catch (error) {
      setGlobalNotice(error.message);
    }
  };

  return (
    <div className="app-shell">
      <Header
        theme={theme}
        setTheme={setTheme}
        user={user}
        onAuth={() => openAuth("login")}
        onRegister={() => openAuth("register")}
        onSignOut={signOut}
      />
      <Routes>
        <Route path="/" element={<Home onAuth={() => openAuth("register")} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/courses" element={<Catalog wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/courses/:courseId" element={<CoursePage user={user} onAuth={() => openAuth("login")} />} />
        <Route path="/learn" element={<Dashboard user={user} onAuth={() => openAuth("login")} wishlist={wishlist} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      {globalNotice && <div className="toast-message" role="alert">{globalNotice}<button className="icon-button" aria-label="Dismiss message" onClick={() => setGlobalNotice("")}><X size={15} /></button></div>}
      {authOpen && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setAuthOpen(false)}
          onSuccess={(nextUser) => {
            localStorage.setItem("orbit-user", JSON.stringify(nextUser));
            setUser(nextUser);
            setAuthOpen(false);
          }}
        />
      )}
    </div>
  );
}

function useWishlist() {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("orbit-wishlist") || "[]");
      return Array.isArray(stored) ? stored.filter((id) => typeof id === "string") : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("orbit-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (id) => {
    setWishlist((current) => current.includes(id)
      ? current.filter((savedId) => savedId !== id)
      : [...current, id]);
  };
  return [wishlist, toggleWishlist];
}

function Header({ theme, setTheme, user, onAuth, onRegister, onSignOut }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const submitSearch = (event) => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("q");
    navigate(`/courses${query ? `?search=${encodeURIComponent(query)}` : ""}`);
    setSearchOpen(false);
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="Orbit home">
          <span className="brand-mark"><Sparkles size={18} strokeWidth={2.5} /></span>
          orbit<span className="brand-period">.</span>
        </Link>
        <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`} aria-label="Main navigation">
          <Link to="/courses" onClick={() => setMenuOpen(false)}>Explore</Link>
          <a href="/#categories" onClick={() => setMenuOpen(false)}>Categories</a>
          <a href="/#stories" onClick={() => setMenuOpen(false)}>Our community</a>
          <Link to="/learn" onClick={() => setMenuOpen(false)}>My learning</Link>
        </nav>
        <div className="header-actions">
          <form className={`header-search ${searchOpen ? "search-open" : ""}`} onSubmit={submitSearch}>
            <Search size={16} aria-hidden="true" />
            <input name="q" aria-label="Search courses" placeholder="What do you want to learn?" />
            <button type="submit" className="sr-only">Search</button>
          </form>
          <button className="icon-button mobile-search" aria-label="Open search" onClick={() => setSearchOpen(!searchOpen)}>
            <Search size={19} />
          </button>
          <button
            className="icon-button theme-toggle"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {user ? (
            <div className="user-menu">
              <Link to="/learn" className="avatar-link" aria-label="Open your learning dashboard">
                <span className="user-avatar">{user.name?.slice(0, 1).toUpperCase() || "S"}</span>
              </Link>
              <button className="text-button sign-out-button" onClick={onSignOut}>Sign out</button>
            </div>
          ) : (
            <>
              <button className="text-button sign-in-button" onClick={onAuth}>Log in</button>
              <button className="button button-dark header-join" onClick={onRegister}>
                Get started <ArrowUpRight size={15} />
              </button>
            </>
          )}
          <button className="icon-button menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Home({ onAuth, wishlist, toggleWishlist }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [toast, setToast] = useState("");

  const visibleCourses = activeCategory === "All"
    ? courses.slice(0, 4)
    : courses.filter((course) => course.category === activeCategory).slice(0, 4);

  const saveCourse = (id) => {
    setToast(wishlist.includes(id) ? "Removed from your wishlist" : "Saved to your wishlist");
    toggleWishlist(id);
    window.setTimeout(() => setToast(""), 2200);
  };

  const subscribe = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <main>
      <section className="hero-section">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> A little progress goes a long way</div>
            <h1>Make room for<br />your <span>next big thing.</span></h1>
            <p className="hero-description">The skills you want, from people who've been there. Learn at your own pace and build a career you love.</p>
            <div className="hero-actions">
              <Link className="button button-primary button-large" to="/courses">Explore courses <ArrowRight size={17} /></Link>
              <a className="text-link" href="#how-it-works"><span className="play-circle"><Play size={11} fill="currentColor" /></span> See how it works</a>
            </div>
            <div className="hero-social-proof">
              <div className="avatar-stack" aria-hidden="true">
                {["photo-1534528741775-53994a69daeb", "photo-1500648767791-00dcc994a43e", "photo-1531123897727-8f129e1688ce", "photo-1506794778202-cad84cf45f1d"].map((id) => (
                  <img key={id} src={photoUrl(id, 96)} alt="" />
                ))}
              </div>
              <div><strong>Join 42,000+ curious minds</strong><span>learning something new every day</span></div>
            </div>
          </div>
          <div className="hero-art">
            <img className="hero-photo" src={photoUrl("photo-1522202176988-66273c2fd55f", 1200)} alt="A diverse group of students learning together around a table" />
            <div className="photo-shade" />
            <div className="hero-note note-top"><span className="note-icon note-lilac"><Sparkles size={17} /></span><span><strong>Small steps.</strong><small>Big momentum.</small></span></div>
            <div className="hero-note note-bottom"><span className="note-icon note-mint"><Check size={18} /></span><span><strong>You're on your way</strong><small>One lesson at a time</small></span><span className="note-progress">72%</span></div>
            <div className="hero-image-label"><span className="live-dot" /> Learning looks good on you</div>
          </div>
        </div>
        <div className="hero-bottom">
          <span>Designed for your next chapter</span>
          <div className="hero-pill"><span>01</span> Learn by doing</div>
          <div className="hero-pill"><span>02</span> Learn from the best</div>
          <div className="hero-pill"><span>03</span> Learn on your terms</div>
          <a href="#popular" className="hero-scroll" aria-label="Scroll to popular courses"><ArrowDown size={16} /></a>
        </div>
      </section>

      <section className="trust-bar" aria-label="Trusted by teams at">
        <span>Good things happen when great people keep learning</span>
        <div className="partner-logos"><span>Notion</span><span>◈ Webflow</span><span>◉ canva</span><span>Figma</span><span>◎ Shopify</span></div>
      </section>

      <section className="section categories-section" id="categories">
        <div className="section-heading">
          <div><div className="eyebrow eyebrow-muted">Find your starting point</div><h2>A world of ideas,<br className="desktop-break" /> one click away.</h2></div>
          <Link to="/courses" className="text-link">Browse all categories <ArrowRight size={16} /></Link>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link to={`/courses?category=${encodeURIComponent(category.name)}`} className={`category-card ${category.color}`} key={category.name}>
              <span className="category-icon">{category.icon}</span>
              <span className="category-meta"><strong>{category.name}</strong><small>{category.count}</small></span>
              <ArrowUpRight size={17} className="category-arrow" />
            </Link>
          ))}
        </div>
      </section>

      <section className="section courses-section" id="popular">
        <div className="section-heading course-heading">
          <div><div className="eyebrow eyebrow-muted">A good place to begin</div><h2>Made for your kind<br className="desktop-break" /> of curious.</h2><p>Thoughtful classes, taught by people who love what they do.</p></div>
          <Link to="/courses" className="button button-outline">Explore all courses <ArrowRight size={16} /></Link>
        </div>
        <div className="filter-row" role="group" aria-label="Filter featured courses by category">
          {["All", "Design", "Business", "Data & AI", "Development"].map((category) => (
            <button key={category} className={`filter-chip ${activeCategory === category ? "filter-active" : ""}`} onClick={() => setActiveCategory(category)}>{category}</button>
          ))}
        </div>
        <div className="course-grid">
          {visibleCourses.length ? visibleCourses.map((course) => (
            <CourseCard key={course.id} course={course} saved={wishlist.includes(course.id)} onSave={() => saveCourse(course.id)} />
          )) : <div className="empty-courses">More classes in this category are coming soon. <Link to="/courses">See all courses</Link></div>}
        </div>
      </section>

      <section className="section journey-section" id="how-it-works">
        <div className="journey-image-wrap">
          <img src={photoUrl("photo-1434030216411-0b793f4b4173", 1100)} alt="Student taking thoughtful notes during a course" />
          <div className="journey-sticker"><span>Made for</span><strong>your<br />momentum.</strong><Sparkles size={22} /></div>
          <div className="journey-caption"><span className="caption-dot" /> A little learning goes a long way.</div>
        </div>
        <div className="journey-copy">
          <div className="eyebrow eyebrow-muted">Your next chapter, your way</div>
          <h2>Less scrolling.<br /><span>More growing.</span></h2>
          <p>Learning shouldn't feel like another thing on your to-do list. Find a pace, a teacher, and a subject that feels like you.</p>
          <div className="journey-points">
            <div><span className="journey-point-icon"><Play size={15} fill="currentColor" /></span><span><strong>Short lessons, lasting ideas</strong><small>Learn something useful in the time you have.</small></span></div>
            <div><span className="journey-point-icon point-peach"><Users size={16} /></span><span><strong>Teachers worth learning from</strong><small>Real people, sharing hard-won experience.</small></span></div>
            <div><span className="journey-point-icon point-green"><CheckCircle2 size={16} /></span><span><strong>Progress you can feel</strong><small>Make a little more room for what comes next.</small></span></div>
          </div>
          <Link className="button button-dark" to="/courses">Find your next course <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="instructor-section">
        <div className="instructor-content">
          <div className="eyebrow eyebrow-light">For the people who make us better</div>
          <h2>Know a thing<br />or two? <span>Teach it.</span></h2>
          <p>Bring your real-world experience to a community that's ready to grow. We'll help you make a class worth remembering.</p>
          <a href="mailto:teach@orbit.example" className="button button-white">Become an instructor <ArrowUpRight size={16} /></a>
        </div>
        <div className="instructor-art">
          <img src={photoUrl("photo-1551836022-d5d88e9218df", 1000)} alt="An instructor sharing ideas with a small group" />
          <div className="instructor-art-card"><span className="note-icon note-mint"><GraduationCap size={18} /></span><span><strong>12,400+</strong><small>generous teachers</small></span></div>
        </div>
        <span className="instructor-orbit orbit-one" /><span className="instructor-orbit orbit-two" />
      </section>

      <section className="section quote-section" id="stories">
        <div className="quote-top"><div className="eyebrow eyebrow-muted">Notes from the journey</div><div className="quote-arrows"><button aria-label="Previous story"><ArrowLeft size={17} /></button><button aria-label="Next story"><ArrowRight size={17} /></button></div></div>
        <div className="quote-content"><span className="quote-mark">“</span><blockquote>I didn't need a whole new life. I just needed one new skill to see what was possible.</blockquote></div>
        <div className="quote-person"><img src={photoUrl("photo-1534528741775-53994a69daeb", 96)} alt="Amara Johnson" /><span><strong>Amara Johnson</strong><small>Product designer & lifelong learner</small></span><div className="quote-stars" aria-label="5 out of 5 stars"><Star /><Star /><Star /><Star /><Star /></div></div>
      </section>

      <section className="newsletter-section">
        <div className="newsletter-sparkle sparkle-left"><Sparkles size={21} /></div>
        <div className="newsletter-content">
          <div className="eyebrow eyebrow-light">A little inspiration, now and then</div>
          <h2>Good things to learn.<br />Straight to your inbox.</h2>
          <p>No noise. Just thoughtful ideas, fresh classes, and a reason to keep going.</p>
          {subscribed ? (
            <div className="subscribe-success" role="status"><CheckCircle2 size={19} /> You're on the list. See you in your inbox.</div>
          ) : (
            <form className="newsletter-form" onSubmit={subscribe}>
              <label className="sr-only" htmlFor="newsletter-email">Your email address</label>
              <input id="newsletter-email" type="email" placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <button type="submit" className="button button-dark">Count me in <ArrowRight size={16} /></button>
            </form>
          )}
          <small className="newsletter-note">By subscribing, you agree to our friendly occasional email. Unsubscribe anytime.</small>
        </div>
        <div className="newsletter-orbit orbit-three" /><div className="newsletter-orbit orbit-four" />
        <div className="newsletter-sparkle sparkle-right"><Sparkles size={17} /></div>
      </section>
      {toast && <div className="toast-message" role="status"><CheckCircle2 size={17} /> {toast}</div>}
    </main>
  );
}

function CourseCard({ course, saved, onSave }) {
  return (
    <article className="course-card">
      <Link to={`/courses/${course.id}`} className={`course-image ${course.color}`}>
        <img src={photoUrl(course.image, 640)} alt={imageAlt(course.title)} loading="lazy" />
        <span className="course-image-category">{course.category}</span>
        <span className="course-image-duration"><Clock3 size={12} /> {course.duration}</span>
      </Link>
      <button className={`save-course ${saved ? "saved" : ""}`} onClick={onSave} aria-label={saved ? `Remove ${course.title} from wishlist` : `Save ${course.title} to wishlist`}>
        <Heart size={17} fill={saved ? "currentColor" : "none"} />
      </button>
      <div className="course-card-body">
        <div className="course-card-meta"><span>{course.level}</span><span className="course-rating"><Star size={13} fill="currentColor" /> {course.rating}</span></div>
        <Link to={`/courses/${course.id}`} className="course-title">{course.title}</Link>
        <div className="course-instructor"><img src={photoUrl(course.avatar, 80)} alt="" loading="lazy" /><span>{course.instructor}</span></div>
        <div className="course-card-bottom"><span className="student-count"><Users size={14} /> {course.students} learners</span><span className="course-price">${course.price}{course.oldPrice && <del>${course.oldPrice}</del>}</span></div>
      </div>
    </article>
  );
}

function Catalog({ wishlist, toggleWishlist }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [sort, setSort] = useState("Popular");
  const [catalogCourses, setCatalogCourses] = useState(courses);
  const [catalogNotice, setCatalogNotice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get("search") || "");
    setCategory(params.get("category") || "All");
  }, [location.search]);

  useEffect(() => {
    let active = true;
    fetch("/api/health")
      .then(async (response) => {
        const health = await response.json();
        if (!response.ok) throw new Error("The catalog service is unavailable.");
        if (health.database !== "connected") {
          if (active) setCatalogNotice("Connect MongoDB to browse the live catalog. Showing sample classes instead.");
          return null;
        }
        return fetch("/api/courses");
      })
      .then(async (response) => {
        if (!response) return;
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "The live catalog is unavailable.");
        if (active && result.data.length) {
          setCatalogCourses(result.data.map((course) => ({
            ...course,
            id: course.slug,
            image: course.thumbnailUrl,
            avatar: course.instructor?.avatarUrl,
            instructor: course.instructor?.name || "Orbit instructor",
            students: String(course.enrollmentCount || 0),
            rating: course.ratingAverage || 0,
            duration: `${Math.round((course.lessons || []).reduce((total, lesson) => total + (lesson.durationSeconds || 0), 0) / 3600)}h`,
          })));
        } else if (active) {
          setCatalogNotice("No published classes are available yet. Showing our sample catalog instead.");
        }
      })
      .catch((error) => {
        if (active) setCatalogNotice(`${error.message} Showing our sample catalog instead.`);
      });
    return () => { active = false; };
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return catalogCourses
      .filter((course) => category === "All" || course.category === category)
      .filter((course) => !normalized || `${course.title} ${course.instructor} ${course.category}`.toLowerCase().includes(normalized))
      .sort((a, b) => sort === "Price: low to high" ? a.price - b.price : sort === "Top rated" ? b.rating - a.rating : Number.parseFloat(b.students) - Number.parseFloat(a.students));
  }, [catalogCourses, category, query, sort]);

  return (
    <main className="catalog-page">
      <div className="catalog-intro">
        <div className="eyebrow eyebrow-muted">The good stuff starts here</div>
        <h1>Find something<br /><span>worth learning.</span></h1>
        <p>Curated classes from people who are really good at what they do.</p>
        <div className="catalog-breadcrumb"><Link to="/">Home</Link><span>/</span><span>Explore classes</span></div>
      </div>
      <div className="catalog-layout">
        <aside className="catalog-sidebar">
          <div className="sidebar-heading"><strong>Explore</strong><span>{results.length} classes</span></div>
          <div className="catalog-category-scroll">
            <button className={`catalog-category ${category === "All" ? "category-selected" : ""}`} onClick={() => setCategory("All")}><Compass size={17} /> All classes</button>
            {categories.map((item) => <button key={item.name} className={`catalog-category ${category === item.name ? "category-selected" : ""}`} onClick={() => setCategory(item.name)}><span className={`mini-category-icon ${item.color}`}>{item.icon}</span>{item.name}</button>)}
          </div>
          <div className="sidebar-note"><Sparkles size={17} /><strong>Not sure where to start?</strong><span>Follow your curiosity. The rest comes naturally.</span><button onClick={() => { setCategory("All"); setQuery(""); }}>Surprise me <ArrowRight size={14} /></button></div>
        </aside>
        <div className="catalog-results">
          <div className="catalog-toolbar">
            <label className="catalog-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search classes, skills, teachers..." aria-label="Search classes" /></label>
            <label className="sort-control">Sort by <select value={sort} onChange={(event) => setSort(event.target.value)}><option>Popular</option><option>Top rated</option><option>Price: low to high</option></select><ChevronDown size={14} /></label>
          </div>
          <div className="catalog-result-heading"><span>{category === "All" ? "All classes" : category}</span><span>{results.length} thoughtfully made classes</span></div>
          {catalogNotice && <div className="catalog-notice" role="status">{catalogNotice}</div>}
          {results.length ? <div className="course-grid catalog-course-grid">{results.map((course) => <CourseCard key={course.id} course={course} saved={wishlist.includes(course.id)} onSave={() => toggleWishlist(course.id)} />)}</div> : <div className="catalog-empty"><span className="empty-icon"><Search size={21} /></span><h2>Nothing on this page just yet.</h2><p>Try a different search or explore all classes.</p><button className="button button-dark" onClick={() => { setQuery(""); setCategory("All"); }}>See all classes <ArrowRight size={15} /></button></div>}
        </div>
      </div>
    </main>
  );
}

function CoursePage({ user, onAuth }) {
  const { courseId } = useParams();
  const course = courses.find((item) => item.id === courseId);
  const [enrolled, setEnrolled] = useState(false);
  const [expanded, setExpanded] = useState(0);
  const [enrollError, setEnrollError] = useState("");

  if (!course) return <NotFound />;

  const enroll = async () => {
    if (!user) {
      onAuth();
      return;
    }
    setEnrollError("");
    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: course.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "We couldn't complete your enrollment.");
      setEnrolled(true);
    } catch (error) {
      setEnrollError(error.message);
    }
  };

  return (
    <main className="course-page">
      <div className="course-hero">
        <div className="course-hero-inner">
          <div className="course-breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/courses">Explore</Link><span>/</span><span>{course.category}</span></div>
          <span className="course-detail-category">{course.category} <span>·</span> {course.level}</span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="course-detail-meta"><span className="course-rating"><Star size={15} fill="currentColor" /> {course.rating} <span className="meta-muted">({course.students} learners)</span></span><span><Clock3 size={15} /> {course.duration}</span><span><BookOpen size={15} /> {course.lessons} lessons</span></div>
          <div className="detail-instructor"><img src={photoUrl(course.avatar, 96)} alt="" /><span><small>YOUR TEACHER</small><strong>{course.instructor}</strong></span><span className="instructor-role">{course.role}</span></div>
        </div>
      </div>
      <div className="course-detail-layout">
        <div className="course-detail-main">
          <div className="detail-video">
            <img src={photoUrl(course.image, 1200)} alt={imageAlt(course.title)} />
            <button className="video-play" aria-label="Play course preview"><Play size={21} fill="currentColor" /></button>
            <span className="video-label">A little preview</span>
          </div>
          <section className="detail-section">
            <div className="eyebrow eyebrow-muted">A little about this class</div><h2>Make something you're proud of.</h2>
            <p>{course.description} This class is full of practical ideas and useful exercises you can take straight into your next project.</p>
          </section>
          <section className="detail-section outcomes-section">
            <div className="eyebrow eyebrow-muted">By the end, you'll be able to</div>
            <div className="outcomes-grid">{course.outcomes.map((outcome) => <div key={outcome}><CheckCircle2 size={18} /><span>{outcome}</span></div>)}</div>
          </section>
          <section className="detail-section curriculum-section">
            <div className="eyebrow eyebrow-muted">A look inside</div><h2>Class outline</h2>
            <div className="curriculum-list">
              {["Getting started", "Find your foundations", "Make it real", "Share what you made"].map((section, index) => (
                <div className="curriculum-item" key={section}>
                  <button className="curriculum-toggle" onClick={() => setExpanded(expanded === index ? -1 : index)} aria-expanded={expanded === index}>
                    <span className={`curriculum-number ${expanded === index ? "number-active" : ""}`}>{String(index + 1).padStart(2, "0")}</span><span className="curriculum-name"><strong>{section}</strong><small>{index === 0 ? 4 : index === 1 ? 8 : 6} lessons · {index + 1}h {index === 0 ? "12m" : "08m"}</small></span><ChevronDown size={17} className={expanded === index ? "chevron-up" : ""} />
                  </button>
                  {expanded === index && <div className="lesson-list">{["A warm welcome", "The ideas behind the work", "Let's make a start"].map((lesson, lessonIndex) => <div key={lesson}><span className="lesson-play"><Play size={11} /></span>{lesson}<span>{lessonIndex === 0 ? "04:20" : lessonIndex === 1 ? "12:45" : "08:10"}</span></div>)}</div>}
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="enroll-card">
          <div className="enroll-image"><img src={photoUrl(course.image, 640)} alt="" /><span><Play size={13} fill="currentColor" /> Preview this class</span></div>
          <div className="enroll-card-body">
            <div className="enroll-price">${course.price}<del>${course.oldPrice}</del><span>one-time purchase</span></div>
            {enrolled ? <Link to="/learn" className="button button-primary enroll-button">Go to your class <ArrowRight size={16} /></Link> : <button className="button button-primary enroll-button" onClick={enroll}>Start learning <ArrowRight size={16} /></button>}
            {enrollError && <p className="form-error" role="alert">{enrollError}</p>}
            <span className="enroll-caption">Learn at your own pace. Keep it forever.</span>
            <div className="enroll-includes"><strong>This class includes</strong><span><Play size={15} /> {course.duration} on-demand video</span><span><BookOpen size={15} /> {course.lessons} short, thoughtful lessons</span><span><CheckCircle2 size={15} /> A certificate when you finish</span><span><ShieldCheck size={15} /> A 30-day satisfaction promise</span></div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Dashboard({ user, onAuth, wishlist }) {
  const [activeTab, setActiveTab] = useState("In progress");
  const [courseList, setCourseList] = useState(courses.slice(0, 2));
  const [loading, setLoading] = useState(Boolean(user));
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!user) return;
    fetch("/api/enrollments")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load your classes.");
        setCourseList(result.data.map((item) => ({
          ...item.course,
          id: item.course?.slug,
          progressPercent: item.progressPercent,
        })).filter((course) => course.id));
      })
      .catch((error) => setLoadError(error.message))
      .finally(() => setLoading(false));
  }, [user]);
  const visibleCourses = activeTab === "Saved"
    ? courses.filter((course) => wishlist.includes(course.id))
    : activeTab === "Completed" ? courseList.filter((course) => course.progressPercent === 100) : courseList;
  const completedCount = courseList.filter((course) => course.progressPercent === 100).length;

  return (
    <main className="dashboard-page">
      <div className="dashboard-welcome">
        <div><div className="eyebrow eyebrow-muted">YOUR LEARNING SPACE</div><h1>A little progress,<br className="mobile-break" /> <span>a lot of possibility.</span></h1><p>Every new thing you learn opens another door.</p></div>
        <Link to="/courses" className="button button-dark"><Compass size={16} /> Find a new class</Link>
      </div>
      {!user && <div className="dashboard-notice"><Sparkles size={17} /><span>You're exploring a sample learning space. Log in to save your progress and keep your classes together.</span><button onClick={onAuth}>Log in <ArrowRight size={14} /></button></div>}
      <div className="dashboard-stats"><div><span className="stat-icon stat-violet"><BookOpen size={18} /></span><span><strong>{user ? courseList.length : "02"}</strong><small>classes in your library</small></span></div><div><span className="stat-icon stat-peach"><Clock3 size={18} /></span><span><strong>{user ? "0h 00m" : "04h 20m"}</strong><small>time well spent</small></span></div><div><span className="stat-icon stat-mint"><CheckCircle2 size={18} /></span><span><strong>{user ? completedCount : "12"}</strong><small>classes completed</small></span></div><div><span className="stat-icon stat-yellow"><Sparkles size={18} /></span><span><strong>{user ? "0 day streak" : "5 day streak"}</strong><small>{user ? "your next streak starts today" : "you showed up!"}</small></span></div></div>
      <section className="dashboard-classes">
        <div className="dashboard-section-heading"><div><div className="eyebrow eyebrow-muted">KEEP THAT MOMENTUM</div><h2>Your classes</h2></div><Link to="/courses" className="text-link">Explore classes <ArrowRight size={15} /></Link></div>
        <div className="dashboard-tabs" role="tablist" aria-label="Filter your classes">{["In progress", "Saved", "Completed"].map((tab) => <button role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "tab-active" : ""} onClick={() => setActiveTab(tab)} key={tab}>{tab}</button>)}</div>
        {loading ? <div className="dashboard-loading">Gathering your classes...</div> : loadError ? <div className="dashboard-empty" role="alert"><span className="empty-icon"><BookOpen size={19} /></span><h3>We couldn't load your classes.</h3><p>{loadError}</p><button className="text-link" onClick={() => window.location.reload()}>Try again <ArrowRight size={14} /></button></div> : visibleCourses.length ? (
          <div className="learning-list">{visibleCourses.map((course, index) => course && <div className="learning-card" key={course.id || index}><Link to={`/courses/${course.id}`} className={`learning-thumb ${course.color || "lilac"}`}><img src={photoUrl(course.image || course.thumbnailUrl, 480)} alt="" /><span><Play size={15} fill="currentColor" /></span></Link><div className="learning-info"><span className="eyebrow eyebrow-muted">{course.category}</span><Link to={`/courses/${course.id}`}><h3>{course.title}</h3></Link><p>with {typeof course.instructor === "string" ? course.instructor : course.instructor?.name || "Your teacher"}</p><div className="learning-progress"><progress value={course.progressPercent ?? (index === 0 ? 58 : 24)} max="100" aria-label={`${course.title} course progress`} /><small>{course.progressPercent ?? (index === 0 ? "58" : "24")}% complete</small></div></div><Link to={`/courses/${course.id}`} className="button button-outline learning-continue">Keep learning <ArrowRight size={15} /></Link></div>)}</div>
        ) : <div className="dashboard-empty"><span className="empty-icon"><Heart size={19} /></span><h3>{activeTab === "Saved" ? "Nothing saved here yet." : activeTab === "Completed" ? "Your next finish line is waiting." : "Your learning journey starts here."}</h3><p>{activeTab === "Saved" ? "Classes you've saved for another day will find a home here." : "Find a class that feels like you and start with one lesson."}</p><Link to="/courses" className="text-link">Find a class <ArrowRight size={14} /></Link></div>}
      </section>
      <section className="streak-card"><div className="streak-icon"><Sparkles size={24} /></div><div><div className="eyebrow eyebrow-muted">{user ? "START A NEW LEARNING HABIT" : "SHOWING UP IS THE WHOLE THING"}</div><h2>{user ? "Your next streak starts with one lesson." : "You've learned on 5 days this week."}</h2><p>{user ? "A little progress adds up. Find a class and begin today." : "Look at you, making room for the next big thing."}</p></div><div className="streak-days">{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span className={!user && index < 5 ? "day-done" : ""} key={`${day}-${index}`}>{!user && index < 5 ? <Check size={13} /> : day}</span>)}</div></section>
    </main>
  );
}

function AuthModal({ mode, setMode, onClose, onSuccess }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState("student");

  useEffect(() => {
    const previousFocus = document.activeElement;
    document.querySelector(".auth-modal input")?.focus();
    const handleDialogKeys = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = document.querySelectorAll(".auth-modal button:not([disabled]), .auth-modal input, .auth-modal select");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleDialogKeys);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", handleDialogKeys);
      document.body.classList.remove("modal-open");
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    const formData = new FormData(event.currentTarget);
    const isRegister = mode === "register";
    try {
      const response = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
          role,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "We couldn't sign you in. Please try again.");
      onSuccess(result.data.user);
    } catch (submissionError) {
      setError(submissionError.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="icon-button modal-close" aria-label="Close dialog" onClick={onClose}><X size={20} /></button>
        <span className="brand-mark modal-brand"><Sparkles size={18} /></span>
        <div className="eyebrow eyebrow-muted">{mode === "register" ? "A good thing starts here" : "Good to see you again"}</div>
        <h2 id="auth-title">{mode === "register" ? "Make room to grow." : "Welcome back."}</h2>
        <p>{mode === "register" ? "Create your free account and start learning at your own pace." : "Pick up right where you left off."}</p>
        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && <label>Your name<input name="name" autoComplete="name" placeholder="Alex Morgan" minLength="2" maxLength="80" required /></label>}
          <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
          <label>Password<input name="password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} placeholder="At least 8 characters" minLength="8" required /></label>
          {mode === "register" && <label>I am joining as<select value={role} onChange={(event) => setRole(event.target.value)}><option value="student">Student</option><option value="instructor">Instructor</option></select></label>}
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="button button-primary auth-submit" disabled={busy}>{busy ? "One moment..." : mode === "register" ? "Create my account" : "Log in"} <ArrowRight size={15} /></button>
        </form>
        <div className="auth-switch">{mode === "register" ? "Already learning with us?" : "New to Orbit?"} <button onClick={() => { setError(""); setMode(mode === "register" ? "login" : "register"); }}>{mode === "register" ? "Log in" : "Create an account"}</button></div>
      </section>
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand"><Link className="brand" to="/"><span className="brand-mark"><Sparkles size={18} strokeWidth={2.5} /></span>orbit<span className="brand-period">.</span></Link><p>A little progress goes a long way.<br />Make room for your next big thing.</p><div className="footer-socials"><a href="https://instagram.com" aria-label="Instagram">ig</a><a href="https://linkedin.com" aria-label="LinkedIn">in</a><a href="https://youtube.com" aria-label="YouTube">yt</a></div></div>
        <div className="footer-column"><strong>Explore</strong><Link to="/courses">All classes</Link><a href="/#categories">Categories</a><Link to="/learn">My learning</Link></div>
        <div className="footer-column"><strong>Make it happen</strong><a href="mailto:teach@orbit.example">Teach with us</a><a href="mailto:hello@orbit.example">For teams</a><a href="mailto:hello@orbit.example">Gift a class</a></div>
        <div className="footer-column"><strong>We're here</strong><a href="mailto:hello@orbit.example">Help & support</a><a href="mailto:hello@orbit.example">Say hello</a><a href="mailto:hello@orbit.example">Accessibility</a></div>
      </div>
      <div className="footer-bottom"><span>© 2025 Orbit Learning Co.</span><span>Made with room to grow <span className="footer-heart">♥</span></span><div><a href="mailto:hello@orbit.example">Privacy</a><a href="mailto:hello@orbit.example">Terms</a></div></div>
    </footer>
  );
}

function NotFound() {
  return <main className="not-found"><span className="empty-icon"><Search size={21} /></span><div className="eyebrow eyebrow-muted">A little detour</div><h1>This page took a different path.</h1><p>Let's get you back to something good.</p><Link to="/" className="button button-dark"><ArrowLeft size={16} /> Back home</Link></main>;
}

export default App;
