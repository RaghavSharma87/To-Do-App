import React from "react";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  // Helper to handle routing based on auth state
  const handleStartClick = () => {
    const token = localStorage.getItem("token");
    navigate(token ? "/home" : "/auth");
  };

  const waveBackground = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' opacity='0.05' viewBox='0 0 1600 800'%3E%3Cpath fill='none' stroke='%23C1BDB9' stroke-width='0.5' d='M-100,600 C200,400 400,800 600,600 S1000,400 1200,600 S1500,800 1700,600'/%3E%3Cpath fill='none' stroke='%23DCD9D5' stroke-width='0.5' d='M-100,550 C200,350 400,750 600,550 S1000,350 1200,550 S1500,750 1700,550'/%3E%3Cpath fill='none' stroke='%23C1BDB9' stroke-width='0.5' d='M-100,500 C200,300 400,700 600,500 S1000,300 1200,500 S1500,700 1700,500'/%3E%3C/svg%3E")`;

  return (
    <div
      className="min-h-screen font-sans bg-background selection:bg-border-subtle overflow-hidden relative selection:text-primary"
      style={{
        backgroundImage: waveBackground,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <header className="fixed top-0 w-full z-50 py-6 bg-background/80 backdrop-blur-md border-b border-border-subtle/30 animate-fade-in">
        <nav className="max-w-7xl mx-auto flex justify-between items-center px-6">
          <div className="flex items-center gap-12">
            <h1
              className="text-2xl font-bold tracking-tighter text-text-main cursor-pointer hover:opacity-70 transition-opacity font-serif"
              onClick={() => navigate("/")}
            >
              Task Master
            </h1>

            <div className="hidden md:flex gap-8 items-center">
              {[
                { name: "Home", path: "/home" },
                { name: "Categories", path: "/categories" },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className="text-xs uppercase tracking-[0.2em] font-medium text-text-muted hover:text-text-main transition-all duration-300"
                >
                  {item.name}
                </button>
              ))}

              <div className="h-4 w-[1px] bg-border-subtle mx-2" />

              <button
                onClick={() => navigate("/auth")}
                className="text-xs uppercase tracking-[0.2em] font-bold text-text-main hover:opacity-60 transition-opacity"
              >
                Login
              </button>
            </div>
          </div>

          <button
            onClick={handleStartClick}
            className="bg-primary text-background px-6 py-2 rounded-full text-sm font-medium hover:bg-primary-hover transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            Get Started
          </button>
        </nav>
      </header>

      <main className="relative z-10 flex flex-col justify-center items-center min-h-screen max-w-7xl mx-auto px-6 pt-20 text-center">
        {/* Quote Section */}
        <div className="mb-12 animate-fade-in animation-delay-100">
          <p 
            className="text-2xl md:text-3xl text-text-muted/80 tracking-widest italic hover:text-primary/90"
            style={{ fontFamily: "'Noto Serif Devanagari', serif, 'Georgia'" }}
          >
            " मा फलेषु कदाचन "
          </p>
          <div className="h-[1px] w-12 bg-border-subtle mx-auto mt-4" />
        </div>

        {/* Hero Content */}
        <div className="flex flex-col items-center gap-8 max-w-3xl">
          <h2 className="text-7xl md:text-9xl font-bold tracking-tighter leading-[0.8] text-text-main font-serif animate-slide-up">
            Minimalist
            <br />
            <span className="text-text-muted/40 italic font-light "
            >To-Do</span>
          </h2>

          <p className="text-text-muted max-w-lg leading-relaxed text-lg md:text-xl animate-slide-up animation-delay-200">
            A digital sanctuary for focused productivity. Clean lines,
            sophisticated tasks, and quiet professionalism.
          </p>

          <div className="animate-slide-up animation-delay-300">
            <button
              onClick={handleStartClick}
              className="group relative flex items-center gap-3 mt-4 bg-primary text-background px-10 py-4 rounded-full text-base font-semibold hover:bg-primary-hover transition-all shadow-lg overflow-hidden active:scale-95"
            >
              <span className="relative z-10">Create Task List</span>
              <span className="text-xl group-hover:translate-x-2 transition-transform duration-300">
                →
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Decorative Blur */}
      <div className="fixed top-[20vh] right-[10vw] w-96 h-96 rounded-full bg-primary/5 blur-[120px] -z-10 animate-pulse" />
      <div className="fixed bottom-[10vh] left-[5vw] w-64 h-64 rounded-full bg-border-subtle/40 blur-[100px] -z-10" />
    </div>
  );
}

export default Landing;