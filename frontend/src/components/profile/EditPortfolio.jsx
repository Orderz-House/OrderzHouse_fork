import { useState, useEffect } from "react";
import {
    Save,
    Upload,
    Eye,
    EyeOff,
    User,
    Mail,
    Phone,
    Globe,
    Camera,
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Settings,
    Briefcase,
    FileText,
    CreditCard,
    UserCog,
    Lock
    , Plus, Edit, Trash2, ExternalLink
} from "lucide-react";
import axios from "axios";

const EditPortfolio = (userId) => {
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    console.log("userId=>", userId?.userId);
    
   // const [freelancerId, setFreelancerId] = useState(null)
    /*
    if(typeof userId === "object" && userId !== null){
    setFreelancerId(userId.userId)
    }else{
     setFreelancerId(userId)   
    }
*/

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        skills: '',
        hourly_rate: '',
        work_url: ''
    });
    const [errors, setErrors] = useState({});
    const token = localStorage.getItem("token");


    // Fetch portfolio items on component mount
    useEffect(() => {
        fetchPortfolioItems();
    }, []);


const fetchPortfolioItems = async () => {
  try {
    setIsLoading(true);

    const response = await axios.get(
      `http://localhost:5000/users/freelancer/${30}/portfolio`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("dataaaaaaaaaa =>", response.data.portfolios);


    setPortfolioItems(response.data.portfolios);
  } catch (error) {
    console.error("Error fetching portfolio items:", error);
  } finally {
    setIsLoading(false);
  }
};

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
        ...prev,
        [field]: field === 'skills'
            ? value.split(',').map(skill => skill.trim()).filter(Boolean)
            : value 
        }));
        
        
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        const skillsArray = Array.isArray(formData.skills) ? formData.skills : [];

        if (skillsArray.length === 0) {
            newErrors.skills = 'Skills are required';
        }
        console.log("skillsArray =>", skillsArray);
        
        if (!formData.hourly_rate || formData.hourly_rate <= 0) newErrors.hourly_rate = 'Valid hourly rate is required';
        if (!formData.work_url.trim()) newErrors.work_url = 'Work URL is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        try {
            if (editingItem) {
                // Update existing item
                console.log("formData =>", formData);
                
                axios.put(`http://localhost:5000/users/freelancer/portfolio/edit/${editingItem.id}`, {...formData}, {
                  headers: {
                    authorization: `Bearer ${token}`,
                  },
                }).then((result) => {
                    console.log("Update successflly", result);
                    setPortfolioItems(prevItems => prevItems.map(item =>
                    item.id === editingItem.id ? { ...item, ...formData } : item
                    ));

                }).catch((err) => {
                    console.log("Update error", err);
                });
            } else {
                axios.post("http://localhost:5000/users/freelancer/portfolio/create", {...formData, freelancer_id: 30}, {
                    headers:{
                        authorization : `Bearer  ${token}`
                    }
                }).then((result) => {
                    console.log("Created successflly", result);
                    const newItem = result.data.portfolio;
                    setPortfolioItems(prevItems => [...prevItems, newItem]);
                }).catch((err) => {
                    console.log("Error Create", err);
                });
            }
            

            setFormData({
                title: '',
                description: '',
                skills: '',
                hourly_rate: '',
                work_url: ''
            });
            
            setEditingItem(null);
            setIsAdding(false);


            
        } catch (error) {
            console.error('Error saving portfolio item:', error);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description,
            skills: item.skills,
            hourly_rate: item.hourly_rate,
            work_url: item.work_url
        });
        setIsAdding(true);
    };

    const handleDelete = async (freelnacerId,portfolioId) => {
        console.log("freelnacerId =>", freelnacerId);
        console.log("portfolioId =>", portfolioId);
        
        if (!window.confirm('Are you sure you want to delete this portfolio item?')) return;
        console.log(token);
        
        try {
            axios.delete("http://localhost:5000/users/freelancer/portfolio/delete",  {
                headers:{
                        authorization : `Bearer  ${token}`
                    },
                data:{freelnacerId, portfolioId}
            }, ).then((result) => {
                console.log(result);
                setPortfolioItems(prevItems => prevItems.filter(item => item.id !== portfolioId));       
            }).catch((err) => {
                console.log(err);
                
            });

        } catch (error) {
            console.error('Error deleting portfolio item:', error);
        }
    };

    const cancelEdit = () => {
        setFormData({
            title: '',
            description: '',
            skills: '',
            hourly_rate: '',
            work_url: ''
        });
        setEditingItem(null);
        setIsAdding(false);
        setErrors({});
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Manage Portfolio</h2>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Portfolio Item
                    </button>
                </div>
                <p className="text-gray-600 mt-2">Showcase your work samples, projects, and skills to potential clients.</p>
            </div>

            {/* Add/Edit Form */}
            {isAdding && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {editingItem ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Project Title *
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.title ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="e.g., E-commerce Website"
                                />
                                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Hourly Rate ($) *
                                </label>
                                <input
                                    id="hourly_rate"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.hourly_rate}
                                    onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.hourly_rate ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="e.g., 45.00"
                                />
                                {errors.hourly_rate && <p className="text-red-600 text-sm mt-1">{errors.hourly_rate}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                                Skills (comma separated) *
                            </label>
                            <input
                                id="skills"
                                type="text"
                                value={formData.skills}
                                onChange={(e) => handleInputChange('skills', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.skills ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="e.g., React, Node.js, UI/UX Design"
                            />
                            {errors.skills && <p className="text-red-600 text-sm mt-1">{errors.skills}</p>}
                        </div>

                        <div>
                            <label htmlFor="work_url" className="block text-sm font-medium text-gray-700 mb-1">
                                Work URL (portfolio link) *
                            </label>
                            <input
                                id="work_url"
                                type="url"
                                value={formData.work_url}
                                onChange={(e) => handleInputChange('work_url', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.work_url ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="e.g., https://example.com/portfolio"
                            />
                            {errors.work_url && <p className="text-red-600 text-sm mt-1">{errors.work_url}</p>}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                rows="4"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.description ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Describe the project, your role, and the results achieved..."
                            />
                            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {editingItem ? 'Update Item' : 'Add Item'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Portfolio Items Grid */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Portfolio Items</h3>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : portfolioItems?.length === 0 ? (
                    <div className="text-center py-12">
                        <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No portfolio items yet.</p>
                        <p className="text-sm text-gray-500 mt-2">Add your first portfolio item to showcase your work.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {portfolioItems?.map((item) => (
                            
                            <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                {console.log(item)}
                                <div className="h-40 bg-gray-100 flex items-center justify-center">
                                    <Globe className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="p-4">
                                    <h4 className="font-semibold text-gray-900 truncate">{item.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">${item.hourly_rate}/hr</p>

                                    {/* Time information */}
                                    <div className="mt-2 text-xs text-gray-500">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <span className="mr-1">Created:</span>
                                                <span>{new Date(item.added_at).toLocaleDateString()}</span>
                                            </div>
                                            {item.edit_at && (
                                                <div className="flex items-center">
                                                    <span className="mr-1">Updated:</span>
                                                    <span>{new Date(item.edit_at).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {item.skills.map((skill, index) => (
                                            <span 
                                                key={index} 
                                                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                            >
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">{item.description}</p>
                                    
                                    <div className="flex justify-between mt-4">
                                        <a 
                                            href={item.work_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 text-sm hover:underline flex items-center"
                                        >
                                            <ExternalLink className="w-3 h-3 mr-1" />
                                            View Work
                                        </a>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.freelancer_id, item.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


export default EditPortfolio;