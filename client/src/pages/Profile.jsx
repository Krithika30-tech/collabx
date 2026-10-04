import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { toArray, errMsg } from "../utils";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "", skills: "", interests: "", availability: "", experience: "beginner",
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${user._id}`)
      .then(({ data }) =>
        setForm({
          name: data.name,
          skills: (data.skills || []).join(", "),
          interests: (data.interests || []).join(", "),
          availability: data.availability || "",
          experience: data.experience || "beginner",
        })
      )
      .catch((err) => setError(errMsg(err)))
      .finally(() => setLoading(false));
  }, [user._id]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await api.put(`/users/${user._id}`, {
        name: form.name,
        skills: toArray(form.skills),
        interests: toArray(form.interests),
        availability: form.availability,
        experience: form.experience,
      });
      setMsg("Profile saved");
    } catch (err) {
      setError(errMsg(err));
    }
  };

  if (loading) return <p className="mt-10 text-center text-gray-600">Loading...</p>;

  return (
    <div className="mx-auto mt-10 max-w-xl rounded-xl bg-white p-8 shadow">
      <h1 className="mb-1 text-2xl font-bold text-gray-800">My Profile</h1>
      <p className="mb-6 text-sm text-gray-500">{user.email}</p>
      {msg && <p className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">{msg}</p>}
      {error && <p className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={save} className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Name
          <input name="name" value={form.name} onChange={change} required className="mt-1 w-full rounded border p-2" />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Skills (comma separated)
          <input name="skills" value={form.skills} onChange={change} placeholder="React, Node.js, MongoDB" className="mt-1 w-full rounded border p-2" />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Interests (comma separated)
          <input name="interests" value={form.interests} onChange={change} placeholder="Web development, DevOps" className="mt-1 w-full rounded border p-2" />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Availability
          <select name="availability" value={form.availability} onChange={change} className="mt-1 w-full rounded border p-2">
            <option value="">Not set</option>
            <option value="weekdays">Weekdays</option>
            <option value="weekends">Weekends</option>
            <option value="evenings">Evenings</option>
            <option value="flexible">Flexible</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Experience
          <select name="experience" value={form.experience} onChange={change} className="mt-1 w-full rounded border p-2">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <button className="w-full rounded bg-indigo-600 p-2 font-medium text-white">Save profile</button>
      </form>
    </div>
  );
}