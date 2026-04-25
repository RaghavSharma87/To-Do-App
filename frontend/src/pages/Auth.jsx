import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api";
import AuthForm from "../components/AuthForm";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ── helper so login logic isn't duplicated ──
  const saveTokensAndRedirect = (data) => {
    localStorage.setItem("access", data.access);    // ✅ was "token"
    localStorage.setItem("refresh", data.refresh);  // ✅ was missing entirely
    navigate("/home");
  };

  const handleSubmit = async (data) => {
    setIsLoading(true);
    setError("");
    try {
      if (isLogin) {
        const res = await loginUser(data);
        saveTokensAndRedirect(res.data);
      } else {
        await registerUser(data);
        const res = await loginUser(data);
        saveTokensAndRedirect(res.data);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      isLogin={isLogin}
      isLoading={isLoading}
      error={error}
      onSubmit={handleSubmit}
      onToggle={() => {
        setIsLogin(!isLogin);
        setError("");
      }}
    />
  );
}

export default Auth;