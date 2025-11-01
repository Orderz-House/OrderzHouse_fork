import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Info,
  CreditCard,
  UserCheck,
  FileText,
  LogOut,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function CompletionProject({ project }) {
  const { projectId } = useParams();
  const { token, userData } = useSelector((state) => state.auth);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [completionHistory, setCompletionHistory] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [history, setHistory] = useState([]);
  const [isReleasingPayment, setIsReleasingPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuitting, setIsQuitting] = useState(false);
  const [showRequestChanges, setShowRequestChanges] = useState(false);
  const [changesRequest, setChangesRequest] = useState("");
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const navigate = useNavigate();
  const fetchCompletion = async () => {
    try {
      const response = await axios.get(
        `https://backend.thi8ah.com/projects/${projectId}/completion`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFreelancers(response.data.freelancers || []);
      setHistory(response.data.history || []);
    } catch (error) {
      console.error("Error fetching completion data:", error);
    }
  };

  useEffect(() => {
    fetchCompletion();
  }, []);

  const handleWorkCompletion = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `https://backend.thi8ah.com/projects/${projectId}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setCompletionStatus("pending_review");
        setCompletionHistory((prev) => [
          ...prev,
          {
            event: "completion_requested",
            timestamp: new Date().toISOString(),
            actor: userData.id,
            actor_name: `${userData.first_name} ${userData.last_name}`,
          },
        ]);
        setShowCompletionModal(false);
      }
    } catch (error) {
      console.error("Error submitting completion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuitProject = async () => {
    try {
      setIsQuitting(true);
      const response = await axios.post(
        `https://backend.thi8ah.com/projects/${projectId}/quit`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setCompletionHistory((prev) => [
          ...prev,
          {
            event: "freelancer_quit",
            timestamp: new Date().toISOString(),
            actor: userData.id,
            actor_name: `${userData.first_name} ${userData.last_name}`,
          },
        ]);
        setShowQuitModal(false);
        navigate(-1) 
      }
    } catch (error) {
      console.error("Error quitting project:", error);
    } finally {
      setIsQuitting(false);
    }
  };

  const handleReleasePayment = async (freelancerId) => {
    try {
      setIsReleasingPayment(true);
      const updatedAssignments = project.assignments.map(assignment => {
        if (assignment.freelancer.id === freelancerId) {
          return {
            ...assignment,
            completion_status: "approved"
          };
        }
        return assignment;
      });
      
      project.assignments = updatedAssignments;
      
      await axios.post(
        `https://backend.thi8ah.com/projects/${projectId}/release-payment/${freelancerId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCompletionHistory((prev) => [
        ...prev,
        {
          event: "payment_released",
          timestamp: new Date().toISOString(),
          actor: userData.id,
          actor_name: `${userData.first_name} ${userData.last_name}`,
          freelancer_id: freelancerId
        },
      ]);
    } catch (error) {
      console.error("Error releasing payment:", error);
      fetchCompletion();
    } finally {
      setIsReleasingPayment(false);
    }
  };

  const handleRequestChanges = async (freelancerId) => {
    try {
      const updatedAssignments = project.assignments.map(assignment => {
        if (assignment.freelancer.id === freelancerId) {
          return {
            ...assignment,
            completion_status: "rejected"
          };
        }
        return assignment;
      });
      
      project.assignments = updatedAssignments;
      
      await axios.post(
        `https://backend.thi8ah.com/projects/${projectId}/request-changes/${freelancerId}`,
        { changes_request: changesRequest },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCompletionHistory((prev) => [
        ...prev,
        {
          event: "changes_requested",
          timestamp: new Date().toISOString(),
          actor: userData.id,
          actor_name: `${userData.first_name} ${userData.last_name}`,
          freelancer_id: freelancerId,
          changes_request: changesRequest
        },
      ]);
      
      setShowRequestChanges(false);
      setChangesRequest("");
    } catch (error) {
      console.error("Error requesting changes:", error);
      fetchCompletion();
    }
  };

  const openRequestChangesModal = (freelancerId) => {
    setSelectedFreelancer(freelancerId);
    setShowRequestChanges(true);
  };

  const isProjectOwner = userData.id === project.user_id;
  const isAssignedFreelancer = project.assignments?.some(
    assignment => assignment.freelancer.id === userData.id && assignment.status === "active"
  );
  const hasQuit = project.assignments?.some(
    assignment => assignment.freelancer.id === userData.id && assignment.status === "quit"
  );

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex">
          <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800 mb-1">Work Completion Process</h3>
            <p className="text-sm text-blue-700">
              Once work is completed, freelancers can mark it as finished. Clients will then review and release payment if satisfied.
              Funds are securely held in escrow until completion.
            </p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {completionStatus && (
        <div className={`rounded-xl p-4 ${
          completionStatus === "pending_review" ? "bg-yellow-50 border border-yellow-200" :
          completionStatus === "completed" ? "bg-green-50 border border-green-200" :
          "bg-blue-50 border border-blue-200"
        }`}>
          <div className="flex items-center">
            <div className={`rounded-full p-2 mr-3 ${
              completionStatus === "pending_review" ? "bg-yellow-100 text-yellow-600" :
              completionStatus === "completed" ? "bg-green-100 text-green-600" :
              "bg-blue-100 text-blue-600"
            }`}>
              {completionStatus === "pending_review" ? <AlertCircle size={20} /> :
              completionStatus === "completed" ? <CheckCircle size={20} /> :
              <Clock size={20} />}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {completionStatus === "pending_review" ? "Pending Client Review" :
                completionStatus === "completed" ? "Project Completed" :
                "Work In Progress"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {completionStatus === "pending_review" ? 
                  "The freelancer has marked this project as complete. Please review the work and release payment." :
                completionStatus === "completed" ? 
                  "This project has been successfully completed and payment has been released to the freelancer." :
                  "This project is currently in progress."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* For Freelancers */}
      {isAssignedFreelancer && project.status === 'available' && completionStatus !== "completed" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            Project Actions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mark Completed Card */}
            <div className="border border-gray-200 rounded-lg p-5 bg-white">
              <div className="flex items-center mb-3">
                <div className="rounded-full bg-green-100 p-2 mr-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900">Complete Your Work</h4>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Mark this project as complete when you've finished all deliverables. The client will review your work and release payment.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-green-700">
                  <span className="font-medium">Note:</span> Ensure all project requirements are met before submitting.
                </p>
              </div>
              
              {completionStatus === "pending_review" ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center text-blue-700">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">Awaiting client review</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCompletionModal(true)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Complete
                </button>
              )}
            </div>

            {/* Quit Project Card */}
            <div className="border border-gray-200 rounded-lg p-5 bg-white">
              <div className="flex items-center mb-3">
                <div className="rounded-full bg-red-100 p-2 mr-3">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <h4 className="font-medium text-gray-900">Withdraw from Project</h4>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Withdraw from this project if you're unable to complete it. This may affect your reputation score.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-red-700">
                  <span className="font-medium">Warning:</span> Withdrawing from projects may harm your account reputation.
                </p>
              </div>
              
              <button
                onClick={() => setShowQuitModal(true)}
                className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Withdraw from Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* For Clients */}
      {isProjectOwner && project.status === 'available' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            Payment Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-800 mb-1">Project Budget</div>
              <div className="text-2xl font-bold text-blue-900">${project.budget_min} - ${project.budget_max}</div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-sm font-medium text-amber-800 mb-1">In Escrow</div>
              <div className="text-2xl font-bold text-amber-900">${project.in_escrow}</div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-800 mb-1">To Be Released</div>
              <div className="text-2xl font-bold text-gray-900">${project.to_be_released}</div>
            </div>
          </div>

          {project.assignments && project.assignments.length > 0 ? (
            <div className="space-y-6">
              {project.assignments.map((a) => (
                <div key={a.freelancer.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{a.freelancer.first_name} {a.freelancer.last_name}</p>
                        <p className="text-sm text-gray-500">{a.freelancer.email}</p>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-700">${a.freelancer.amount_in_escrow}</div>
                  </div>

                  {a.completion_status === "pending_review" ? (
                    <div className="space-y-3">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-700 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Pending your review. Auto-release in 7 days.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleReleasePayment(a.freelancer.id)}
                          disabled={isReleasingPayment}
                          className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center font-medium"
                        >
                          {isReleasingPayment ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Approve & Release
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => openRequestChangesModal(a.freelancer.id)}
                          className="flex-1 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
                        >
                          Request Changes
                        </button>
                      </div>
                    </div>
                  ) : a.completion_status === "approved" ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-800">Payment released successfully</span>
                    </div>
                  ) : a.completion_status === "rejected" ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-red-800">Changes requested</span>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                      <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-gray-600 text-sm">Waiting for submission</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No freelancers assigned yet.</p>
          )}
        </div>
      )}

      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Work Completion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to mark this project as complete? This will notify the client and request payment release.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-700">
                  Please ensure all work has been delivered and approved by the client before submitting.
                </p>
              </div>
            </div>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleWorkCompletion}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm Completion
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quit Project Confirmation Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-red-100 p-2 mr-3">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Withdrawal</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to withdraw from this project?
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">Important Notice</h4>
                  <p className="text-sm text-red-700">
                    Withdrawing from projects may harm your account reputation and affect future project opportunities.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowQuitModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isQuitting}
              >
                Cancel
              </button>
              <button
                onClick={handleQuitProject}
                disabled={isQuitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center font-medium"
              >
                {isQuitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <LogOut className="w-5 h-5 mr-2" />
                    Yes, Withdraw
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Changes Modal */}
      {showRequestChanges && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Changes</h3>
            <p className="text-gray-600 mb-4">
              Let the freelancer know what changes you'd like to see before approving the work.
            </p>
            
            <textarea
              value={changesRequest}
              onChange={(e) => setChangesRequest(e.target.value)}
              placeholder="Describe the changes needed..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
            />
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  setShowRequestChanges(false);
                  setChangesRequest("");
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestChanges(selectedFreelancer)}
                disabled={!changesRequest.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
              >
                Request Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompletionProject;