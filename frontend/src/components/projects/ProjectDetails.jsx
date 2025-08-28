import { useEffect, useMemo, useState } from "react";
import { Star, Filter, Users, DollarSign, Search, CheckCircle, User, Eye, ExternalLink, Briefcase } from "lucide-react";

export default function ProjectDetailsDemo() {
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [error, setError] = useState("");
    const [sortBy, setSortBy] = useState("assignments");
    const [skillFilter, setSkillFilter] = useState("");
    const [selected, setSelected] = useState({});
    const roleId = "1"; // Demo role ID (client)
    
    // Demo data
    const [relatedFreelancers] = useState([
        {
            id: 1,
            first_name: "Sarah",
            last_name: "Johnson",
            username: "sarahdev",
            profile_pic_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
            assignments_count: 47,
            portfolios: [
                {
                    id: 1,
                    title: "E-commerce React Application",
                    skills: "React, Node.js, MongoDB",
                    hourly_rate: 65,
                    work_url: "https://example.com/work1"
                },
                {
                    id: 2,
                    title: "Mobile-First Landing Pages",
                    skills: "React, Tailwind CSS, Next.js",
                    hourly_rate: 70,
                    work_url: "https://example.com/work2"
                }
            ]
        },
        {
            id: 2,
            first_name: "Michael",
            last_name: "Chen",
            username: "mikecodes",
            profile_pic_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            assignments_count: 32,
            portfolios: [
                {
                    id: 3,
                    title: "Full Stack Web Platform",
                    skills: "Vue.js, Python, PostgreSQL",
                    hourly_rate: 55,
                    work_url: "https://example.com/work3"
                }
            ]
        },
        {
            id: 3,
            first_name: "Emma",
            last_name: "Wilson",
            username: "emmaweb",
            profile_pic_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
            assignments_count: 28,
            portfolios: [
                {
                    id: 4,
                    title: "UI/UX Design System",
                    skills: "Figma, React, TypeScript",
                    hourly_rate: 80,
                    work_url: "https://example.com/work4"
                },
                {
                    id: 5,
                    title: "Mobile App Design",
                    skills: "React Native, Figma, Adobe XD",
                    hourly_rate: 75,
                    work_url: "https://example.com/work5"
                }
            ]
        },
        {
            id: 4,
            first_name: "David",
            last_name: "Rodriguez",
            username: "daviddev",
            profile_pic_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
            assignments_count: 19,
            portfolios: [
                {
                    id: 6,
                    title: "Backend API Development",
                    skills: "Node.js, Express, MongoDB",
                    hourly_rate: 50,
                    work_url: "https://example.com/work6"
                }
            ]
        }
    ]);

    const filteredSorted = useMemo(() => {
        let list = [...relatedFreelancers];
        if (skillFilter.trim()) {
            const q = skillFilter.toLowerCase();
            list = list.filter((f) => f.portfolios.some((p) => p.skills.toLowerCase().includes(q)));
        }
        if (sortBy === "hourly") {
            list.sort((a, b) => {
                const ah = Math.min(...a.portfolios.map((p) => p.hourly_rate));
                const bh = Math.min(...b.portfolios.map((p) => p.hourly_rate));
                return ah - bh;
            });
        } else {
            list.sort((a, b) => b.assignments_count - a.assignments_count);
        }
        return list;
    }, [relatedFreelancers, sortBy, skillFilter]);

    const selectedCount = Object.values(selected).filter(Boolean).length;

    const handleAssignSelected = async () => {
        const ids = Object.keys(selected).filter((k) => selected[k]);
        if (!ids.length) {
            alert("Select at least one freelancer");
            return;
        }
        setLoadingRelated(true);
        setTimeout(() => {
            alert(`Successfully assigned ${ids.length} freelancer(s) to the project!`);
            setSelected({});
            setLoadingRelated(false);
        }, 1000);
    };

    const handleAssignSingle = async (freelancerId) => {
        setLoadingRelated(true);
        setTimeout(() => {
            alert("Freelancer assigned successfully!");
            setLoadingRelated(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                        Related Freelancers
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Find the perfect freelancers for your project based on skills and experience
                    </p>
                </div>

                {/* Filters and Controls */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-end gap-6 mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Filter by Skills
                            </label>
                            <input 
                                value={skillFilter} 
                                onChange={(e) => setSkillFilter(e.target.value)} 
                                placeholder="Search skills like React, Node.js, Python..." 
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                            />
                        </div>
                        <div className="min-w-[200px]">
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Sort By
                            </label>
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)} 
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            >
                                <option value="assignments">Most Experienced</option>
                                <option value="hourly">Lowest Rate First</option>
                            </select>
                        </div>
                    </div>

                    {/* Stats and Bulk Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{filteredSorted.length} freelancers found</span>
                            </div>
                            {selectedCount > 0 && (
                                <div className="flex items-center gap-2 text-blue-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>{selectedCount} selected</span>
                                </div>
                            )}
                        </div>
                        
                        {selectedCount > 0 && (
                            <button
                                onClick={handleAssignSelected}
                                disabled={loadingRelated}
                                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                            >
                                {loadingRelated ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Assigning...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Assign {selectedCount} Selected
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Loading and Error States */}
                {loadingRelated && !selectedCount && (
                    <div className="flex justify-center items-center py-12">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-3 text-slate-600">Loading freelancers...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="text-red-800">{error}</div>
                    </div>
                )}

                {/* Freelancer Cards Grid */}
                {!loadingRelated && !error && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredSorted.map((freelancer) => (
                            <div key={freelancer.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200">
                                {/* Selection Checkbox */}
                                <div className="p-6 pb-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={!!selected[freelancer.id]}
                                                onChange={(e) => setSelected((s) => ({ ...s, [freelancer.id]: e.target.checked }))}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                            />
                                            <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors">
                                                Select for assignment
                                            </span>
                                        </label>
                                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                                            <span className="text-sm font-semibold text-amber-700">{freelancer.assignments_count}</span>
                                        </div>
                                    </div>

                                    {/* Freelancer Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                                                {freelancer.profile_pic_url ? (
                                                    <img 
                                                        src={freelancer.profile_pic_url} 
                                                        alt={`${freelancer.first_name} ${freelancer.last_name}`} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                ) : (
                                                    <User className="w-8 h-8 text-white" />
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-slate-800 mb-1">
                                                {freelancer.first_name} {freelancer.last_name}
                                            </h3>
                                            <div className="text-slate-500 mb-2">@{freelancer.username}</div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1 text-slate-600">
                                                    <Briefcase className="w-4 h-4" />
                                                    <span>{freelancer.assignments_count} projects</span>
                                                </div>
                                                {freelancer.portfolios.length > 0 && (
                                                    <div className="flex items-center gap-1 text-slate-600">
                                                        <DollarSign className="w-4 h-4" />
                                                        <span>${Math.min(...freelancer.portfolios.map(p => p.hourly_rate))}/hr</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Portfolio Section */}
                                    {freelancer.portfolios.length > 0 && (
                                        <div className="space-y-3 mb-6">
                                            <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                                <Eye className="w-4 h-4" />
                                                Recent Work
                                            </h4>
                                            {freelancer.portfolios.slice(0, 2).map((portfolio) => (
                                                <div key={portfolio.id} className="bg-slate-50 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h5 className="font-medium text-slate-800">{portfolio.title}</h5>
                                                        <span className="text-sm font-semibold text-green-600">${portfolio.hourly_rate}/hr</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mb-3">
                                                        {portfolio.skills.split(', ').map((skill, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {portfolio.work_url && (
                                                        <a 
                                                            href={portfolio.work_url} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            View Project
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Assign Button */}
                                    <button
                                        onClick={() => handleAssignSingle(freelancer.id)}
                                        disabled={loadingRelated}
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                    >
                                        {loadingRelated ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Assigning...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Assign to Project
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {filteredSorted.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-600 mb-2">No freelancers found</h3>
                                <p className="text-slate-500">Try adjusting your filters or search criteria</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}