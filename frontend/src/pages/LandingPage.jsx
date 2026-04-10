import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { isTokenValid } from "../utils/auth";
function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = React.useState(false);

  const strokeColor = theme === "dark" ? "%2327272A" : "%23C1BDB9";

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

  const loginShow = () => {
    const token = localStorage.getItem("token");
    return isTokenValid(token);
  };

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

  const waveBackground = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' opacity='0.05' viewBox='0 0 1600 800'%3E%3Cpath fill='none' stroke='${strokeColor}' stroke-width='0.5' d='M-100,600 C200,400 400,800 600,600 S1000,400 1200,600 S1500,800 1700,600'/%3E%3Cpath fill='none' stroke='${strokeColor}' stroke-width='0.5' d='M-100,550 C200,350 400,750 600,550 S1000,350 1200,550 S1500,750 1700,550'/%3E%3Cpath fill='none' stroke='${strokeColor}' stroke-width='0.5' d='M-100,500 C200,300 400,700 600,500 S1000,300 1200,500 S1500,700 1700,500'/%3E%3C/svg%3E")`;

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden font-sans bg-background text-text-main transition-colors duration-500 selection:bg-border-subtle relative"
      style={{
        backgroundImage: waveBackground,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 py-4 sm:py-6 bg-background/80 backdrop-blur-md border-b border-border-subtle/30">
        <nav className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6">
          {/* LEFT */}
          <div className="flex items-center gap-6 sm:gap-12">
            <h1
              className="text-xl sm:text-2xl font-bold tracking-tighter cursor-pointer hover:opacity-70 transition-opacity font-serif"
              onClick={() => navigate("/")}
            >
              Task Master
            </h1>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex gap-8 items-center">
              <button onClick={handleStartClick} className="nav-link">
                Home
              </button>
              <button onClick={HandleCategoryClick} className="nav-link">
                Categories
              </button>

              <div className="h-4 w-[1px] bg-border-subtle mx-2" />

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-border-subtle/20 transition-colors"
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {loginShow() ? (
                <button onClick={logout}>Logout</button>
              ) : (
                <button onClick={handleAuthClick}>Login</button>
              )}
            </div>
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </nav>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 flex flex-col gap-4 bg-background border-b border-border-subtle">
            <button onClick={handleStartClick}>Home</button>
            <button onClick={HandleCategoryClick}>Categories</button>

            <button onClick={toggleTheme}>
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>

            {loginShow() ? (
              <button onClick={logout}>Logout</button>
            ) : (
              <button onClick={handleAuthClick}>Login</button>
            )}
          </div>
        )}
      </header>

      {/* MAIN */}
      <main className="relative z-10 flex flex-col justify-center items-center min-h-screen max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 text-center">
        {/* QUOTE */}
        <div className="mb-10 sm:mb-12">
          <p className="text-lg sm:text-xl md:text-3xl text-text-muted/80 tracking-widest italic font-serif">
            " मा फलेषु कदाचन "
          </p>
          <div className="h-[1px] w-12 bg-border-subtle mx-auto mt-4" />
        </div>

        {/* HERO */}
        <div className="flex flex-col items-center gap-6 sm:gap-8 max-w-3xl">
          <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] font-serif">
            Minimalist
            <br />
            <span className="text-text-muted/40 italic font-light">To-Do</span>
          </h2>

          <p className="text-text-muted max-w-md sm:max-w-lg leading-relaxed text-sm sm:text-lg md:text-xl">
            A digital sanctuary for focused productivity. Clean lines,
            sophisticated tasks, and quiet professionalism.
          </p>

          <button
            onClick={handleStartClick}
            className="group flex items-center gap-3 mt-4 bg-primary text-background px-6 py-3 sm:px-10 sm:py-4 rounded-full text-sm sm:text-base font-semibold hover:bg-primary-hover transition-all shadow-lg active:scale-95"
          >
            <span>Create Task List</span>
            <span className="text-lg sm:text-xl group-hover:translate-x-2 transition-transform">
              →
            </span>
          </button>
        </div>
      </main>

      {/* BACKGROUND ORBS */}
      <div className="fixed top-[20vh] right-[10vw] w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-full bg-primary/5 blur-[120px] -z-10 animate-pulse" />
      <div className="fixed bottom-[10vh] left-[5vw] w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-full bg-border-subtle/40 blur-[100px] -z-10" />
    </div>
  );
}

export default Landing;
