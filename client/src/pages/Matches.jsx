import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { errMsg } from "../utils";

const pct = (n) => `${Math.round(n * 100)}%`;

export default function Matches() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const projectId = params.get("projectId") || "";
  const [mine, setMine] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/projects")
      .then(({ data }) => setMine(data.filter((p) => p.owner?._id === user._id)))
      .catch(() => {});
  }, [user._id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api.get("/matches", { params: projectId ? { projectId } : {} })
      .then(({ data }) => {
        if (!cancelled) setResults(data);
      })
      .catch((err) => {
        if (!cancelled) setError(errMsg(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <div className="mx-auto mt-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800">Compatibility Matches</h1>
      <p className="mb-4 text-sm text-gray-500">
        Score = skills (50) + interests (20) + availability (15) + experience (15)
      </p>

      <select
        value={projectId}
        onChange={(e) => setParams(e.target.value ? { projectId: e.target.value } : {})}
        className="mb-6 w-full rounded border bg-white p-2"
      >
        <option value="">Projects recommended for me</option>
        {mine.map((p) => (
          <option key={p._id} value={p._id}>Teammates for: {p.title}</option>
        ))}
      </select>

      {error && <p className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : results.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-gray-600 shadow">
          No matches yet. Add skills to your profile and create or join projects.
        </p>
      ) : (
        <div className="space-y-3">
          {results.map((r) => {
            const item = r.user || r.project;
            return (
              <div key={item._id} className="rounded-xl bg-white p-5 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    {r.project ? (
                      <Link to={`/projects/${item._id}`} className="text-lg font-semibold text-indigo-600 hover:underline">
                        {item.title}
                      </Link>
                    ) : (
                      <span className="text-lg font-semibold text-gray-800">{item.name}</span>
                    )}
                    <p className="text-xs text-gray-500">
                      {r.project
                        ? `${item.category} · needs ${item.requiredSkills.join(", ") || "-"}`
                        : `Skills: ${item.skills.join(", ") || "-"} · ${item.experience}`}
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-indigo-600">{r.score}</span>
                </div>
                <div className="mt-2 h-2 w-full rounded bg-gray-200">
                  <div className="h-2 rounded bg-indigo-600" style={{ width: `${r.score}%` }} />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Skills {pct(r.breakdown.skills)} · Interests {pct(r.breakdown.interests)} · Availability {pct(r.breakdown.availability)} · Experience {pct(r.breakdown.experience)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}