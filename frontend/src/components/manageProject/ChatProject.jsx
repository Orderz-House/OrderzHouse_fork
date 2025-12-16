// import { useState, useEffect, useRef } from "react";
// import { MessageSquare, Send, X, ImageIcon, Paperclip, Smile, AtSign } from "lucide-react";
// import { useSelector } from "react-redux";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import { getSocket } from "../../services/socketService";

// function ChatProject() {
//   const { projectId } = useParams();
//   const { token, userData } = useSelector((state) => state.auth);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [teamMembers, setTeamMembers] = useState([]);
//   const [showMentionList, setShowMentionList] = useState(false);
//   const [mentionQuery, setMentionQuery] = useState("");
//   const [filteredMembers, setFilteredMembers] = useState([]);
//   const socket = getSocket();
//   const containerRef = useRef(null);
//   const inputRef = useRef(null);
//   const API_BASE = import.meta.env.VITE_APP_API_URL;

//   useEffect(() => {
//     if (!projectId || !token) return;
//     const fetchTeamMembers = async () => {
//       try {
//         const response = await axios.get(`${API_BASE}/projects/${projectId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const assignments = response.data.project.rows[0]?.assignments || [];
//         const members = assignments.map((assignment) => ({
//           id: assignment.freelancer.id,
//           name: `${assignment.freelancer.first_name} ${assignment.freelancer.last_name}`,
//           email: assignment.freelancer.email,
//           status: assignment.status,
//           avatar: assignment.freelancer.avatar || null,
//         }));
//         setTeamMembers(members);
//       } catch (err) {
//         console.error("Error fetching team members:", err);
//       }
//     };
//     fetchTeamMembers();
//   }, [projectId, token, API_BASE]);

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if (!newMessage.trim() || !socket) return;
//     setIsSubmitting(true);
//     const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
//     let match;
//     const mentions = [];
//     while ((match = mentionRegex.exec(newMessage)) !== null) {
//       mentions.push({ name: match[1], id: match[2] });
//     }
//     socket.emit("message", {
//       text: newMessage,
//       image_url: null,
//       mentions: mentions.length > 0 ? mentions : undefined,
//     });
//     setNewMessage("");
//     setIsSubmitting(false);
//     setShowMentionList(false);
//   };

//   const handleInputChange = (e) => {
//     const value = e.target.value;
//     setNewMessage(value);
//     const lastAtPos = value.lastIndexOf("@");
//     if (lastAtPos !== -1) {
//       const query = value.substring(lastAtPos + 1);
//       setMentionQuery(query);
//       if (query.length > 0) {
//         const filtered = teamMembers.filter(
//           (member) =>
//             member.name.toLowerCase().includes(query.toLowerCase()) ||
//             member.email.toLowerCase().includes(query.toLowerCase())
//         );
//         setFilteredMembers(filtered);
//         setShowMentionList(true);
//       } else {
//         setFilteredMembers(teamMembers);
//         setShowMentionList(true);
//       }
//     } else {
//       setShowMentionList(false);
//     }
//   };

//   const handleMentionSelect = (member) => {
//     const mentionText = `@[${member.name}](${member.id})`;
//     const lastAtPos = newMessage.lastIndexOf("@");
//     if (lastAtPos !== -1) {
//       const beforeAt = newMessage.substring(0, lastAtPos);
//       const afterAt = newMessage.substring(lastAtPos);
//       const afterQuery = afterAt.substring(afterAt.indexOf(" ") !== -1 ? afterAt.indexOf(" ") : afterAt.length);
//       setNewMessage(beforeAt + mentionText + afterQuery + " ");
//     } else {
//       setNewMessage((prev) => prev + mentionText + " ");
//     }
//     setShowMentionList(false);
//     inputRef.current?.focus();
//   };

