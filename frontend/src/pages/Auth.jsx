import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { loginUser, registerUser } from "../api";
import AuthForm from "../components/AuthForm";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Initialize the hook

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        const res = await loginUser(data);
        localStorage.setItem("token", res.data.access);
        
        
        navigate("/home"); 
      } else {
        await registerUser(data);
        const res=await loginUser(data)
        localStorage.setItem("token", res.data.access);
      }
    } catch (err) {
      console.error(err.response?.data);
      // You could map specific backend errors here (e.g., "Invalid credentials")
      alert(err.response?.data?.detail || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      isLogin={isLogin}
      isLoading={isLoading} // Pass loading state to the form
      onSubmit={handleSubmit}
      onToggle={() => setIsLogin(!isLogin)}
    />
  );
}

export default Auth;