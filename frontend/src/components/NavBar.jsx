import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/landing");
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300  ${
        isScrolled 
          ? "bg-nav-bg/80 backdrop-blur-md border-b border-border-subtle py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-6">
        <h1
          onClick={() => navigate("/landing")}
          className="text-xl font-bold tracking-tight cursor-pointer text-text-main hover:opacity-70 transition-opacity"
        >
          Task Master
        </h1>

        <div className="flex items-center gap-8">
          {token ? (
            <>
              <button
                onClick={() => navigate("/home")}
                className="text-sm font-medium text-text-muted hover:text-text-main transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                className="bg-primary text-background px-5 py-1.5 rounded-full text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="bg-primary text-background px-6 py-2 rounded-full text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
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