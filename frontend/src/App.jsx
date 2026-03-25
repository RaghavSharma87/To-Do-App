import Home from "./pages/Home";
import Auth from "./pages/Auth";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/LandingPage";
import Categories from "./pages/Categories";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
    
      <NavBar />
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/categories"
        element={
          <ProtectedRoute>
            <Categories/>
          </ProtectedRoute>
        } />
        <Route path="/landing" element={<Navigate to="/" />} />
        <Route path="/Auth" element={<Auth />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
