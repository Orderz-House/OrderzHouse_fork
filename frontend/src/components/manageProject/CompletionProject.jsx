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
} from "lucide-react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";

function CompletionProject({ project }) {
  const { projectId } = useParams();
  const { token, userData } = useSelector((state) => state.auth);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [completionHistory, setCompletionHistory] = useState([]);
  const [isReleasingPayment, setIsReleasingPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequestChanges, setShowRequestChanges] = useState(false);
  const [changesRequest, setChangesRequest] = useState("");

  useEffect(() => {
    const fetchCompletionData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/projects/${projectId}/completion`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCompletionStatus(response.data.status);
        setCompletionHistory(response.data.history || []);
      } catch (error) {
        console.error("Error fetching completion data:", error);
      }
    };

    if (projectId && token) {
      fetchCompletionData();
    }
  }, [projectId, token]);

  // Handle work completion submission
  const handleWorkCompletion = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `http://localhost:5000/projects/${projectId}/complete`,
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

  // Handle payment release
  const handleReleasePayment = async () => {
    try {
      setIsReleasingPayment(true);
      const response = await axios.post(
        `http://localhost:5000/projects/${projectId}/release-payment`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setCompletionStatus("completed");
        setCompletionHistory((prev) => [
          ...prev,
          {
            event: "payment_released",
            timestamp: new Date().toISOString(),
            actor: userData.id,
            actor_name: `${userData.first_name} ${userData.last_name}`,
          },
        ]);
      }
    } catch (error) {
      console.error("Error releasing payment:", error);
    } finally {
      setIsReleasingPayment(false);
    }
  };

  // Handle request changes
  const handleRequestChanges = async () => {
    try {
      // API call to submit changes request
      setShowRequestChanges(false);
      setChangesRequest("");
    } catch (error) {
      console.error("Error requesting changes:", error);
    }
  };

  const isProjectOwner = userData.id === project.user_id;
  const isAssignedFreelancer = project.assignments?.some(
    assignment => assignment.freelancer.id === userData.id && assignment.status === "active"
  );

  console.log(project);
  

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

      {/* For Freelancers - Work Completion Section */}
      {isAssignedFreelancer && project.status === 'available' && completionStatus !== "completed" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            Complete Your Work
          </h3>
          
          <p className="text-gray-600 mb-4">
            Once you've finished all deliverables for this project, you can mark it as complete.
            The client will then review your work and release payment.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">Before submitting</h4>
                <ul className="text-sm text-yellow-700 list-disc pl-5 space-y-1">
                  <li>Ensure all project requirements are met</li>
                  <li>Deliver all final files to the client</li>
                  <li>Confirm the client has received everything</li>
                </ul>
              </div>
            </div>
          </div>
          
          {completionStatus === "pending_review" ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-800">Completion request submitted and awaiting client review</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCompletionModal(true)}
              className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center font-medium shadow-sm hover:shadow-md"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Mark Work as Complete
            </button>
          )}
        </div>
      )}

      {/* For Clients - Payment Release Section */}
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
              <div className="text-2xl font-bold text-amber-900">${project.budget_min}</div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-800 mb-1">To Be Released</div>
              <div className="text-2xl font-bold text-gray-900">${project.budget_min}</div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            Funds are securely held in escrow. Once the freelancer marks the work as complete and you're satisfied with the results, 
            you can release payment to them.
          </p>
          
          {completionStatus === "pending_review" ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">
                    You have 7 days to review the work before payment is automatically released.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReleasePayment}
                  disabled={isReleasingPayment}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center font-medium shadow-sm hover:shadow-md"
                >
                  {isReleasingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Releasing Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approve & Release Payment
                    </>
                  )}
                </button>
                
                <button 
                  onClick={() => setShowRequestChanges(true)}
                  className="flex-1 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Request Changes
                </button>
              </div>
            </div>
          ) : completionStatus === "completed" ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-800">Payment has been released to the freelancer</span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-5 text-center">
              <Clock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Waiting for freelancer to complete work</p>
            </div>
          )}
        </div>
      )}

      {/* Completion History */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          Completion History
        </h3>
        
        <div className="space-y-4">
          {completionHistory.length > 0 ? (
            completionHistory.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium capitalize text-gray-900">
                      {event.event.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {event.actor === userData.id ? "You" : event.actor_name || "Other party"}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(event.timestamp).toLocaleDateString()} at {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p>No completion history yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Completion Confirmation Modal */}
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
                onClick={handleRequestChanges}
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