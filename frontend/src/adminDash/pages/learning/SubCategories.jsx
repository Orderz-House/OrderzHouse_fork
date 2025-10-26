import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import PeopleTable from "../Tables";

const USE_MOCK = true;

const MOCK_SUBS = {
  "cat-design": [
    { id: "sub-logo", name: "Logo", slug: "logo", description: "Marks & symbols" },
    { id: "sub-ui", name: "UI Design", slug: "ui-design", description: "Interfaces" },
    { id: "sub-brand", name: "Brand Kit", slug: "brand-kit", description: "Guidelines" },
  ],
  "cat-programming": [
    { id: "sub-web", name: "Web Apps", slug: "web", description: "React, Next, APIs" },
    { id: "sub-mobile", name: "Mobile Apps", slug: "mobile", description: "iOS/Android" },
    { id: "sub-backend", name: "Back-end", slug: "backend", description: "Node, DBs" },
  ],
  "cat-content": [
    { id: "sub-blog", name: "Blog", slug: "blog", description: "Articles" },
    { id: "sub-ads", name: "Ads Copy", slug: "ads", description: "Ad creatives" },
    { id: "sub-social", name: "Social", slug: "social", description: "Posts" },
  ],
};

const ringStyle = { border: "1px solid rgba(15,23,42,.10)" };

const Pencil = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

function SubCategoriesMock({ items, categoryId }) {
  const navigate = useNavigate();
  const [list, setList] = useState(items);

  const del = (id) => setList((prev) => prev.filter((x) => x.id !== id));

  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-4 sm:p-5" style={ringStyle}>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-800">Sub-Categories (Mock)</h1>
        <p className="text-slate-500 text-sm">For category: {categoryId}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <div
            key={s.id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`sub/${s.id}`)}              
            onKeyDown={(e) => e.key === "Enter" && navigate(`sub/${s.id}`)}
            className="rounded-2xl bg-white/80 backdrop-blur shadow-sm hover:shadow transition overflow-hidden cursor-pointer"
            style={ringStyle}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 truncate">{s.name}</div>
                  <div className="text-xs text-slate-500 truncate">{s.description}</div>
                  <div className="mt-2 text-xs text-slate-600">{s.slug}</div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`sub/${s.id}`); }}  
                    className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
                    title="Edit"
                  >
                    <Pencil />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); del(s.id); }}
                    className="h-9 px-3 rounded-full border border-slate-200 text-sm text-rose-600 hover:bg-rose-50"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default function SubCategories() {
  const { token } = useSelector((s) => s.auth);
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const columns = [
    { label: "Name", key: "name" },
    { label: "Slug", key: "slug" },
    { label: "Description", key: "description" },
  ];
  const formFields = [
    { key: "name", label: "Name", required: true },
    { key: "slug", label: "Slug" },
    { key: "description", label: "Description", type: "textarea" },
  ];

  const renderActions = (row, helpers) => {
    const id = helpers.getId(row);
    return (
      <button
        onClick={() => navigate(`sub/${id}`)}   
        className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
        title="Edit"
      >
        <Pencil />
      </button>
    );
  };

  const mockList = useMemo(() => MOCK_SUBS[categoryId] || [], [categoryId]);
  if (USE_MOCK) return <SubCategoriesMock items={mockList} categoryId={categoryId} />;

  return (
    <PeopleTable
      title="Sub-Categories"
      addLabel="Add Sub-Category"
      endpoint={`/categories/${categoryId}/subcategories`}
      columns={columns}
      formFields={formFields}
      token={token}
      desktopAsCards
      renderActions={renderActions}
      crudConfig={{ showRowEdit: false, showDelete: true }}
    />
  );
}
