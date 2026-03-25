import { useState } from "react";
import ErrorAlert from "./ErrorAlert";

function AuthForm({ isLogin, onSubmit, onToggle, error }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state
  const [showpassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(""); // For password mismatch

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    // Validation: Check if passwords match during registration
    if (!isLogin && password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    onSubmit({ username, password });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md glass-strong p-8 md:p-12 rounded-3xl shadow-sm transition-all duration-500">
        
        {/* Logo Section */}
        <div className="text-center mb-10">
          <h2 className="text-sm uppercase tracking-[0.3em] font-bold text-primary mb-2">
            Task Master
          </h2>
          <h1 className="text-3xl font-bold tracking-tighter text-text-main">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-sm text-text-muted mt-2">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button 
              type="button"
              onClick={() => {
                onToggle();
                setLocalError("");
                setConfirmPassword("");
              }} 
              className="text-text-main font-semibold underline underline-offset-4 hover:opacity-60 transition-opacity"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Show either Backend Error or Local Validation Error */}
        <ErrorAlert message={error || localError} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted ml-1">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 bg-background/50 border border-border-subtle rounded-xl focus:outline-none focus:ring-1 focus:ring-primary transition-all text-text-main"
              required
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted ml-1">Password</label>
            <input
              type={showpassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-background/50 border border-border-subtle rounded-xl focus:outline-none focus:ring-1 focus:ring-primary transition-all text-text-main"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showpassword)}
              className="absolute right-4 top-[38px] text-lg opacity-40 hover:opacity-100 transition-opacity"
            >
              {showpassword ? "👁️" : "🙈"} 
            </button>
          </div>

          {/* --- CONFIRM PASSWORD FIELD  --- */}
          {!isLogin && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted ml-1">Confirm Password</label>
              <input
                type={showpassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 bg-background/50 border border-border-subtle rounded-xl focus:outline-none focus:ring-1 focus:ring-primary transition-all text-text-main"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-background font-bold py-4 rounded-xl mt-4 hover:bg-primary-hover transition-all shadow-lg active:scale-[0.98]"
          >
            {isLogin ? "Sign In" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthForm;