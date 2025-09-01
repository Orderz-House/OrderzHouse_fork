import {
  Check,
  X,
  User,
  Briefcase,
  Star
} from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";

function OffersProject({offers}) {
  const { token} = useSelector((state) => state.auth);


  
  const handleAcceptOffer = (offerId) => {
    axios
      .post(
        `http://localhost:5000/projects/offer/action`,
        { action: "approve", offer_id: offerId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleRejectOffer = (offerId) => {
    axios
      .post(
        `http://localhost:5000/projects/offer/action`,
        { action: "reject", offer_id: offerId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  };


  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Freelancer Offers
          </h2>
          <span className="text-sm text-gray-600">
            {offers.filter((o) => o.status_offer === "pending").length}{" "}
            pending offers
          </span>
        </div>

        {offers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No offers received yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Freelancers will submit offers for your project here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Offers Section */}
            {offers.filter((o) => o.status_offer === "pending").length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Pending Offers
                </h3>

                <div className="space-y-4">
                  {offers
                    .filter((offer) => offer.status_offer === "pending")
                    .map((offer) => (
                      <div
                        key={offer.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
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
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">
                            {offer.proposal}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-sm font-medium text-blue-800">
                              Bid Amount
                            </div>
                            <div className="text-lg font-bold">
                              ${offer.bid_amount}
                            </div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <div className="text-sm font-medium text-green-800">
                              Delivery Time
                            </div>
                            <div className="text-lg font-bold">
                              {offer.delivery_time} days
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 mb-4">
                          Submitted on{" "}
                          {new Date(offer.submitted_at).toLocaleDateString()}
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleAcceptOffer(offer.id)}
                            className="flex-1 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Accept Offer
                          </button>
                          <button
                            onClick={() => handleRejectOffer(offer.id)}
                            className="flex-1 py-2 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject Offer
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Approved/Rejected Offers Section */}
            {offers.filter((o) => o.status_offer !== "pending").length > 0 && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  Processed Offers
                </h3>

                <div className="space-y-4">
                  {offers
                    .filter((offer) => offer.status_offer !== "pending")
                    .map((offer) => (
                      <div
                        key={offer.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-6 opacity-75"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                              <User className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
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
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              offer.status_offer === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {offer.status_offer.charAt(0).toUpperCase() + offer.status_offer.slice(1)}
                          </span>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">
                            {offer.proposal}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-sm font-medium text-blue-800">
                              Bid Amount
                            </div>
                            <div className="text-lg font-bold">
                              ${offer.bid_amount}
                            </div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <div className="text-sm font-medium text-green-800">
                              Delivery Time
                            </div>
                            <div className="text-lg font-bold">
                              {offer.delivery_time} days
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">
                          Submitted on{" "}
                          {new Date(offer.submitted_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  )
}

export default OffersProject
