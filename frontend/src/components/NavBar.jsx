import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../components/ThemeContext"; // Import your theme hook
import { Sun, Moon } from "lucide-react"; // Optional: if you want icons

function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme(); // Access theme state
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/"); // Redirecting to landing after logout
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? " glass backdrop-blur-md border-b border-border-subtle py-3 shadow-sm"
          : "bg-transparent py-6"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-6">
        {/* Logo */}
        <h1
          onClick={() => navigate("/")}
          className="text-xl font-bold tracking-tighter cursor-pointer text-text-main hover:opacity-70 transition-all font-serif"
        >
          Task Master
        </h1>

        <div className="flex items-center gap-6">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-border-subtle/20 transition-colors text-text-main"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {token ? (
            <>
              <button
                onClick={() => navigate("/home")}
                className="text-sm font-medium text-text-muted hover:text-text-main transition-colors font-sans uppercase tracking-widest text-[10px]"
              >
                Dashboard
              </button>
              
              <button
                onClick={logout}
                className="bg-primary text-background px-5 py-1.5 rounded-full text-xs font-bold hover:opacity-90 transition-all shadow-md active:scale-95"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="bg-primary text-background px-6 py-2 rounded-full text-xs font-bold hover:opacity-90 transition-all shadow-md active:scale-95"
            >
              Login
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

export default NavBar;