import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

const emptyTask = { title: "", description: "", assignedUserId: "", dueDate: "", status: "TODO" };
const emptyMilestone = { title: "", description: "", targetDate: "" };

const tryRemoveRequest = async (requests) => {
  let lastError = null;

  for (const request of requests) {
    try {
      return await apiRequest(request.path, request.options);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

export default function GroupPage() {
  const { groupId } = useParams();
  const { token, user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [milestoneForm, setMilestoneForm] = useState(emptyMilestone);
  const [file, setFile] = useState(null);

  const progressValue = useMemo(() => {
    if (!group?.tasks?.length) {
      return 0;
    }

    const completedTasks = group.tasks.filter((task) => task.status === "DONE").length;
    return Math.round((completedTasks / group.tasks.length) * 100);
  }, [group]);

  const isOwner = group?.ownerId === user?.id;

  const loadGroup = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(`/groups/${groupId}`, { token });
      setGroup(data.group);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await apiRequest(`/groups/${groupId}/tasks`, {
        method: "POST",
        token,
        body: {
          ...taskForm,
          assignedUserId: taskForm.assignedUserId || null,
          dueDate: taskForm.dueDate || null,
        },
      });
      setTaskForm(emptyTask);
      await loadGroup();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const handleTaskStatus = async (taskId, status) => {
    setError("");

    try {
      const task = group.tasks.find((item) => item.id === taskId);
      setGroup((current) =>
        current
          ? {
              ...current,
              tasks: current.tasks.map((item) => (item.id === taskId ? { ...item, status } : item)),
            }
          : current,
      );
      await apiRequest(`/tasks/${taskId}`, {
        method: "PATCH",
        token,
        body: {
          title: task.title,
          description: task.description,
          assignedUserId: task.assignedUser?.id || null,
          dueDate: task.dueDate,
          status,
        },
      });
      await loadGroup();
    } catch (submitError) {
      setError(submitError.message);
      await loadGroup();
    }
  };

  const handleMilestone = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await apiRequest(`/groups/${groupId}/roadmap`, {
        method: "POST",
        token,
        body: milestoneForm,
      });
      setMilestoneForm(emptyMilestone);
      await loadGroup();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Choose a file first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      await apiRequest(`/groups/${groupId}/files`, {
        method: "POST",
        token,
        body: formData,
        isFormData: true,
      });
      setFile(null);
      event.target.reset();
      await loadGroup();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const handleRemoveMember = async (memberId) => {
    setError("");

    try {
      await tryRemoveRequest([
        {
          path: `/groups/${groupId}/members/${memberId}/remove`,
          options: { method: "POST", token, body: {} },
        },
        {
          path: `/groups/${groupId}/members/${memberId}`,
          options: { method: "DELETE", token },
        },
      ]);
      await loadGroup();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const handleRemoveFile = async (fileId) => {
    setError("");

    try {
      await tryRemoveRequest([
        {
          path: `/groups/${groupId}/files/${fileId}/delete`,
          options: { method: "POST", token, body: {} },
        },
        {
          path: `/groups/${groupId}/files/${fileId}`,
          options: { method: "DELETE", token },
        },
      ]);
      await loadGroup();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <Link className="text-sm text-mint" to="/app">
            Back to dashboard
          </Link>
          <h1 className="mt-3 font-display text-5xl">{group?.name || "Loading group..."}</h1>
          <p className="mt-3 max-w-3xl text-mist/70">{group?.description}</p>
        </div>
        {group ? (
          <Card className="w-full max-w-sm bg-white/5">
            <p className="text-sm text-mist/70">Invite code</p>
            <p className="mt-2 font-display text-4xl">{group.inviteCode}</p>
            <div className="mt-4">
              <ProgressBar value={progressValue} />
            </div>
          </Card>
        ) : null}
      </div>

      {loading ? <p className="text-mist/70">Loading group workspace...</p> : null}
      {error ? <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}

      {group ? (
        <>
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <SectionHeader
                eyebrow="Tasks"
                title="Execution board"
                subtitle="Assign work, set dates, and move tasks from active work into completion."
              />
              <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleCreateTask}>
                <Input
                  label="Title"
                  placeholder="Prepare demo build"
                  value={taskForm.title}
                  onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
                />
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-mist/80">Assigned user</span>
                  <select
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-mint"
                    value={taskForm.assignedUserId}
                    onChange={(event) => setTaskForm((current) => ({ ...current, assignedUserId: event.target.value }))}
                  >
                    <option className="bg-ink" value="">
                      Unassigned
                    </option>
                    {group.members.map((member) => (
                      <option className="bg-ink" key={member.user.id} value={member.user.id}>
                        {member.user.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Textarea
                  className="md:col-span-2"
                  label="Description"
                  placeholder="Scope, dependencies, and expected output."
                  value={taskForm.description}
                  onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
                />
                <Input
                  label="Due date"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) => setTaskForm((current) => ({ ...current, dueDate: event.target.value }))}
                />
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-mist/80">Status</span>
                  <select
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-mint"
                    value={taskForm.status}
                    onChange={(event) => setTaskForm((current) => ({ ...current, status: event.target.value }))}
                  >
                    <option className="bg-ink" value="TODO">
                      Todo
                    </option>
                    <option className="bg-ink" value="IN_PROGRESS">
                      In progress
                    </option>
                    <option className="bg-ink" value="DONE">
                      Done
                    </option>
                  </select>
                </label>
                <Button className="md:col-span-2" type="submit">
                  Add task
                </Button>
              </form>

              <div className="mt-8 space-y-4">
                {group.tasks.map((task) => (
                  <div key={task.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{task.title}</h3>
                          <StatusBadge status={task.status} />
                        </div>
                        <p className="mt-2 text-sm text-mist/70">{task.description}</p>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-mist/70">
                          <span>Assigned to: {task.assignedUser?.name || "Nobody"}</span>
                          <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {["TODO", "IN_PROGRESS", "DONE"].map((status) => (
                          <Button
                            key={status}
                            className="px-3 py-2 text-xs"
                            onClick={() => handleTaskStatus(task.id, status)}
                            variant={task.status === status ? "primary" : "secondary"}
                          >
                            {status.replace("_", " ")}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-6">
              <Card>
                <SectionHeader
                  eyebrow="Files"
                  title="Shared assets"
                  subtitle="Upload working docs, exports, and references for everyone in the group."
                />
                <form className="mt-6 space-y-4" onSubmit={handleUpload}>
                  <input
                    className="block w-full rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-sm text-mist file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-ink"
                    onChange={(event) => setFile(event.target.files?.[0] || null)}
                    type="file"
                  />
                  <Button className="w-full" type="submit">
                    Upload file
                  </Button>
                </form>
                <div className="mt-6 space-y-3">
                  {group.files.map((item) => (
                    <div
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-mist transition hover:border-mint/40"
                      key={item.id}
                    >
                      <a
                        className="min-w-0 flex-1"
                        href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:4000"}${item.filePath}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <p className="truncate">{item.originalName}</p>
                        <p className="mt-1 text-xs text-mist/70">
                          {item.uploader.name} • {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </a>
                      {isOwner || item.uploader.id === user?.id ? (
                        <Button
                          className="px-3 py-2 text-xs"
                          onClick={() => handleRemoveFile(item.id)}
                          type="button"
                          variant="ghost"
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <SectionHeader
                  eyebrow="Roadmap"
                  title="Future milestones"
                  subtitle="Capture next-phase outcomes and target dates without losing current execution."
                />
                <form className="mt-6 space-y-4" onSubmit={handleMilestone}>
                  <Input
                    label="Milestone title"
                    placeholder="Usability test round"
                    value={milestoneForm.title}
                    onChange={(event) => setMilestoneForm((current) => ({ ...current, title: event.target.value }))}
                  />
                  <Textarea
                    label="Description"
                    placeholder="What the milestone delivers and how success is measured."
                    value={milestoneForm.description}
                    onChange={(event) =>
                      setMilestoneForm((current) => ({ ...current, description: event.target.value }))
                    }
                  />
                  <Input
                    label="Target date"
                    type="date"
                    value={milestoneForm.targetDate}
                    onChange={(event) =>
                      setMilestoneForm((current) => ({ ...current, targetDate: event.target.value }))
                    }
                  />
                  <Button className="w-full" type="submit" variant="secondary">
                    Add milestone
                  </Button>
                </form>
                <div className="mt-6 space-y-4">
                  {group.roadmap.map((milestone) => (
                    <div key={milestone.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold">{milestone.title}</h3>
                        <span className="text-sm text-accent">
                          {new Date(milestone.targetDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-mist/70">{milestone.description}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <SectionHeader
                  eyebrow="Members"
                  title="Team roster"
                  subtitle="Everyone currently working in this group."
                />
                <div className="mt-6 grid gap-3">
                  {group.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                      <div>
                        <p className="font-semibold">{member.user.name}</p>
                        <p className="text-sm text-mist/70">{member.user.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-mist">
                          {member.role}
                        </span>
                        {isOwner && member.user.id !== user?.id ? (
                          <Button
                            className="px-3 py-2 text-xs"
                            onClick={() => handleRemoveMember(member.user.id)}
                            type="button"
                            variant="ghost"
                          >
                            Remove
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </section>
        </>
      ) : null}
    </AppShell>
  );
}
