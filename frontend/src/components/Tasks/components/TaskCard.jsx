import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import { requestTaskApi } from "../api/tasks";
import { Loader2, Send } from "lucide-react";

export default function TaskCard({ task }) {
  const { id, title, price, freelancer_name, freelancer_avatar, category_name } = task;
  const to = `/tasks/${id}`;
  const themeColor = "#028090";

  const { userData } = useSelector((state) => state.auth);
  const isClient = userData?.role_id === 2;

  const [isRequesting, setIsRequesting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleRequest = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRequesting(true);
    setStatus({ type: '', message: '' });
    try {
      const formData = new FormData();
      formData.append('message', 'I would like to request this task.');
      const data = await requestTaskApi(id, formData);
      if (data.success) {
        setStatus({ type: 'success', message: 'Requested!' });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Already requested or failed.' });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <article className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      <Link to={to} state={{ task }} className="block p-5 flex-grow">
        <div className="flex items-start gap-4">
          <img src={freelancer_avatar || `https://ui-avatars.com/api/?name=${freelancer_name || 'A'}&background=random`} alt={freelancer_name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" />
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 text-md leading-tight group-hover:text-[#028090] transition-colors">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">by {freelancer_name || "Anonymous"}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{category_name || "General"}</span>
          <span className="text-lg font-black" style={{ color: themeColor }}>${price ?? "0.00"}</span>
        </div>
      </Link>
      {isClient && (
        <div className="px-5 pb-5 pt-2">
          <button
            onClick={handleRequest}
            disabled={isRequesting || status.type === 'success'}
            className="w-full h-10 flex items-center justify-center gap-2 rounded-lg text-white font-semibold text-sm transition disabled:opacity-60"
            style={{ backgroundColor: themeColor }}
          >
            {isRequesting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
            {isRequesting ? 'Sending...' : (status.type === 'success' ? 'Requested' : 'Request Task' )}
          </button>
          {status.type === 'error' && <p className="text-xs text-red-500 text-center mt-1.5">{status.message}</p>}
        </div>
      )}
    </article>
  );
}