//   const scrollToBottom = () => {
//     if (containerRef.current) {
//       containerRef.current.scrollTop = containerRef.current.scrollHeight;
//     }
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     if (!socket || !projectId) return;
//     const joinRoom = () => {
//       socket.emit("join_room", { project_id: projectId });
//     };
//     const handleRoomJoined = (data) => {
//       console.log("Successfully joined room:", data);
//     };
//     const handleJoinError = (data) => {
//       console.error("Failed to join room:", data.error);
//     };
//     if (socket.connected) {
//       setTimeout(joinRoom, 50);
//     }
//     socket.on("connect", joinRoom);
//     const handleMessage = (data) => setMessages((prev) => [...prev, data]);
//     const handleBlocked = (data) => alert(data.error);
//     const handleError = (data) => console.log(data.error);
//     socket.on("room_joined", handleRoomJoined);
//     socket.on("join_error", handleJoinError);
//     socket.on("message", handleMessage);
//     socket.on("message_blocked", handleBlocked);
//     socket.on("message_error", handleError);
//     return () => {
//       if (socket.connected) {
//         socket.emit("leave_room", { project_id: projectId });
//       }
//       socket.off("connect", joinRoom);
//       socket.off("room_joined", handleRoomJoined);
//       socket.off("join_error", handleJoinError);
//       socket.off("message", handleMessage);
//       socket.off("message_blocked", handleBlocked);
//       socket.off("message_error", handleError);
//     };
//   }, [socket, projectId]);

//   useEffect(() => {
//     if (!projectId || !token) return;
//     const fetchMessages = async () => {
//       try {
//         const response = await axios.get(`${API_BASE}/chats/project/${projectId}/messages/`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const enhancedMessages = response.data.messages.rows.map((msg) => ({
//           ...msg,
//           sender_name: msg.sender_name || `User ${msg.sender_id}`,
//           sender_avatar: msg.sender_avatar || null,
//         }));
//         setMessages(enhancedMessages);
//       } catch (err) {
//         console.error("Error fetching messages:", err);
//       }
//     };
//     fetchMessages();
//   }, [projectId, token, API_BASE]);

//   const formatMessage = (text) => {
//     if (!text) return "";
//     return text.replace(/@\[([^\]]+)\]\(([^)]+)\)/g, (match, name) => {
//       return `<span class="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md font-medium mx-0.5">@${name}</span>`;
//     });
//   };

//   const getAvatarColor = (userId) => {
//     const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-teal-500"];
//     return colors[userId % colors.length];
//   };

//   return (
//     <div className="p-6 h-150">
//       <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm">
//         <div className="bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="font-semibold text-gray-800 text-lg">Project Chat</h3>
//               <p className="text-sm text-gray-500 mt-1">
//                 Chat with your team members {teamMembers.length > 0 && `(${teamMembers.length} members)`}
//               </p>
//             </div>
//             <div className="flex items-center space-x-2">
//               <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                   />
//                 </svg>
//               </button>
//               <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//                   />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>

