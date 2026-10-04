import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-md rounded-xl bg-white p-8 shadow">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Create your account</h1>
      {error && <p className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Full name" value={name} required
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border p-2"
        />
        <input
          type="email" placeholder="Email" value={email} required
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border p-2"
        />
        <input
          type="password" placeholder="Password (min 6 characters)" value={password}
          required minLength={6}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border p-2"
        />
        <button
          disabled={loading}
          className="w-full rounded bg-indigo-600 p-2 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Already registered? <Link to="/login" className="text-indigo-600 underline">Login</Link>
      </p>
    </div>
  );
}