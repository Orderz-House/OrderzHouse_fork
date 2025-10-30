import { useState } from "react";
import { Smile, Send } from "lucide-react";

export default function ChatInput({ onSend }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <div className="w-full bg-white border-t border-gray-200 p-3 sm:p-4 flex items-center space-x-2">
      <button className="p-2 text-gray-500 hover:text-[#028090] transition">
        <Smile className="h-5 w-5" />
      </button>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        className="flex-1 px-4 py-2 bg-gray-50 rounded-full border border-gray-300 
                   focus:outline-none focus:ring-2 focus:ring-[#028090] text-sm sm:text-base"
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />

      <button
        onClick={handleSend}
        className="px-4 py-2 bg-[#028090] text-white font-medium rounded-full 
                   hover:bg-[#026c7a] transition-colors text-sm sm:text-base"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
}
