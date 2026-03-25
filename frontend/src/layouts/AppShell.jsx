import { Link, useLocation } from "react-router-dom";
import Button from "../components/Button";
import BottomAdBanner from "../components/BottomAdBanner";
import { useAuth } from "../hooks/useAuth";

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const showBottomAd = location.pathname === "/app";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.2),_transparent_28%),linear-gradient(160deg,_#07111f,_#0b1728_45%,_#13253d)] text-white">
      <header className="border-b border-white/10 bg-black/10 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/app" className="font-display text-2xl tracking-tight text-white">
            Group Project Hub
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-mist/70">Signed in as</p>
              <p className="font-semibold">{user?.name}</p>
            </div>
            <Button variant="secondary" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className={`mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 ${showBottomAd ? "pb-40" : ""}`}>
        {children}
      </main>
      {showBottomAd ? <BottomAdBanner /> : null}
    </div>
  );
}
