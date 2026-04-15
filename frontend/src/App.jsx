import Home from "./pages/Home";
import { ThemeProvider } from "./components/ThemeContext";
import Auth from "./pages/Auth";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/LandingPage";
import Categories from "./pages/Categories";
import Archive from "./pages/Archive";
import Setting from "./pages/Setting";
import MissedDeadlines from "./pages/MissedDeadlines";
import BackgroundWrapper from "./components/BackgroundWrapper";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

function Layout() {
  const location = useLocation();

  const hideNavbar = ["/auth", "/", "/home", "/categories", "/archive", "/settings", "/missed-deadlines"].includes(
    location.pathname,
  );

  return (
    <>
      {!hideNavbar && <NavBar />}

      <Routes>
        <Route path="/" element={<BackgroundWrapper><Landing /></BackgroundWrapper>} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/settings" element={<BackgroundWrapper><Setting /></BackgroundWrapper>} />

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
        <Route
          path="/archive"
          element={
            <ProtectedRoute>
                <Archive />
            </ProtectedRoute>
          }
        />
                <Route
          path="/missed-deadlines"
          element={
            <ProtectedRoute>
                <MissedDeadlines />
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