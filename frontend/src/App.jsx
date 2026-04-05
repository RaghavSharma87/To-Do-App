import Home from "./pages/Home";
import { ThemeProvider } from "./components/ThemeContext";
import Auth from "./pages/Auth";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/LandingPage";
import Categories from "./pages/Categories";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
function Layout() {
  const location = useLocation();

  // Hide the global navbar on both Auth and Landing pages
  const hideNavbar = ["/auth", "/"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <NavBar />}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
function App() {
  return (
    <ThemeProvider> 
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
