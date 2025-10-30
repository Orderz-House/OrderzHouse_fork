import { useState } from "react";
import {
  Check,
  X,
  User,
  Briefcase,
  Star,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";

function OffersProject({ offers: initialOffers, onOfferUpdate }) {
  const { token } = useSelector((state) => state.auth);
  const [offers, setOffers] = useState(initialOffers);
  const [processingOffers, setProcessingOffers] = useState(new Set());

  const handleAcceptOffer = async (offerId) => {
    setProcessingOffers(prev => new Set(prev).add(offerId));
    
    try {
      const updatedOffers = offers.map(offer => 
        offer.id === offerId ? { ...offer, status_offer: "approved" } : offer
      );
      setOffers(updatedOffers);
      
      await axios.post(
        `https://backend.thi8ah.com/projects/offer/action`,
        { action: "approve", offer_id: offerId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (onOfferUpdate) {
        onOfferUpdate(updatedOffers);
      }
    } catch (err) {
      console.error(err);
      setOffers(initialOffers);
    } finally {
      setProcessingOffers(prev => {
        const newSet = new Set(prev);
        newSet.delete(offerId);
        return newSet;
      });
    }
  };

  const handleRejectOffer = async (offerId) => {
    setProcessingOffers(prev => new Set(prev).add(offerId));
    
    try {
      const updatedOffers = offers.map(offer => 
        offer.id === offerId ? { ...offer, status_offer: "rejected" } : offer
      );
      setOffers(updatedOffers);
      
      await axios.post(
        `https://backend.thi8ah.com/projects/offer/action`,
        { action: "reject", offer_id: offerId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (onOfferUpdate) {
        onOfferUpdate(updatedOffers);
      }
    } catch (err) {
      console.error(err);
      setOffers(initialOffers);
    } finally {
      setProcessingOffers(prev => {
        const newSet = new Set(prev);
        newSet.delete(offerId);
        return newSet;
      });
    }
  };

  const pendingOffers = offers.filter(o => o.status_offer === "pending");
  const processedOffers = offers.filter(o => o.status_offer !== "pending");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Freelancer Offers
        </h2>
        <div className="flex items-center space-x-4">
          {pendingOffers.length > 0 && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {pendingOffers.length} pending
            </span>
          )}
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No offers received yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Freelancers will submit offers for your project here. Check back later or consider promoting your project.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Offers Section */}
          {pendingOffers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Pending Review
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {pendingOffers.map((offer) => {
                  const isProcessing = processingOffers.has(offer.id);
                  return (
                    <div
                      key={offer.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 relative overflow-hidden"
                    >
                      {isProcessing && (
                        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {offer.freelancer.first_name}{" "}
                              {offer.freelancer.last_name}
                            </h3>
                            <div className="flex items-center mt-1">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              <span className="text-sm text-gray-600 mr-3">
                                {offer.freelancer.rating || "No rating"}
                              </span>
                              <Briefcase className="w-4 h-4 text-blue-500 mr-1" />
                              <span className="text-sm text-gray-600">
                                {offer.freelancer.completed_projects || 0} projects
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {offer.proposal}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                            Bid Amount
                          </div>
                          <div className="text-lg font-bold text-blue-900">
                            ${offer.bid_amount}
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-xs font-medium text-green-700 uppercase tracking-wide">
                            Delivery Time
                          </div>
                          <div className="text-lg font-bold text-green-900">
                            {offer.delivery_time} days
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mb-4 flex items-center">
                        Submitted on{" "}
                        {new Date(offer.submitted_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          disabled={isProcessing}
                          className="flex-1 py-2.5 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Accept Offer
                        </button>
                        <button
                          onClick={() => handleRejectOffer(offer.id)}
                          disabled={isProcessing}
                          className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Processed Offers Section */}
          {processedOffers.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                Processed Offers
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {processedOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className={`bg-gray-50 border rounded-xl p-6 ${
                      offer.status_offer === "approved" 
                        ? "border-green-200" 
                        : "border-red-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {offer.freelancer.first_name}{" "}
                            {offer.freelancer.last_name}
                          </h3>
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm text-gray-600 mr-3">
                              {offer.freelancer.rating || "No rating"}
                            </span>
                            <Briefcase className="w-4 h-4 text-blue-500 mr-1" />
                            <span className="text-sm text-gray-600">
                              {offer.freelancer.completed_projects || 0} projects
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center ${
                          offer.status_offer === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {offer.status_offer === "approved" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {offer.status_offer.charAt(0).toUpperCase() + offer.status_offer.slice(1)}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {offer.proposal}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                          Bid Amount
                        </div>
                        <div className="text-lg font-bold text-blue-900">
                          ${offer.bid_amount}
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-green-700 uppercase tracking-wide">
                          Delivery Time
                        </div>
                        <div className="text-lg font-bold text-green-900">
                          {offer.delivery_time} days
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Submitted on{" "}
                      {new Date(offer.submitted_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OffersProject;