//         <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
//           {messages.length === 0 ? (
//             <div className="text-center py-16">
//               <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
//                 <MessageSquare className="w-8 h-8 text-blue-600" />
//               </div>
//               <h3 className="text-lg font-medium text-gray-600 mb-2">No messages yet</h3>
//               <p className="text-gray-500 max-w-md mx-auto">
//                 Start a conversation about this project. Type @ to mention team members.
//               </p>
//             </div>
//           ) : (
//             messages.map((message, index) => {
//               const isCurrentUser = message.sender_id === userData.id;
//               const showAvatar =
//                 !isCurrentUser &&
//                 (index === 0 || messages[index - 1].sender_id !== message.sender_id);
//               const showHeader =
//                 !isCurrentUser &&
//                 (index === 0 ||
//                   messages[index - 1].sender_id !== message.sender_id ||
//                   new Date(message.time_sent).getTime() -
//                     new Date(messages[index - 1].time_sent).getTime() >
//                     300000);
//               return (
//                 <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
//                   <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? "ml-12" : "mr-12"}`}>
//                     <div className="flex items-start">
//                       {!isCurrentUser && showAvatar && (
//                         <div className="flex-shrink-0 mr-2">
//                           {message.sender.sender_avatar ? (
//                             <img
//                               src={message.sender.sender_avatar}
//                               alt={message.sender.first_name}
//                               className="w-10 h-10 rounded-full"
//                             />
//                           ) : (
//                             <div
//                               className={`w-6 h-6 rounded-full ${getAvatarColor(
//                                 message.sender_id
//                               )} text-white flex items-center justify-center text-xs font-medium`}
//                             >
//                               {message.sender.first_name?.[0]?.toUpperCase()}
//                             </div>
//                           )}
//                         </div>
//                       )}
//                       <div
//                         className={`px-4 py-2 rounded-2xl ${
//                           isCurrentUser
//                             ? "bg-blue-600 text-white rounded-br-md"
//                             : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
//                         } ${!isCurrentUser && !showAvatar ? "ml-8" : ""}`}
//                       >
//                         {showHeader && (
//                           <div className="flex items-center mb-2">
//                             <span className="text-sm font-medium text-gray-700">
//                               {message.sender.first_name} {message.sender.last_name}
//                             </span>
//                           </div>
//                         )}
//                         <div
//                           className="text-sm leading-relaxed"
//                           dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
//                         />
//                         <span
//                           className={`text-xs ${isCurrentUser ? "text-white" : "text-gray-500"} ml-2`}
//                         >
//                           {new Date(message.time_sent).toLocaleTimeString([], {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>

//         <div className="bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg relative">
//           {showMentionList && (
//             <div className="absolute bottom-full left-6 right-6 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
//               <div className="p-2 border-b border-gray-200 flex items-center justify-between">
//                 <span className="text-xs font-medium text-gray-600">Mention a team member</span>
//                 <button
//                   onClick={() => setShowMentionList(false)}
//                   className="text-gray-400 hover:text-gray-600 p-1"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               </div>
//               {filteredMembers.length > 0 ? (
//                 filteredMembers.map((member) => (
//                   <button
//                     key={member.id}
//                     onClick={() => handleMentionSelect(member)}
//                     className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center"
//                   >
//                     {member.avatar ? (
//                       <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full mr-3" />
//                     ) : (
//                       <div
//                         className={`w-8 h-8 rounded-full ${getAvatarColor(
//                           member.id
//                         )} text-white flex items-center justify-center text-sm font-medium mr-3`}
//                       >
//                         {member.name[0]}
//                       </div>
//                     )}
//                     <div>
//                       <div className="text-sm font-medium text-gray-900">{member.name}</div>
//                     </div>
//                   </button>
//                 ))
//               ) : (
//                 <div className="px-3 py-2 text-sm text-gray-500">No matching team members</div>
//               )}
//             </div>
//           )}
//           <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
//             <div className="relative flex-1">
//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={newMessage}
//                 onChange={handleInputChange}
//                 placeholder="Type your message... @mention to tag someone"
//                 className="w-full border border-gray-300 rounded-full px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 disabled={isSubmitting}
//               />
//               <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
//                 <button type="button" className="p-1 text-gray-400 hover:text-gray-600">
//                   <Paperclip className="w-4 h-4" />
//                 </button>
//                 <button type="button" className="p-1 text-gray-400 hover:text-gray-600">
//                   <ImageIcon className="w-4 h-4" />
//                 </button>
//                 <button type="button" className="p-1 text-gray-400 hover:text-gray-600">
//                   <Smile className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//             <button
//               type="submit"
//               className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center shadow-sm hover:shadow-md transition-all"
//               disabled={isSubmitting || !newMessage.trim()}
//             >
//               {isSubmitting ? (
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//               ) : (
//                 <Send className="w-5 h-5" />
//               )}
//             </button>
//           </form>
//           <div className="mt-2 text-xs text-gray-500 flex items-center">
//             <AtSign className="w-3 h-3 mr-1" />
//             Type @ to mention a team member
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ChatProject;
