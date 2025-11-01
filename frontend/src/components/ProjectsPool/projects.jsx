import { useState, useEffect } from "react";

// Colors
const primary = "rgb(2, 128, 144)";
const primaryDark = "rgb(0, 90, 100)";
const primaryLight = "rgb(0, 170, 180)";

export default function ProjectsPool({ categoryId, onBack }) {
  const [projects, setProjects] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const projectsResponse = await fetch(`https://backend.thi8ah.com/projects/category/${categoryId}`);
        
        if (!projectsResponse.ok) {
          throw new Error(`HTTP error! status: ${projectsResponse.status}`);
        }
        
        const projectsData = await projectsResponse.json();
        
        if (projectsData.success && projectsData.projects) {
          setProjects(projectsData.projects);
          
          if (projectsData.projects.length > 0) {
            setCategory({
              id: categoryId,
              name: projectsData.projects[0].category_name
            });
          }
        } else {
          const categoryResponse = await fetch(`https://backend.thi8ah.com/category/${categoryId}`);
          if (categoryResponse.ok) {
            const categoryData = await categoryResponse.json();
            if (categoryData.success && categoryData.category) {
              setCategory(categoryData.category);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchData();
    }
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[rgb(2,128,144)] transition mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Categories
          </button>
          
          {category && (
            <div>
              <h1 className="text-3xl font-bold text-[rgb(2,128,144)]">
                {category.name}
              </h1>
              <p className="mt-2 text-slate-600">{category.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[rgb(2,128,144)] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600">Loading projects...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load projects: {error}</p>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-slate-900">No projects found</h3>
            <p className="mt-1 text-slate-500">No projects available in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }) {
  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-[rgb(2,128,144)]">
      {/* Project Image */}
      {project.image_url && (
        <div className="aspect-video w-full overflow-hidden bg-slate-100">
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 mb-2">
          {project.title}
        </h3>
        
        <p className="text-sm text-slate-600 line-clamp-3 mb-4">
          {project.description}
        </p>

        {/* Budget & Deadline */}
        <div className="flex items-center justify-between mb-4">
          {project.budget && (
            <div className="flex items-center gap-1 text-sm">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-green-600">${project.budget}</span>
            </div>
          )}
          
          {project.deadline && (
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(project.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Skills/Tags */}
        {project.required_skills && project.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.required_skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
              >
                {skill}
              </span>
            ))}
            {project.required_skills.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                +{project.required_skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[rgb(2,128,144)] flex items-center justify-center text-white text-sm font-medium">
              {project.client_name?.[0] || 'C'}
            </div>
            <span className="text-sm text-slate-600">{project.client_name || 'Client'}</span>
          </div>

          <button
            className="inline-flex items-center gap-1 text-sm font-medium text-[rgb(2,128,144)] hover:text-[rgb(0,90,100)] transition"
            onClick={() => {
              console.log('View project:', project.id);
            }}
          >
            View Details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}