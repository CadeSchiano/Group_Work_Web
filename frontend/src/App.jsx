import { Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import GroupPage from "./pages/GroupPage";
import HomePage from "./pages/HomePage";
import PrivacyPage from "./pages/PrivacyPage";
import { useAuth } from "./hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-mist">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/auth" element={user ? <Navigate to="/app" replace /> : <AuthPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId"
        element={
          <ProtectedRoute>
            <GroupPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={user ? "/app" : "/"} replace />} />
    </Routes>
  );
}
