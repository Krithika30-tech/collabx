import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { errMsg } from "../utils";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [skill, setSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (q) params.q = q;
      if (category) params.category = category;
      if (status) params.status = status;
      if (skill) params.skill = skill;
      const { data } = await api.get("/projects", { params });
      setProjects(data);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="mx-auto mt-8 max-w-6xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Discover Projects</h1>
        <Link to="/projects/new" className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
          + New Project
        </Link>
      </div>

      <form onSubmit={search} className="mb-6 grid gap-2 rounded-xl bg-white p-4 shadow sm:grid-cols-5">
        <input placeholder="Search title or description" value={q} onChange={(e) => setQ(e.target.value)} className="rounded border p-2 sm:col-span-2" />
        <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="rounded border p-2" />
        <input placeholder="Skill (e.g. React)" value={skill} onChange={(e) => setSkill(e.target.value)} className="rounded border p-2" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border p-2">
          <option value="">Any status</option>
          <option value="open">Open</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        <button className="rounded bg-indigo-600 p-2 font-medium text-white sm:col-span-5">Search</button>
      </form>

      {error && <p className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : projects.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-gray-600 shadow">
          No projects found. Create the first one!
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p._id} to={`/projects/${p._id}`} className="rounded-xl bg-white p-5 shadow transition hover:shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">{p.category}</span>
                <span className="text-xs capitalize text-gray-500">{p.status}</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">{p.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{p.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {p.requiredSkills.map((s) => (
                  <span key={s} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{s}</span>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500">
                By {p.owner?.name} · {p.members.length} member(s)
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}