import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, Check, X } from "lucide-react";

const API_URL = import.meta.env.VITE_APP_API_URL;

const FreelancerCategorySelector = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch main categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/category`);
        setCategories(response.data.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // Fetch sub-categories when main category is selected
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedMainCategory) {
        setSubCategories([]);
        setSelectedSubCategories([]);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/category/${selectedMainCategory.id}/sub-categories`
        );
        setSubCategories(response.data.data || []);
        // Reset selected sub-categories when main category changes
        setSelectedSubCategories([]);
        setError("");
      } catch (err) {
        console.error("Error fetching sub-categories:", err);
        setError("Failed to load sub-categories");
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, [selectedMainCategory]);

  const handleMainCategorySelect = (category) => {
    if (selectedMainCategory?.id === category.id) {
      // Deselect if same category is clicked
      setSelectedMainCategory(null);
    } else {
      // Select new category
      setSelectedMainCategory(category);
    }
    
    // Notify parent of changes
    onCategoryChange({
      mainCategory: category.id === selectedMainCategory?.id ? null : category,
      subCategories: []
    });
  };

  const handleSubCategoryToggle = (subCategory) => {
    // Check if already selected
    const isSelected = selectedSubCategories.some(sc => sc.id === subCategory.id);
    
    if (isSelected) {
      // Remove from selection
      const newSelection = selectedSubCategories.filter(sc => sc.id !== subCategory.id);
      setSelectedSubCategories(newSelection);
      onCategoryChange({
        mainCategory: selectedMainCategory,
        subCategories: newSelection
      });
    } else {
      // Check if already at max (3)
      if (selectedSubCategories.length >= 3) {
        setError("You can select a maximum of 3 sub-categories");
        setTimeout(() => setError(""), 3000);
        return;
      }
      
      // Add to selection
      const newSelection = [...selectedSubCategories, subCategory];
      setSelectedSubCategories(newSelection);
      onCategoryChange({
        mainCategory: selectedMainCategory,
        subCategories: newSelection
      });
      setError(""); // Clear any previous error
    }
  };

  const removeSubCategory = (subCategoryId) => {
    const newSelection = selectedSubCategories.filter(sc => sc.id !== subCategoryId);
    setSelectedSubCategories(newSelection);
    onCategoryChange({
      mainCategory: selectedMainCategory,
      subCategories: newSelection
    });
  };

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
      <label className="block text-sm text-slate-700 mb-2">
        Select Your Expertise
        <span className="block text-xs text-slate-500 mt-1">
          Choose exactly one main category and up to three sub-categories
        </span>
      </label>

      {/* Validation Error Message */}
      {error && (
        <div className="mb-3 p-2 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-200">
          {error}
        </div>
      )}

      {/* Selected Categories Display */}
      <div className="mb-3">
        {/* Main Category Display */}
        {selectedMainCategory && (
          <div className="inline-flex items-center bg-[#028090] text-white px-3 py-1 rounded-full text-xs mr-2 mb-2">
            <span className="truncate max-w-32">{selectedMainCategory.name}</span>
            <button
              type="button"
              onClick={() => handleMainCategorySelect(selectedMainCategory)}
              className="ml-2 hover:bg-white/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Sub-Categories Display */}
        {selectedSubCategories.length > 0 && (
          <div className="inline-flex flex-wrap gap-1">
            {selectedSubCategories.map((subCat) => (
              <div
                key={subCat.id}
                className="inline-flex items-center bg-emerald-600 text-white px-3 py-1 rounded-full text-xs"
              >
                <span className="truncate max-w-24">{subCat.name}</span>
                <button
                  type="button"
                  onClick={() => removeSubCategory(subCat.id)}
                  className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Categories Selection */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-slate-700 mb-2">Main Categories</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-lg">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleMainCategorySelect(category)}
              className={`p-3 rounded-lg border text-left transition text-sm ${
                selectedMainCategory?.id === category.id
                  ? "border-[#028090] bg-[#028090]/5 text-[#028090]"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center">
                {selectedMainCategory?.id === category.id && (
                  <Check className="w-4 h-4 text-[#028090] mr-2" />
                )}
                <span className="truncate">{category.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Categories Selection */}
      {selectedMainCategory && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-700">
              Sub-Categories for {selectedMainCategory.name}
            </h3>
            <span className="text-xs text-slate-500">
              {selectedSubCategories.length}/3 selected
            </span>
          </div>
          
          {loading ? (
            <div className="text-center py-4 text-slate-500">Loading sub-categories...</div>
          ) : subCategories.length > 0 ? (
            <div className="max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-lg">
              <div className="grid grid-cols-1 gap-2">
                {subCategories.map((subCategory) => {
                  const isSelected = selectedSubCategories.some(sc => sc.id === subCategory.id);
                  return (
                    <button
                      key={subCategory.id}
                      type="button"
                      onClick={() => handleSubCategoryToggle(subCategory)}
                      disabled={!isSelected && selectedSubCategories.length >= 3}
                      className={`p-3 rounded-lg border text-left transition text-sm ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : selectedSubCategories.length >= 3
                          ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center">
                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-600 mr-2" />
                        )}
                        <span className="truncate">{subCategory.name}</span>
                      </div>
                      {subCategory.description && (
                        <div className="text-xs text-slate-500 mt-1 truncate">
                          {subCategory.description}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-slate-500">
              No sub-categories available for this category
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-3 text-xs text-slate-500">
        <p>• Select exactly one main category</p>
        <p>• Select 1-3 sub-categories from your chosen main category</p>
      </div>
    </div>
  );
};

export default FreelancerCategorySelector;