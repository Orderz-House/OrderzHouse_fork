import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, ArrowRight, Sparkles, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TopRatedFreelancers() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/users/freelancers/top-rated")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFreelancers(data.freelancers);
        }
      })
      .catch((err) => console.error("Error fetching freelancers:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Elite Talent
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Top Rated Freelancers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our highest-rated professionals who deliver exceptional
            quality and reliability
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {freelancers.map((freelancer, index) => (
            <motion.div
              key={freelancer.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="p-6 flex flex-col items-center text-center flex-grow">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 p-1">
                    <img
                      src={freelancer.profile_pic_url || "/default-avatar.png"}
                      alt={freelancer.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  {index < 3 && (
                    <div className="absolute -top-2 -right-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-400"
                            : "bg-amber-700"
                        }`}
                      >
                        <Award className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-lg mb-1">
                  {freelancer.first_name} {freelancer.last_name}
                </h3>

                <p className="text-sm text-gray-500 mb-3">
                  @{freelancer.username}
                </p>

                {freelancer.country && (
                  <p className="text-sm text-gray-600 mb-4">
                    {freelancer.country}
                  </p>
                )}

                <div className="flex items-center justify-center bg-gray-100 rounded-full px-4 py-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 mr-1" />
                  <span className="font-semibold">
                    {freelancer.rating || "0.0"}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">rating</span>
                </div>

                {freelancer.skills && (
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {freelancer.skills
                      .split(",")
                      .slice(0, 3)
                      .map((skill, i) => (
                        <span
                          key={i}
                          className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    {freelancer.skills.split(",").length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{freelancer.skills.split(",").length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => navigate(`/freelancers/${freelancer.id}`)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center"
                >
                  View Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {freelancers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">
              No top freelancers found
            </div>
            <p className="text-gray-400">
              Check back later for our top-rated professionals
            </p>
          </div>
        )}

        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/freelancers")}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            Browse All Freelancers
          </button>
        </div>
      </div>
    </div>
  );
}
