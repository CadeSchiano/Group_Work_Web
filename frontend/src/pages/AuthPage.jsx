import { useState } from "react";
import { apiRequest } from "../api/client";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import { useAuth } from "../hooks/useAuth";

const initialForm = { name: "", email: "", password: "" };

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { persistSession } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const path = mode === "login" ? "/auth/login" : "/auth/signup";
      const payload = mode === "login" ? form : form;
      const data = await apiRequest(path, { method: "POST", body: payload });
      persistSession(data.token, data.user);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#07111f,_#10203a_55%,_#1b3255)] px-6 py-12 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="animate-rise rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.35em] text-mint/80">Collaborative planning</p>
          <h1 className="mt-4 font-display text-5xl leading-tight">
            Manage group projects with a shared workspace built for momentum.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-mist/75">
            Coordinate tasks, milestones, files, and team progress in one place. The dashboard keeps work visible and the roadmap keeps the team aligned.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Group dashboards", "Track every team’s delivery status at a glance."],
              ["Task ownership", "Assign work, deadlines, and real completion states."],
              ["Roadmap clarity", "Plan future milestones without losing the current sprint."],
            ].map(([title, text]) => (
              <Card key={title} className="bg-white/5">
                <h3 className="font-display text-xl">{title}</h3>
                <p className="mt-3 text-sm text-mist/75">{text}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="animate-rise">
          <div className="mb-8 flex rounded-2xl bg-white/5 p-1">
            <button
              className={`flex-1 rounded-2xl px-4 py-3 ${mode === "login" ? "bg-white text-ink" : "text-mist/80"}`}
              onClick={() => setMode("login")}
              type="button"
            >
              Log in
            </button>
            <button
              className={`flex-1 rounded-2xl px-4 py-3 ${mode === "signup" ? "bg-white text-ink" : "text-mist/80"}`}
              onClick={() => setMode("signup")}
              type="button"
            >
              Sign up
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <Input
                label="Name"
                placeholder="Jordan Lee"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            ) : null}
            <Input
              label="Email"
              type="email"
              placeholder="team@example.com"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />

            {error ? <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}

            <Button className="w-full" disabled={loading} type="submit">
              {loading ? "Working..." : mode === "login" ? "Log in" : "Create account"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
