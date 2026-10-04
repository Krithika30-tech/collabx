import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { errMsg } from "../utils";
import Chat from "../components/Chat";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [joinMsg, setJoinMsg] = useState("");
  const [roles, setRoles] = useState({});
  const [task, setTask] = useState({ title: "", assignedTo: "", priority: "medium", dueDate: "" });

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
      if (data.members.some((m) => m.user._id === user._id)) {
        const res = await api.get(`/projects/${id}/tasks`);
        setTasks(res.data);
      } else {
        setTasks([]);
      }
    } catch (err) {
      setError(errMsg(err));
    }
  }, [id, user._id]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn, okMsg) => {
    setError("");
    setInfo("");
    try {
      await fn();
      if (okMsg) setInfo(okMsg);
      await load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const join = () => run(() => api.post(`/projects/${id}/join`, { message: joinMsg }), "Join request sent");
  const respond = (uid, action) =>
    run(() => api.put(`/projects/${id}/requests/${uid}`, { action, role: roles[uid] || "Member" }),
      action === "accept" ? "Member added" : "Request rejected");
  const removeMember = (uid) => run(() => api.delete(`/projects/${id}/members/${uid}`), "Member removed");
  const setStatus = (status) => run(() => api.put(`/projects/${id}`, { status }), "Status updated");
  const updateTask = (tid, status) => run(() => api.put(`/tasks/${tid}`, { status }));

  const createTask = (e) => {
    e.preventDefault();
    const body = { title: task.title, priority: task.priority };
    if (task.assignedTo) body.assignedTo = task.assignedTo;
    if (task.dueDate) body.dueDate = task.dueDate;
    run(async () => {
      await api.post(`/projects/${id}/tasks`, body);
      setTask({ title: "", assignedTo: "", priority: "medium", dueDate: "" });
    }, "Task created");
  };

  if (!project) {
    return <p className="mt-10 text-center text-gray-600">{error || "Loading..."}</p>;
  }

  const isOwner = project.owner._id === user._id;
  const isMember = project.members.some((m) => m.user._id === user._id);
  const pending = (project.joinRequests || []).filter((r) => r.status === "pending");
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="mx-auto mt-8 max-w-5xl space-y-6">
      {error && <p className="rounded bg-red-100 p-3 text-sm text-red-700">{error}</p>}
      {info && <p className="rounded bg-green-100 p-3 text-sm text-green-700">{info}</p>}

      <section className="rounded-xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">{project.category}</span>
            <h1 className="mt-2 text-2xl font-bold text-gray-800">{project.title}</h1>
            <p className="text-sm text-gray-500">Owner: {project.owner.name}</p>
          </div>
          {isOwner ? (
            <div className="flex items-center gap-2">
              <select value={project.status} onChange={(e) => setStatus(e.target.value)} className="rounded border p-2 text-sm">
                <option value="open">Open</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
              <Link to={`/matches?projectId=${project._id}`} className="rounded bg-indigo-600 px-3 py-2 text-sm text-white">
                Find teammates
              </Link>
            </div>
          ) : (
            <span className="text-sm capitalize text-gray-500">{project.status}</span>
          )}
        </div>
        <p className="mt-4 text-gray-700">{project.description}</p>
        <div className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
          <p><b>Required skills:</b> {project.requiredSkills.join(", ") || "-"}</p>
          <p><b>Required roles:</b> {project.requiredRoles.join(", ") || "-"}</p>
          <p><b>Technologies:</b> {project.technologies.join(", ") || "-"}</p>
          <p><b>Availability:</b> {project.availability} · <b>Level:</b> {project.experienceLevel}</p>
        </div>
      </section>

      {!isMember && project.status !== "completed" && (
        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">Request to join</h2>
          <textarea value={joinMsg} onChange={(e) => setJoinMsg(e.target.value)} placeholder="Tell the owner why you'd be a good fit" rows={2} className="w-full rounded border p-2" />
          <button onClick={join} className="mt-2 rounded bg-indigo-600 px-4 py-2 text-white">Send request</button>
        </section>
      )}

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Team ({project.members.length})</h2>
        <ul className="divide-y">
          {project.members.map((m) => (
            <li key={m.user._id} className="flex items-center justify-between py-2 text-sm">
              <span>
                <b>{m.user.name}</b> <span className="text-gray-500">· {m.role}</span>
              </span>
              {isOwner && m.user._id !== project.owner._id && (
                <button onClick={() => removeMember(m.user._id)} className="text-red-600 hover:underline">Remove</button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {isOwner && (
        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Join requests ({pending.length})</h2>
          {pending.length === 0 && <p className="text-sm text-gray-500">No pending requests.</p>}
          {pending.map((r) => (
            <div key={r.user._id} className="flex flex-wrap items-center justify-between gap-2 border-b py-3 text-sm">
              <div>
                <b>{r.user.name}</b>
                <p className="text-gray-500">{r.message || "No message"}</p>
                <p className="text-xs text-gray-400">Skills: {(r.user.skills || []).join(", ") || "-"}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  placeholder="Role"
                  value={roles[r.user._id] || ""}
                  onChange={(e) => setRoles({ ...roles, [r.user._id]: e.target.value })}
                  className="w-32 rounded border p-1"
                />
                <button onClick={() => respond(r.user._id, "accept")} className="rounded bg-green-600 px-3 py-1 text-white">Accept</button>
                <button onClick={() => respond(r.user._id, "reject")} className="rounded bg-gray-300 px-3 py-1">Reject</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {isMember && (
        <section className="rounded-xl bg-white p-6 shadow">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
            <span className="text-sm text-gray-500">{done} of {tasks.length} done</span>
          </div>
          <form onSubmit={createTask} className="mb-4 grid gap-2 sm:grid-cols-5">
            <input placeholder="Task title" value={task.title} required onChange={(e) => setTask({ ...task, title: e.target.value })} className="rounded border p-2 sm:col-span-2" />
            <select value={task.assignedTo} onChange={(e) => setTask({ ...task, assignedTo: e.target.value })} className="rounded border p-2">
              <option value="">Unassigned</option>
              {project.members.map((m) => (
                <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
              ))}
            </select>
            <select value={task.priority} onChange={(e) => setTask({ ...task, priority: e.target.value })} className="rounded border p-2">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input type="date" value={task.dueDate} onChange={(e) => setTask({ ...task, dueDate: e.target.value })} className="rounded border p-2" />
            <button className="rounded bg-indigo-600 p-2 text-white sm:col-span-5">Add task</button>
          </form>
          {tasks.length === 0 && <p className="text-sm text-gray-500">No tasks yet.</p>}
          <ul className="divide-y">
            {tasks.map((t) => (
              <li key={t._id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <div>
                  <b className={t.status === "done" ? "text-gray-400 line-through" : ""}>{t.title}</b>
                  <p className="text-xs text-gray-500">
                    {t.assignedTo?.name || "Unassigned"} · {t.priority}
                    {t.dueDate ? ` · due ${new Date(t.dueDate).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <select value={t.status} onChange={(e) => updateTask(t._id, e.target.value)} className="rounded border p-1">
                  <option value="todo">To do</option>
                  <option value="in-progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isMember && <Chat projectId={project._id} userId={user._id} />}
    </div>
  );
}