import { useEffect, useState } from "react";
import api from "../api";
import { errMsg } from "../utils";

export default function People() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const params = {};
      if (q) params.q = q;
      if (skill) params.skill = skill;
      if (experience) params.experience = experience;
      if (availability) params.availability = availability;
      const { data } = await api.get("/users", { params });
      setUsers(data);
    } catch (err) {
      setError(errMsg(err));
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
    <div className="mx-auto mt-8 max-w-5xl">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Find Collaborators</h1>
      <form onSubmit={search} className="mb-6 grid gap-2 rounded-xl bg-white p-4 shadow sm:grid-cols-4">
        <input placeholder="Name" value={q} onChange={(e) => setQ(e.target.value)} className="rounded border p-2" />
        <input placeholder="Skill (e.g. React)" value={skill} onChange={(e) => setSkill(e.target.value)} className="rounded border p-2" />
        <select value={experience} onChange={(e) => setExperience(e.target.value)} className="rounded border p-2">
          <option value="">Any experience</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <input placeholder="Availability (e.g. weekends)" value={availability} onChange={(e) => setAvailability(e.target.value)} className="rounded border p-2" />
        <button className="rounded bg-indigo-600 p-2 font-medium text-white sm:col-span-4">Search</button>
      </form>
      {error && <p className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</p>}
      {users.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-gray-600 shadow">No students found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <div key={u._id} className="rounded-xl bg-white p-5 shadow">
              <h2 className="font-semibold text-gray-800">{u.name}</h2>
              <p className="text-xs capitalize text-gray-500">{u.experience} · {u.availability || "availability not set"}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {u.skills.map((s) => (
                  <span key={s} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{s}</span>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">Interests: {u.interests.join(", ") || "-"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}