import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, AtSign, X, ImageIcon, Paperclip, Smile } from "lucide-react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getSocket } from "../../services/socketService";

export default function ChatPage() {
  const { projectId, taskId } = useParams();
  const { token, userData } = useSelector((state) => state.auth);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [locked, setLocked] = useState(false);

  const socket = getSocket();
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const chatType = projectId ? "project" : "task";
  const chatId = projectId || taskId;
  const API_BASE = "https://backend.thi8ah.com";

  /*===== Helpers =====*/

  const sanitize = (txt = "") =>
    String(txt).replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const formatMessage = (text) =>
    sanitize(text)?.replace(
      /@\[([^\]]+)\]\((\d+)\)/g,
      (_, name) =>
        `<span class="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md font-medium mx-0.5">@${sanitize(
          name
        )}</span>`
    );

  const getAvatarColor = (id) => {
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-orange-500"];
    return colors[id % colors.length];
  };

  const getUserInitials = (name) =>
    name
      ? name
          .split(" ")
          .filter(Boolean)
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "?";

  const scrollToBottom = () => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  };

  /*===== Fetch team members (for mentions) — project only =====*/
  useEffect(() => {
    if (!projectId || !token || !API_BASE) return;

    const fetchTeamMembers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const project = res.data?.project || {};

        const assignments = Array.isArray(project.assignments) ? project.assignments : [];
        const freelancers = assignments
          .map((a) => a?.freelancer)
          .filter(Boolean)
          .map((f) => ({
            id: f.id,
            name: `${f.first_name || ""} ${f.last_name || ""}`.trim() || f.username || `User#${f.id}`,
            email: f.email || "",
            avatar: f.avatar || f.profile_pic_url || null,
          }));

        const owner = project.project_owner
          ? {
              id: project.project_owner.id,
              name:
                `${project.project_owner.first_name || ""} ${project.project_owner.last_name || ""}`.trim() ||
                project.project_owner.username ||
                `User#${project.project_owner.id}`,
              email: project.project_owner.email || "",
              avatar: project.project_owner.avatar || project.project_owner.profile_pic_url || null,
            }
          : null;

        const allMembers = [...freelancers, ...(owner ? [owner] : [])];
        const uniq = [];
        const seen = new Set();
        for (const m of allMembers) {
          if (!m?.id || seen.has(m.id)) continue;
          seen.add(m.id);
          uniq.push(m);
        }

        setTeamMembers(uniq);
      } catch (err) {
        console.error("Error fetching team members:", err);
        setTeamMembers([]); 
      }
    };

    fetchTeamMembers();
  }, [projectId, token, API_BASE]);

  /*===== Fetch messages =====*/
  useEffect(() => {
    if (!chatId || !token || !API_BASE) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_BASE}/chat/${chatType}/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const msgs = Array.isArray(res.data?.messages) ? res.data.messages : [];
        setMessages(msgs);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setMessages([]);
      }
    };
    fetchMessages();
  }, [chatId, chatType, token, API_BASE]);

  /*===== Socket setup =====*/
  useEffect(() => {
    if (!socket || !chatId) return;

    const roomData = projectId ? { project_id: projectId } : { task_id: taskId };

    socket.emit("join_room", roomData);
    const onJoined = () => console.log("Joined chat room");
    const onJoinError = (e) => console.error("Join error:", e);
    const onNewMessage = ({ message }) => setMessages((prev) => [...prev, message]);
    const onSystemMessage = ({ message }) => {
      alert(message);
      setLocked(true);
    };

    socket.on("room_joined", onJoined);
    socket.on("join_error", onJoinError);
    socket.on("chat:new_message", onNewMessage);
    socket.on("chat:system_message", onSystemMessage);

    return () => {
      socket.emit("leave_room", roomData);
      socket.off("room_joined", onJoined);
      socket.off("join_error", onJoinError);
      socket.off("chat:new_message", onNewMessage);
      socket.off("chat:system_message", onSystemMessage);
    };
  }, [socket, chatId, projectId, taskId]);
  useEffect(scrollToBottom, [messages]);

  /*===== Mentions UI =====*/
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    const lastAt = value.lastIndexOf("@");
    if (lastAt !== -1) {
      const query = value.substring(lastAt + 1);
      setMentionQuery(query);
      const base = teamMembers;
      const filtered =
        query.length > 0
          ? base.filter(
              (m) =>
                m.name.toLowerCase().includes(query.toLowerCase()) ||
                m.email.toLowerCase().includes(query.toLowerCase())
            )
          : base;
      setFilteredMembers(filtered);
      setShowMentionList(true);
    } else {
      setShowMentionList(false);
    }
  };

  const handleMentionSelect = (member) => {
    const mentionText = `@[${member.name}](${member.id}) `;
    const lastAt = newMessage.lastIndexOf("@");
    if (lastAt !== -1) {
      setNewMessage(newMessage.substring(0, lastAt) + mentionText);
    } else {
      setNewMessage((prev) => prev + mentionText);
    }
    setShowMentionList(false);
    inputRef.current?.focus();
  };

 /*===== Send message =====*/
