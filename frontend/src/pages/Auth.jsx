import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api";
import AuthForm from "../components/AuthForm";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(""); // ← add this
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    setIsLoading(true);
    setError(""); // ← clear previous error on new attempt
    try {
      if (isLogin) {
        const res = await loginUser(data);
        localStorage.setItem("token", res.data.access);
        navigate("/home");
      } else {
        await registerUser(data);
        const res = await loginUser(data);
        localStorage.setItem("token", res.data.access);
        navigate("/home");
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "An error occurred. Please try again."); // ← set error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      isLogin={isLogin}
      isLoading={isLoading}
      error={error}              // ← pass error down
      onSubmit={handleSubmit}
      onToggle={() => {
        setIsLogin(!isLogin);
        setError("");            // ← clear error when switching tabs
      }}
    />
  );
}

export default Auth;