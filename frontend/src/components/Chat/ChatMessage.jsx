export default function ChatMessage({ message, currentUser }) {
  const isMine = message.sender_id === currentUser?.id;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3 px-2 sm:px-4`}>
      <div
        className={`relative max-w-[80%] sm:max-w-[70%] p-3 sm:p-4 rounded-2xl shadow-md transition-all 
          ${isMine ? "bg-[#028090] text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"}`}
      >
        <p className="whitespace-pre-wrap break-words text-[14px] sm:text-[15px] leading-relaxed">
          {message.content}
        </p>

        <p
          className={`text-[11px] sm:text-[12px] mt-1 ${
            isMine ? "text-blue-100" : "text-gray-500"
          } text-right`}
        >
          {new Date(message.time_sent).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
