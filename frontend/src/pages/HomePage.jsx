import { Link } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,_#07111f,_#10203a_48%,_#18304d)] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-6 rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-mint/80">Group Project Hub</p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl leading-tight">
              A collaborative workspace for student teams and shared project delivery.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-mist/75">
              Plan tasks, share files, track progress, and keep every group member aligned from kickoff to final submission.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/auth">
              <Button className="w-full sm:w-auto">Get started</Button>
            </Link>
            <Link to="/privacy">
              <Button className="w-full sm:w-auto" variant="secondary">
                Privacy policy
              </Button>
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["Task tracking", "Organize assignments, due dates, and completion states in one place."],
            ["Team visibility", "See who owns what work and how the group is progressing overall."],
            ["Shared files", "Keep references, drafts, and uploads connected directly to the group workspace."],
          ].map(([title, text]) => (
            <Card key={title} className="bg-white/5">
              <h2 className="font-display text-2xl">{title}</h2>
              <p className="mt-3 text-sm text-mist/75">{text}</p>
            </Card>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="bg-white/5">
            <p className="text-sm uppercase tracking-[0.3em] text-accent/90">Who It Helps</p>
            <h2 className="mt-4 font-display text-3xl">Built for capstones, class teams, clubs, and collaborative project work.</h2>
            <p className="mt-4 text-mist/75">
              Group Project Hub gives small teams a structured way to manage deadlines, assignment ownership, and shared project assets without relying on scattered documents and chat threads.
            </p>
          </Card>
          <Card className="bg-white/5">
            <p className="text-sm uppercase tracking-[0.3em] text-mint/80">Core Features</p>
            <ul className="mt-4 space-y-3 text-sm text-mist/75">
              <li>Private accounts with email login and password recovery</li>
              <li>Invite-code group creation and member management</li>
              <li>Progress tracking based on completed group tasks</li>
              <li>File uploads and milestone planning inside each group</li>
            </ul>
          </Card>
        </section>

        <footer className="mt-12 flex flex-col gap-3 border-t border-white/10 py-6 text-sm text-mist/65 sm:flex-row sm:items-center sm:justify-between">
          <p>Group Project Hub helps teams organize collaborative work online.</p>
          <div className="flex gap-5">
            <Link className="transition hover:text-white" to="/privacy">
              Privacy Policy
            </Link>
            <Link className="transition hover:text-white" to="/auth">
              Log In
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
