import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send } from "lucide-react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getSocket } from "../../services/socketService";

function ChatProject() {
  const { projectId } = useParams();
  const { token, userData } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const socket = getSocket();
  const containerRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    setIsSubmitting(true);
    socket.emit("message", { text: newMessage, image_url: null });
    setNewMessage("");
    setIsSubmitting(false);
  };

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket || !projectId) return;

    const joinRoom = () => {
      socket.emit("join_room", { project_id: projectId });
    };

    const handleRoomJoined = (data) => {
      console.log("Successfully joined room:", data);
    };

    const handleJoinError = (data) => {
      console.error("Failed to join room:", data.error);
    };

    if (socket.connected) {
      setTimeout(joinRoom, 50);
    }

    socket.on("connect", joinRoom);

    const handleMessage = (data) => setMessages((prev) => [...prev, data]);
    const handleBlocked = (data) => alert(data.error);
    const handleError = (data) => console.error(data.error);

    socket.on("room_joined", handleRoomJoined);
    socket.on("join_error", handleJoinError);
    socket.on("message", handleMessage);
    socket.on("message_blocked", handleBlocked);
    socket.on("message_error", handleError);

    return () => {
      if (socket.connected) {
        socket.emit("leave_room", { project_id: projectId });
      }

      socket.off("connect", joinRoom);
      socket.off("room_joined", handleRoomJoined);
      socket.off("join_error", handleJoinError);
      socket.off("message", handleMessage);
      socket.off("message_blocked", handleBlocked);
      socket.off("message_error", handleError);
    };
  }, [socket, projectId]);

  useEffect(() => {
    if (!projectId || !token) return;

    const fetchMessages = async () => {
      try {
        await axios
          .get(`http://localhost:5000/chats/project/${projectId}/messages/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((result) => {
            setMessages(result.data.messages.rows);
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [projectId, token]);

  return (
    <div className="flex flex-col h-150">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto mb-4 space-y-4 p-2 max-h-150"
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No messages yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Start a conversation about this project.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === userData.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_id === userData.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender_id === userData.id
                      ? "text-blue-200"
                      : "text-gray-500"
                  }`}
                >
                  {new Date(message.time_sent).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting || !newMessage.trim()}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default ChatProject;