const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!newMessage.trim() || isSubmitting || locked) return;
  setIsSubmitting(true);

  try {
    const res = await axios.post(
      `${API_BASE}/chat/messages`,
      {
        project_id: projectId || null,
        task_id: taskId || null,
        content: newMessage,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data?.success) {
      const sent = res.data.sentMessage || res.data.message || null;
      if (sent) {
        setMessages((prev) => [...prev, sent]);
        if (socket) socket.emit("chat:new_message", { message: sent });
      }
    } else if (String(res.data?.message || "").toLowerCase().includes("locked")) {
      setLocked(true);
    }
  } catch (err) {
    console.error("Error sending message:", err?.response?.data || err);
  } finally {
    setNewMessage("");
    setIsSubmitting(false);
  }
};
  /*===== UI =====*/
  return (
    <div className="p-6 h-150">
      <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">
                {projectId ? "Project Chat" : "Task Chat"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {locked
                  ? "🚫 This chat is locked due to a violation."
                  : `Chat with your team (${teamMembers.length} members)`}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No messages yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Start a conversation about this {projectId ? "project" : "task"}. Type @ to mention
                team members.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMine = msg.sender_id === userData?.id;
              const sender = msg.sender || {};
              const showAvatar = !isMine && (index === 0 || messages[index - 1].sender_id !== msg.sender_id);

              // Ensure we have a safe time value
              let timeText = "";
              try {
                const dt = msg.time_sent ? new Date(msg.time_sent) : null;
                if (dt && !isNaN(dt)) {
                  timeText = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                }
              } catch {}

              return (
                <div key={msg.id || `${msg.sender_id}-${index}`} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md ${isMine ? "ml-12" : "mr-12"}`}>
                    <div className="flex items-start">
                      {!isMine && showAvatar && (
                        <div className="flex-shrink-0 mr-2">
                          {sender.avatar ? (
                            <img
                              src={sender.avatar}
                              alt={sender.first_name || "User"}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full ${getAvatarColor(
                                msg.sender_id || 0
                              )} text-white flex items-center justify-center text-sm font-medium`}
                            >
                              {getUserInitials(
                                `${sender.first_name || ""} ${sender.last_name || ""}`.trim() ||
                                  sender.username ||
                                  "U"
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isMine
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                        }`}
                      >
                        {!isMine && (
                          <p className="text-sm font-semibold text-gray-700 mb-1">
                            {sender.first_name} {sender.last_name}
                          </p>
                        )}
                        <div
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formatMessage(msg.content || "") }}
                        />
                        {timeText && (
                          <span className={`text-xs ${isMine ? "text-white" : "text-gray-500"} ml-2 block text-right`}>
                            {timeText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        {!locked && (
          <div className="bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg relative">
            {showMentionList && (
              <div className="absolute bottom-full left-6 right-6 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                <div className="p-2 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Mention a team member</span>
                  <button
                    onClick={() => setShowMentionList(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleMentionSelect(member)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center"
                    >
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full mr-3" />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full ${getAvatarColor(
                            member.id
                          )} text-white flex items-center justify-center text-sm font-medium mr-3`}
                        >
                          {getUserInitials(member.name)}
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">No matching members</div>
                )}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Type your message... @mention to tag someone"
                  className="w-full border border-gray-300 rounded-full px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button type="button" className="p-1 text-gray-400 hover:text-gray-600">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1 text-gray-400 hover:text-gray-600">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1 text-gray-400 hover:text-gray-600">
                    <Smile className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center shadow-sm hover:shadow-md transition-all"
                disabled={isSubmitting || !newMessage.trim()}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <AtSign className="w-3 h-3 mr-1" />
              Type @ to mention a team member
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
