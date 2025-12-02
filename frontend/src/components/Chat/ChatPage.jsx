import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getSocket } from "../../services/socketService";
import { Send, Paperclip, Smile, Users, Briefcase, MessageSquare, ArrowLeft, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_APP_API_URL;

const colorPalette = {
  primary: "#028090",
  accent: "#05668D",
};

const getUserInitials = (name) => {
  if (!name) return "?";
  const parts = name.split(" ").filter(Boolean);
  return parts.length > 0 ? parts.map((n) => n[0]).join("").toUpperCase() : "?";
};

export default function ChatPage() {
  const { chatType: typeFromUrl, chatId: idFromUrl } = useParams();
  const navigate = useNavigate();
  const { token, userData } = useSelector((state) => state.auth);
  const socket = getSocket();

  const [conversations, setConversations] = useState([]);
  const [activeChatDetails, setActiveChatDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  const [isConversationsLoading, setIsConversationsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    setIsConversationsLoading(true);
    axios.get(`${API_BASE}/chat/user-chats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setConversations(res.data.chats || []))
      .catch(err => {
        console.error("Failed to fetch user conversations:", err);
        setError("Could not load conversations.");
      })
      .finally(() => setIsConversationsLoading(false));
  }, [token]);

  useEffect(() => {
    if (!idFromUrl || !typeFromUrl || !token) {
      setActiveChatDetails(null);
      setMessages([]);
      return;
    }

    setIsChatLoading(true);
    setError(null);
    const detailEndpoint = `/${typeFromUrl}s/${idFromUrl}`;
    const messagesEndpoint = `/chat/${typeFromUrl}/${idFromUrl}/messages`;

    Promise.all([
      axios.get(`${API_BASE}${detailEndpoint}`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API_BASE}${messagesEndpoint}`, { headers: { Authorization: `Bearer ${token}` } })
    ]).then(([detailRes, messagesRes]) => {
      setActiveChatDetails(detailRes.data.project || detailRes.data.task);
      setMessages(messagesRes.data.messages || []);
    }).catch(err => {
      console.error("Failed to fetch chat details or messages:", err);
      setError(`Could not load chat for ${typeFromUrl} #${idFromUrl}.`);
    }).finally(() => setIsChatLoading(false));
  }, [idFromUrl, typeFromUrl, token]);

  useEffect(() => {
    if (!socket || !idFromUrl) return;
    const roomData = { [typeFromUrl === 'project' ? 'project_id' : 'task_id']: idFromUrl };
    socket.emit("join_room", roomData);

    const handleNewMessage = ({ message }) => {
      if (String(message.project_id) === idFromUrl || String(message.task_id) === idFromUrl) {
        setMessages(prev => [...prev, message]);
      }
    };
    
    const handleSystemMessage = ({ message }) => alert(message);

    socket.on("chat:new_message", handleNewMessage);
    socket.on("chat:system_message", handleSystemMessage);

    return () => {
      socket.emit("leave_room", roomData);
      socket.off("chat:new_message", handleNewMessage);
      socket.off("chat:system_message", handleSystemMessage);
    };
  }, [socket, idFromUrl, typeFromUrl]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  // ========================= THE FIX IS HERE =========================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !typeFromUrl || !idFromUrl) return;
    
    // Use the dedicated 'isSending' state
    setIsSending(true);
    
    const payload = { content: newMessage, [typeFromUrl === 'project' ? 'project_id' : 'task_id']: idFromUrl };

    try {
      const response = await axios.post(`${API_BASE}/chat/messages`, payload, { headers: { Authorization: `Bearer ${token}` } });
      const sentMessage = response.data.sentMessage;
      
      // Instantly update the UI for the sender
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage("");

    } catch (err) {
      console.error("Failed to send message:", err);
      alert(err.response?.data?.message || "Error: Could not send message.");
    } finally {
      // Reset the 'isSending' state
      setIsSending(false);
    }
  };
  // =================================================================

  const showChatListOnMobile = !idFromUrl;

  return (
    <div className="h-screen bg-gray-100">
      <div className="w-full h-full max-w-6xl mx-auto flex bg-white md:rounded-2xl md:shadow-2xl md:border md:border-gray-200 md:my-4 md:h-[calc(100vh-2rem)] overflow-hidden">
        
        <div className={`w-full md:w-1/3 md:max-w-sm bg-white md:border-r md:border-gray-200 flex-col ${showChatListOnMobile ? 'flex' : 'hidden md:flex'}`}>
          <div className="p-4 border-b border-gray-200"><h2 className="text-xl font-bold text-gray-800">Conversations</h2></div>
          <div className="flex-1 overflow-y-auto">
            {isConversationsLoading ? (
              <div className="p-6 text-center flex items-center justify-center text-gray-500"><Loader2 className="w-5 h-5 mr-2 animate-spin" />Loading...</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {conversations.map((chat) => {
                  const isProject = chat.chat_type === 'project';
                  const isActive = Number(chat.id) === Number(idFromUrl) && chat.chat_type === typeFromUrl;
                  return (
                    <li key={`${chat.chat_type}-${chat.id}`} onClick={() => navigate(`/chat/${chat.chat_type}/${chat.id}`)} className={`p-4 flex items-center space-x-4 cursor-pointer transition-all duration-200 ${isActive ? 'bg-teal-50 md:border-r-4' : 'hover:bg-gray-100'}`} style={isActive ? {borderColor: colorPalette.primary} : {}}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0`} style={{backgroundColor: isProject ? colorPalette.accent : colorPalette.primary}}>{isProject ? <Users className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}</div>
                      <div className="flex-1 overflow-hidden"><p className="font-semibold text-gray-800 truncate">{chat.name}</p><p className="text-sm text-gray-500 capitalize">{chat.chat_type}</p></div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className={`flex-1 flex flex-col relative ${showChatListOnMobile ? 'hidden md:flex' : 'flex'}`}>
          {!idFromUrl ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50"><div className="text-center px-4"><MessageSquare className="mx-auto h-16 w-16 text-gray-300" /><h3 className="mt-4 text-2xl font-semibold text-gray-700">Welcome to Chat</h3><p className="mt-2 text-md text-gray-500">Select a conversation to get started.</p></div></div>
          ) : isChatLoading ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
          ) : error ? (
             <div className="flex-1 flex items-center justify-center bg-gray-50"><p className="text-red-500">{error}</p></div>
          ) : (
            <>
              <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-4 z-10">
                <button onClick={() => navigate('/chat')} className="md:hidden p-2 rounded-full hover:bg-gray-100"><ArrowLeft className="w-6 h-6 text-gray-600" /></button>
                <div><h3 className="font-bold text-gray-800 text-lg">{activeChatDetails?.title}</h3></div>
              </div>
              <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.map((msg, index) => {
                  const isMine = msg.sender_id === userData.id;
                  const showAvatar = !isMine && (index === 0 || messages[index - 1]?.sender_id !== msg.sender_id);
                  const timeText = new Date(msg.time_sent).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={msg.id} className={`flex items-end gap-3 ${isMine ? "justify-end" : "justify-start"}`}>
                      {!isMine && <div className="w-8 h-8 flex-shrink-0">{showAvatar && (msg.sender?.avatar ? <img src={msg.sender.avatar} alt={msg.sender.first_name} className="w-8 h-8 rounded-full object-cover" /> : <div style={{ backgroundColor: colorPalette.accent }} className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold">{getUserInitials(`${msg.sender?.first_name} ${msg.sender?.last_name}`)}</div>)}</div>}
                      <div style={isMine ? { backgroundColor: colorPalette.primary } : {}} className={`max-w-lg px-4 py-3 rounded-2xl ${isMine ? "text-white rounded-br-none" : "bg-gray-200 text-gray-800 rounded-bl-none"}`}>
                        {!isMine && showAvatar && <p style={{ color: colorPalette.accent }} className="text-sm font-bold mb-1">{`${msg.sender?.first_name} ${msg.sender?.last_name}`}</p>}
                        <p className="text-sm" style={{ wordBreak: 'break-word' }}>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-teal-200' : 'text-gray-500'} text-right`}>{timeText}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="sticky bottom-0 bg-white px-4 py-3 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <div className="relative flex-1"><input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="w-full bg-gray-50 border-2 border-gray-300 rounded-full px-5 py-3 pr-24 focus:outline-none transition-colors duration-300" onFocus={(e) => e.target.style.borderColor = colorPalette.primary} onBlur={(e) => e.target.style.borderColor = ''} disabled={isSending} />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2"><button type="button" className="p-2 text-gray-400 hover:text-gray-600"><Paperclip className="w-5 h-5" /></button><button type="button" className="p-2 text-gray-400 hover:text-gray-600"><Smile className="w-5 h-5" /></button></div>
                  </div>
                  <button type="submit" className="text-white p-3 rounded-full disabled:opacity-50 transition-transform hover:scale-110" style={{ backgroundColor: colorPalette.primary }} disabled={!newMessage.trim() || isSending}><Send className="w-5 h-5" /></button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
