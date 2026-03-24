import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import ProgressBar from "../components/ProgressBar";
import SectionHeader from "../components/SectionHeader";
import StatusBadge from "../components/StatusBadge";
import Textarea from "../components/Textarea";
import { useAuth } from "../hooks/useAuth";
import AppShell from "../layouts/AppShell";

const createGroupForm = { name: "", description: "" };

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [groupForm, setGroupForm] = useState(createGroupForm);
  const [inviteCode, setInviteCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadGroups = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/groups", { token });
      setGroups(data.groups);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const recentTasks = useMemo(
    () =>
      groups
        .flatMap((group) => group.tasks.map((task) => ({ ...task, groupName: group.name, groupId: group.id })))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [groups],
  );

  const stats = useMemo(() => {
    const taskCount = groups.reduce((sum, group) => sum + group.tasks.length, 0);
    const doneCount = groups.reduce(
      (sum, group) => sum + group.tasks.filter((task) => task.status === "DONE").length,
      0,
    );
    return {
      groups: groups.length,
      tasks: taskCount,
      completed: doneCount,
    };
  }, [groups]);

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await apiRequest("/groups", {
        method: "POST",
        token,
        body: groupForm,
      });
      setGroupForm(createGroupForm);
      await loadGroups();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinGroup = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await apiRequest("/groups/join", {
        method: "POST",
        token,
        body: { inviteCode },
      });
      setInviteCode("");
      await loadGroups();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="animate-rise overflow-hidden">
          <p className="text-sm uppercase tracking-[0.35em] text-accent/90">Workspace overview</p>
          <h1 className="mt-4 font-display text-5xl">
            {user?.name?.split(" ")[0]}'s project dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-mist/75">
            Stay on top of active groups, recent tasks, and momentum across the teams you collaborate with.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Groups", stats.groups],
              ["Tasks", stats.tasks],
              ["Completed", stats.completed],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-mist/70">{label}</p>
                <p className="mt-3 font-display text-4xl">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="animate-rise">
          <SectionHeader
            eyebrow="New Group"
            title="Create or join"
            subtitle="Start a new collaboration space or enter an existing one with an invite code."
          />

          <div className="mt-6 space-y-8">
            <form className="space-y-4" onSubmit={handleCreateGroup}>
              <Input
                label="Group name"
                placeholder="Capstone Team"
                value={groupForm.name}
                onChange={(event) => setGroupForm((current) => ({ ...current, name: event.target.value }))}
              />
              <Textarea
                label="Description"
                placeholder="Shared planning space for research, implementation, and deliverables."
                value={groupForm.description}
                onChange={(event) => setGroupForm((current) => ({ ...current, description: event.target.value }))}
              />
              <Button className="w-full" disabled={submitting} type="submit">
                Create group
              </Button>
            </form>

            <form className="space-y-4 border-t border-white/10 pt-6" onSubmit={handleJoinGroup}>
              <Input
                label="Invite code"
                placeholder="AB12CD"
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
              />
              <Button className="w-full" disabled={submitting} type="submit" variant="secondary">
                Join group
              </Button>
            </form>
          </div>

          {error ? <p className="mt-4 rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <SectionHeader
            eyebrow="Groups"
            title="Your active teams"
            subtitle="Each card shows its current delivery status and invite code for quick sharing."
          />

          {loading ? <p className="mt-6 text-mist/70">Loading groups...</p> : null}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {groups.map((group) => (
              <Link key={group.id} to={`/groups/${group.id}`}>
                <Card className="h-full border-white/5 bg-white/5 transition hover:-translate-y-1 hover:border-mint/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl">{group.name}</h3>
                      <p className="mt-2 text-sm text-mist/70">{group.description}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-2 text-xs text-mist">
                      {group.members.length} members
                    </span>
                  </div>
                  <div className="mt-6">
                    <ProgressBar value={group.progress} />
                  </div>
                  <div className="mt-6 flex items-center justify-between text-sm text-mist/70">
                    <span>Invite code: {group.inviteCode}</span>
                    <span>{group.tasks.length} tasks</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Recent Work"
            title="Latest tasks"
            subtitle="A quick view of what changed across all your groups."
          />

          <div className="mt-6 space-y-4">
            {recentTasks.length ? (
              recentTasks.map((task) => (
                <div key={task.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{task.title}</p>
                      <p className="mt-1 text-sm text-mint">{task.groupName}</p>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="mt-3 text-sm text-mist/70">{task.description}</p>
                </div>
              ))
            ) : (
              <p className="rounded-3xl border border-dashed border-white/10 p-6 text-mist/70">
                No tasks yet. Create a group and add the first task to populate the dashboard.
              </p>
            )}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
