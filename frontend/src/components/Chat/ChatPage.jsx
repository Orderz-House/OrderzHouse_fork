import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { fetchMessages, sendMessage } from "./api/chatApi";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Lock, MessageSquare, Loader2 } from "lucide-react";

export default function ChatPage() {
  const { projectId, taskId } = useParams();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.userData);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    const roomData = projectId ? { project_id: projectId } : { task_id: taskId };
    socket.emit("join_room", roomData);

    socket.on("room_joined", () => console.log("Joined room successfully"));
    socket.on("join_error", (err) => console.error("Join error:", err));

    socket.on("chat:new_message", ({ message }) => {
      setMessages((prev) => [...prev, message]);

      if (message.sender_id !== user.id) {
        toast.custom(
          <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-3 flex items-center gap-3 max-w-sm">
            <MessageSquare className="text-[#028090] w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-800 text-sm">New Message</p>
              <p className="text-xs text-gray-600 truncate max-w-[200px]">
                {message.content}
              </p>
            </div>
          </div>,
          { duration: 4000 }
        );

        // Optional: play notification sound
        // new Audio("/sounds/message-tone.mp3").play();
      }
    });

    socket.on("chat:system_message", ({ message }) => {
      setLocked(true);
      toast.error("⚠️ Chat locked due to system rules", {
        style: {
          background: "#ffecec",
          color: "#b91c1c",
          border: "1px solid #fecaca",
        },
      });
    });

    socket.on("chat:typing", ({ userId }) => {
      if (userId !== user.id) {
        setTypingUser(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2000);
      }
    });

    return () => {
      socket.emit("leave_room", roomData);
      socket.disconnect();
    };
  }, [projectId, taskId, token, user.id]);

  // 📥 Load messages
  useEffect(() => {
    if (token) loadMessages();
  }, [token, projectId, taskId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await fetchMessages(token, { projectId, taskId });
      setMessages(data || []);
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✉️ Send message
  const handleSend = async (content) => {
    if (!content.trim() || sending || locked) return;
    setSending(true);
    try {
      const data = {
        project_id: projectId || null,
        task_id: taskId || null,
        receiver_id: messages.find((m) => m.sender_id !== user.id)?.sender_id,
        content,
      };

      const res = await sendMessage(token, data);

      if (res.success && res.sentMessage) {
        setMessages((prev) => [...prev, res.sentMessage]);
        socketRef.current?.emit("chat:new_message", { message: res.sentMessage });
      } else if (res.message?.toLowerCase().includes("locked")) {
        setLocked(true);
      }
    } catch (err) {
      if (err.response?.status === 403) setLocked(true);
      else console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  // ✍️ Typing indicator
  const handleTyping = () => {
    socketRef.current?.emit("chat:typing", { userId: user.id });
  };

  // ⏬ Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🚫 Locked chat screen
  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center border-t-4 border-red-500">
          <Lock className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chat Locked</h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            This chat has been locked due to a violation of OrderzHouse Community Standards.
          </p>
          <p className="text-sm text-gray-500">
            Your contract has been automatically terminated for attempting to share external
            contact information. Please contact OrderzHouse support for further assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-[#028090]" />
          <h2 className="text-lg sm:text-xl font-semibold text-[#05668D]">
            {projectId ? "Project Chat" : "Task Chat"}
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-[#028090] w-8 h-8" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <MessageSquare className="w-10 h-10 text-gray-400 mb-3" />
            <p>No messages yet</p>
            <p className="text-sm text-gray-400">Start the conversation below</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} currentUser={user} />
            ))}
            {typingUser && (
              <p className="text-sm text-gray-400 italic ml-4 mb-3 animate-pulse">
                Typing...
              </p>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} onTyping={handleTyping} disabled={locked || sending} />
    </div>
  );
}
