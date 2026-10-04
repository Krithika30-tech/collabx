import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../api";

export default function Chat({ projectId, userId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    let active = true;
    api.get(`/projects/${projectId}/messages`)
      .then(({ data }) => {
        if (active) setMessages(data);
      })
      .catch(() => {});

    const socket = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("token") },
    });
    socketRef.current = socket;
    socket.on("connect", () => socket.emit("joinRoom", projectId));
    socket.on("newMessage", (msg) => {
      if (msg.project === projectId) setMessages((prev) => [...prev, msg]);
    });

    return () => {
      active = false;
      socket.disconnect();
    };
  }, [projectId]);

  // Keep the newest message in view
  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean || !socketRef.current) return;
    socketRef.current.emit("sendMessage", { projectId, text: clean });
    setText("");
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">Team Chat</h2>
      <div ref={boxRef} className="mb-3 h-64 space-y-2 overflow-y-auto rounded border bg-gray-50 p-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500">No messages yet. Say hello to your team!</p>
        )}
        {messages.map((m) => {
          const mine = m.sender._id === userId;
          return (
            <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs rounded-lg px-3 py-2 text-sm ${mine ? "bg-indigo-600 text-white" : "bg-white text-gray-800 shadow"}`}>
                {!mine && <p className="text-xs font-semibold text-indigo-600">{m.sender.name}</p>}
                <p>{m.text}</p>
                <p className={`mt-1 text-right text-[10px] ${mine ? "text-indigo-200" : "text-gray-400"}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          maxLength={1000}
          className="flex-1 rounded border p-2"
        />
        <button className="rounded bg-indigo-600 px-4 py-2 text-white">Send</button>
      </form>
    </section>
  );
}