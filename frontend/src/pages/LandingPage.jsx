import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/ThemeContext";
import { Sun, Moon, Archive, Tag, Trash, Settings } from "lucide-react";
import { isTokenValid } from "../utils/auth";

function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = React.useState(false);

  // AFTER — clearly visible, theme-aware
  const strokeColor = theme === "dark" ? "%23FFFFFF" : "%231C1917";
  const strokeOpacity = theme === "dark" ? "0.08" : "0.06";

  const todayLabel = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  const logout = () => {
    localStorage.removeItem("token");
    setMenuOpen(false);
    navigate("/");
  };

  const handleStartClick = () => {
    const token = localStorage.getItem("token");
    setMenuOpen(false);
    navigate(isTokenValid(token) ? "/home" : "/auth");
  };

  const loginShow = () => isTokenValid(localStorage.getItem("token"));

  const HandleCategoryClick = () => {
    const token = localStorage.getItem("token");
    setMenuOpen(false);
    navigate(isTokenValid(token) ? "/categories" : "/auth");
  };

  const handleAuthClick = () => {
    const token = localStorage.getItem("token");
    setMenuOpen(false);
    navigate(isTokenValid(token) ? "/home" : "/auth");
  };

  const waveBackground = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1600 800'%3E%3Cpath fill='none' stroke='${strokeColor}' stroke-width='1' opacity='${strokeOpacity}' d='M-100,600 C200,400 400,800 600,600 S1000,400 1200,600 S1500,800 1700,600'/%3E%3Cpath fill='none' stroke='${strokeColor}' stroke-width='1' opacity='${strokeOpacity}' d='M-100,550 C200,350 400,750 600,550 S1000,350 1200,550 S1500,750 1700,550'/%3E%3Cpath fill='none' stroke='${strokeColor}' stroke-width='1' opacity='${strokeOpacity}' d='M-100,500 C200,300 400,700 600,500 S1000,300 1200,500 S1500,700 1700,500'/%3E%3Cpath fill='none' stroke='${strokeColor}' stroke-width='1' opacity='${strokeOpacity}' d='M-100,450 C200,250 400,650 600,450 S1000,250 1200,450 S1500,650 1700,450'/%3E%3Cpath fill='none' stroke='${strokeColor}' stroke-width='0.5' opacity='${strokeOpacity}' d='M-100,400 C200,200 400,600 600,400 S1000,200 1200,400 S1500,600 1700,400'/%3E%3C/svg%3E")`;

  const navItems = [
    {
      id: "tasks",
      label: "My Tasks",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="2" y="2" width="5" height="5" rx="1" />
          <rect x="9" y="2" width="5" height="5" rx="1" />
          <rect x="2" y="9" width="5" height="5" rx="1" />
          <rect x="9" y="9" width="5" height="5" rx="1" />
        </svg>
      ),
      onClick: handleStartClick,
    },
    {
      id: "categories",
      label: "Categories",
      icon: <Tag size={15} />,
      onClick: HandleCategoryClick,
    },
    {
      id: "archive",
      label: "Archive",
      icon: <Archive size={15} />,
      onClick: handleStartClick,
    },
    {
      id: "bin",
      label: "Bin",
      icon: <Trash size={15} />,
      onClick: handleStartClick,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={15} />,
      onClick: () => {
        navigate("/settings");
        setActiveNav("settings");
      },
    },
  ];

  return (
    <div
      className="flex flex-col lg:flex-row min-h-screen bg-background/60 backdrop-blur-none transition-colors duration-500 font-serif overflow-x-hidden"
      style={{
        backgroundImage: waveBackground,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ===== MOBILE TOP BAR ===== */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div>
          <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-text-muted">
            {todayLabel}
          </p>
          <p className="text-sm font-bold font-serif text-text-main">
            My Workspace
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted"
          >
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          <button
            className="w-8 h-8 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted font-sans text-base"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {menuOpen && (
        <div className="lg:hidden flex flex-col gap-1 px-4 py-3 border-b border-border-subtle bg-background/95 backdrop-blur-md sticky top-[57px] z-10">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans font-medium text-text-muted hover:text-text-main hover:bg-card/60 transition-all text-left w-full"
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div className="border-t border-border-subtle mt-1 pt-2">
            {loginShow() ? (
              <button
                onClick={logout}
                className="w-full px-3 py-2 rounded-xl text-xs font-sans font-medium text-text-muted hover:text-red-400 hover:bg-card/60 transition-all text-left"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleAuthClick}
                className="w-full px-3 py-2 rounded-xl text-xs font-sans font-medium text-text-muted hover:text-text-main hover:bg-card/60 transition-all text-left"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden lg:flex w-48 flex-shrink-0 border-r border-border-subtle flex-col py-6 px-4 bg-background/80 backdrop-blur-md sticky top-0 h-screen">
        <div className="mb-8 px-2">
          <p className="font-semi-bold font-serif text-text-main tracking-tight">
            My Workspace
          </p>
          <p className="text-[10px] font-serif uppercase tracking-[0.18em] text-text-muted mt-0.5">
            Task Master
          </p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans font-medium transition-all text-left w-full text-text-muted hover:text-text-main hover:bg-card/60"
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Auth action */}
        <div className="flex flex-col gap-2 mt-4">
          {loginShow() ? (
            <button
              onClick={logout}
              className="px-3 py-2.5 border border-border-subtle text-text-muted rounded-xl text-xs font-sans font-semibold hover:text-red-400 hover:border-red-400/30 transition-all"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={handleAuthClick}
              className="px-3 py-2.5 border border-border-subtle text-text-muted rounded-xl text-xs font-sans font-semibold hover:text-text-main hover:border-text-muted transition-all"
            >
              Login
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans text-text-muted hover:text-text-main hover:bg-card/60 transition-all"
          >
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* DESKTOP HEADER */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-border-subtle bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-text-muted">
              {todayLabel}
            </p>
            <h1 className="text-xl font-semi-bold font-serif text-text-main leading-tight mt-0.5 tracking-tight">
              Welcome
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted hover:border-text-muted hover:text-text-main transition-colors"
            >
              {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            {loginShow() ? (
              <button
                onClick={logout}
                className="h-8 px-4 rounded-full border border-border-subtle text-xs font-sans text-text-muted hover:text-red-400 hover:border-red-400/30 transition-all"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleAuthClick}
                className="h-8 px-4 rounded-full border border-border-subtle text-xs font-sans text-text-muted hover:text-text-main hover:border-text-muted transition-all"
              >
                Login
              </button>
            )}
          </div>
        </header>

        {/* HERO CONTENT */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 lg:pb-8 flex flex-col justify-between">
          {/* Top section */}
          <div>
            {/* Session label + divider — same as other pages */}
            <div className="mb-8">
              <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-text-muted mb-2">
                Current Session
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-text-main leading-tight max-w-sm">
                Curating your Tasks for today.
              </h2>
              <div className="w-10 h-px bg-text-main mt-5" />
            </div>

            {/* Quote */}
            <div className="mb-10">
              <p className="text-base sm:text-lg text-text-muted/80 tracking-widest italic font-serif">
                " मा फलेषु कदाचन "
              </p>
              <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-text-muted/90 mt-2">
                Do not be attached to the fruits of action.
              </p>
            </div>

            {/* Feature rows — same style as task rows */}
            {/* App Flow */}
            <div className="mb-10 max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-sans uppercase tracking-[0.12em] font-semibold text-text-main">
                  How It Works
                </h3>
              </div>

              {[
                {
                  step: "01",
                  title: "Sign up or log in",
                  meta: "Your secure gateway to the workspace",
                },
                {
                  step: "02",
                  title: "Create categories",
                  meta: "Group your tasks into meaningful bunch",
                },
                {
                  step: "03",
                  title: "Add tasks",
                  meta: "Set titles, priority levels, categories, deadlines and frequency",
                },
                {
                  step: "04",
                  title: "Prioritise and reorder",
                  meta: "Drag and drop to set what matters most",
                },
                {
                  step: "05",
                  title: "Archive or bin completed tasks",
                  meta: "Keep history clean without losing anything",
                },
              ].map((item, i, arr) => (
                <div key={i} className="flex gap-4">
                  {/* Spine */}
                  <div className="flex flex-col items-center">
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-border-subtle flex-shrink-0 mt-[14px]" />
                    {i < arr.length - 1 && (
                      <div className="w-px flex-1 bg-border-subtle mt-1 mb-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className={`flex-1 min-w-0 py-3 ${i < arr.length - 1 ? "" : ""}`}
                  >
                    <p className="text-sm font-bold font-serif uppercase tracking-[0.18em] text-text-muted mb-0.5">
                      {item.step}
                    </p>
                    <p className="text-sm  font-serif leading-snug text-text-main">
                      {item.title}
                    </p>
                    <p className="text-xs text-text-main font-sans mt-0.5">
                      {item.meta}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA — pinned to bottom of content */}
          <div className="max-w-lg">
            {/* Dark card — same as "Next Priority" card */}
            <div className="bg-text-main rounded-xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[9px] font-sans uppercase tracking-[0.18em] text-text-muted mb-1">
                  Get Started
                </p>
                <p className="text-sm font-serif font-bold text-background leading-snug">
                  A digital sanctuary for focused productivity.
                </p>
              </div>
              <button
                onClick={handleStartClick}
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-background text-text-main rounded-full text-xs font-sans font-semibold hover:opacity-80 transition-all active:scale-95 whitespace-nowrap"
              >
                Open App
                <span className="text-base group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex border-t border-border-subtle bg-background/95 backdrop-blur-md">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className="flex-1 flex flex-col items-center gap-1 py-2 text-[9px] font-sans uppercase tracking-[0.08em] text-text-muted transition-colors"
          >
            <span>{item.icon}</span>
            {item.label === "My Tasks" ? "Tasks" : item.label}
          </button>
        ))}
      </nav>

      {/* Background orbs — kept subtle */}
      <div className="fixed top-[20vh] right-[10vw] w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-primary/5 blur-[120px] -z-10 animate-pulse pointer-events-none" />
      <div className="fixed bottom-[10vh] left-[5vw] w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-border-subtle/40 blur-[100px] -z-10 pointer-events-none" />
    </div>
  );
}

export default Landing;
