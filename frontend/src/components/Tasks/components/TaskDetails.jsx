import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader2, ArrowLeft, User, Tag, Clock, Send, Info, CheckCircle, Hourglass, Paperclip } from "lucide-react";
import { getTaskByIdApi, requestTaskApi, getClientRequestsApi } from "../api/tasks";

const THEME = "#028090";
const THEME_DARK = "#05668D";

export default function TaskDetails() {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const { userData, isAuthenticated } = useSelector((state) => state.auth);
  const { role_id, userId } = userData || {};

  const [task, setTask] = useState(null);
  const [myRequest, setMyRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState({ message: '', type: '' });

  const isClient = role_id === 2;
  const isOwner = task?.freelancer_id === userId;

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const taskData = await getTaskByIdApi(taskId);
        if (taskData.success) setTask(taskData.task);
        else throw new Error(taskData.message);

        if (isClient) {
          const requestsData = await getClientRequestsApi();
          if (requestsData.success) {
            const existingRequest = requestsData.requests.find(req => String(req.task_id) === String(taskId));
            if (existingRequest) setMyRequest(existingRequest);
          }
        }
      } catch (error) {
        setTask(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [taskId, isClient]);

  const handleRequestTask = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setIsRequesting(true);
    setRequestStatus({ message: '', type: '' });
    try {
      const formData = new FormData();
      formData.append('message', 'I would like to request this task.');
      const data = await requestTaskApi(taskId, formData);
      if (data.success) {
        setRequestStatus({ message: 'Request Sent!', type: 'success' });
        setMyRequest({ status: 'pending' });
      } else { throw new Error(data.message); }
    } catch (error) {
      setRequestStatus({ message: error.message || "Failed to send request.", type: 'error' });
    } finally {
      setIsRequesting(false);
    }
  };

  const renderActionSection = () => {
    if (isOwner) {
      return (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <Info className="mx-auto w-6 h-6 text-blue-500 mb-2" />
          <p className="text-sm font-semibold text-blue-800">This is your task.</p>
        </div>
      );
    }
    if (isClient && myRequest) {
      let statusMessage, StatusIcon, colorClass;
      switch (myRequest.status) {
        case 'pending': statusMessage = "Request is pending approval"; StatusIcon = Hourglass; colorClass = 'amber'; break;
        case 'pending_payment': statusMessage = "Awaiting your payment"; StatusIcon = Hourglass; colorClass = 'amber'; break;
        case 'active': case 'in_review': case 'revision_requested': statusMessage = "Order is in progress"; StatusIcon = Loader2; colorClass = 'blue'; break;
        case 'completed': statusMessage = "Order completed"; StatusIcon = CheckCircle; colorClass = 'green'; break;
        default: statusMessage = `Status: ${myRequest.status.replace('_', ' ')}`; StatusIcon = Info; colorClass = 'slate';
      }
      return (
        <div className={`p-4 bg-${colorClass}-50 border border-${colorClass}-200 rounded-lg text-center`}>
          <StatusIcon className={`mx-auto w-6 h-6 text-${colorClass}-500 mb-2 ${myRequest.status === 'active' ? 'animate-spin' : ''}`} />
          <p className={`text-sm font-semibold text-${colorClass}-800`}>{statusMessage}</p>
          <Link to="/admin/Tasks" className={`mt-2 inline-block text-xs text-${colorClass}-600 hover:underline`}>Go to My Orders</Link>
        </div>
      );
    }
    return (
      <button
        onClick={handleRequestTask}
        disabled={isRequesting || requestStatus.type === 'success'}
        className="w-full h-12 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2 transition disabled:opacity-60"
        style={{ backgroundColor: THEME }}
      >
        {isRequesting ? <Loader2 className="animate-spin" /> : (requestStatus.type === 'success' ? <CheckCircle /> : <Send className="w-5 h-5" />)}
        {isRequesting ? 'Sending...' : (requestStatus.type === 'success' ? 'Requested!' : 'Request This Task')}
      </button>
    );
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-slate-400" /></div>;
  if (!task) return <div className="text-center py-20 text-slate-600">Task not found.</div>;

  return (
    <section className="relative bg-white py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6"><ArrowLeft className="w-4 h-4" /> Back</button>
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: THEME_DARK }}>{task.title}</h1>
          <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <img src={task.freelancer_avatar || `https://ui-avatars.com/api/?name=${task.freelancer_name || 'A'}`} alt={task.freelancer_name} className="w-8 h-8 rounded-full object-cover"/>
              <span>by <span className="font-semibold text-slate-800">{task.freelancer_name}</span></span>
            </div>
            <div className="flex items-center gap-2"><Tag className="w-4 h-4 text-slate-400" /><span className="font-medium text-slate-800">{task.category_name || "General"}</span></div>
          </div>
        </header>
        <div className="grid lg:grid-cols-[1fr,320px] gap-10">
          <div className="prose lg:prose-lg max-w-none">
            <h2>Task Description</h2>
            <p className="whitespace-pre-wrap text-slate-700">{task.description || "No description provided."}</p>
            {task.attachments && task.attachments.length > 0 && (
              <div className="mt-8">
                <h3 className="flex items-center gap-2"><Paperclip className="w-5 h-5" />Attachments</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {task.attachments.map((url, index ) => {
                    const fileName = url.substring(url.lastIndexOf('/') + 1);
                    return <li key={index}><a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{fileName}</a></li>
                  })}
                </ul>
              </div>
            )}
          </div>
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
              <div className="p-6">
                <div className="text-center mb-5"><span className="text-slate-500 text-sm">Fixed Price</span><p className="text-4xl font-black" style={{ color: THEME_DARK }}>${task.price}</p></div>
                <div className="space-y-4">{renderActionSection()}</div>
              </div>
              <div className="bg-slate-50 p-6 border-t border-slate-100 text-sm text-slate-600 space-y-3">
                <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-slate-400" /><span>Delivery in <span className="font-semibold text-slate-800">{task.duration_days || 1} day(s)</span></span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
