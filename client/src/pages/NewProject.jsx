import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { toArray, errMsg } from "../utils";

export default function NewProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", category: "", requiredSkills: "", requiredRoles: "",
    technologies: "", availability: "any", experienceLevel: "any",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/projects", {
        title: form.title,
        description: form.description,
        category: form.category || "General",
        requiredSkills: toArray(form.requiredSkills),
        requiredRoles: toArray(form.requiredRoles),
        technologies: toArray(form.technologies),
        availability: form.availability,
        experienceLevel: form.experienceLevel,
      });
      navigate(`/projects/${data._id}`);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-xl rounded-xl bg-white p-8 shadow">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Create a Project</h1>
      {error && <p className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <input name="title" placeholder="Project title" value={form.title} onChange={change} required className="w-full rounded border p-2" />
        <textarea name="description" placeholder="Describe your project idea" value={form.description} onChange={change} required rows={4} className="w-full rounded border p-2" />
        <input name="category" placeholder="Category (e.g. Web Development)" value={form.category} onChange={change} className="w-full rounded border p-2" />
        <input name="requiredSkills" placeholder="Required skills (comma separated)" value={form.requiredSkills} onChange={change} className="w-full rounded border p-2" />
        <input name="requiredRoles" placeholder="Required roles (comma separated)" value={form.requiredRoles} onChange={change} className="w-full rounded border p-2" />
        <input name="technologies" placeholder="Technologies (comma separated)" value={form.technologies} onChange={change} className="w-full rounded border p-2" />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-gray-700">
            Availability
            <select name="availability" value={form.availability} onChange={change} className="mt-1 w-full rounded border p-2">
              <option value="any">Any</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekends">Weekends</option>
              <option value="evenings">Evenings</option>
              <option value="flexible">Flexible</option>
            </select>
          </label>
          <label className="text-sm text-gray-700">
            Experience level
            <select name="experienceLevel" value={form.experienceLevel} onChange={change} className="mt-1 w-full rounded border p-2">
              <option value="any">Any</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
        </div>
        <button disabled={loading} className="w-full rounded bg-indigo-600 p-2 font-medium text-white disabled:opacity-50">
          {loading ? "Creating..." : "Create project"}
        </button>
      </form>
    </div>
  );
}