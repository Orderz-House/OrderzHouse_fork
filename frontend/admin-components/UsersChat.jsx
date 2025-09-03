import React, { useEffect, useState } from "react";
import { ApiClient } from "adminjs";

const api = new ApiClient();

export default function UsersChat({ record }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const projectId = record?.params?.id; 

  useEffect(() => {
    if (!projectId) return;

    api.get(`/chats/project/${projectId}/messages`)
      .then((res) => {
        setMessages(res.data.messages || []);
      })
      .catch((err) => {
        console.error("Error fetching messages:", err);
        setMessages([]);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <p>Loading chats...</p>;
  if (!messages.length) return <p>No messages found.</p>;

  return (
    <div className="p-4 space-y-3">
      {messages.map((msg) => (
        <div key={msg.id} className="flex gap-3 items-start border-b pb-2">
          <img
            src={msg.sender.sender_avatar || "https://placehold.co/40"}
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">
              {msg.sender.first_name} {msg.sender.last_name} ({msg.sender.username})
            </p>
            <p className="text-sm">{msg.content}</p>
            <span className="text-xs text-gray-400">
              {new Date(msg.time_sent).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
