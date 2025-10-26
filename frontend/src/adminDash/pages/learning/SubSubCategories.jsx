import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import PeopleTable from "../Tables";

const USE_MOCK = true;

// Mock data per (categoryId, subCategoryId)
const MOCK_SUBSUB = {
  "cat-design|sub-logo": [
    { id: "ss-emblem", name: "Emblem", slug: "emblem", description: "Vintage marks" },
    { id: "ss-wordmark", name: "Wordmark", slug: "wordmark", description: "Typography logos" },
  ],
  "cat-programming|sub-web": [
    { id: "ss-next", name: "Next.js", slug: "next", description: "SSR/SSG apps" },
    { id: "ss-nest", name: "NestJS", slug: "nest", description: "API services" },
  ],
  "cat-content|sub-blog": [
    { id: "ss-tech", name: "Tech", slug: "tech", description: "Engineering topics" },
    { id: "ss-marketing", name: "Marketing", slug: "marketing", description: "Growth content" },
  ],
};

const ringStyle = { border: "1px solid rgba(15,23,42,.10)" };
const Pencil = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

function SubSubMock({ items, categoryId, subCategoryId }) {
  const [list, setList] = useState(items);
  const del = (id) => setList((prev) => prev.filter((x) => x.id !== id));

  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-4 sm:p-5" style={ringStyle}>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-800">Sub-Sub-Categories (Mock)</h1>
        <p className="text-slate-500 text-sm">
          For: {categoryId} / {subCategoryId}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <div key={s.id} className="rounded-2xl bg-white/80 backdrop-blur shadow-sm overflow-hidden" style={ringStyle}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 truncate">{s.name}</div>
                  <div className="text-xs text-slate-500 truncate">{s.description}</div>
                  <div className="mt-2 text-xs text-slate-600">{s.slug}</div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <button
                    className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
                    title="Edit"
                  >
                    <Pencil />
                  </button>
                  <button
                    onClick={() => del(s.id)}
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

export default function SubSubCategories() {
  const { token } = useSelector((s) => s.auth);
  const { categoryId, subCategoryId } = useParams();

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

  const key = `${categoryId}|${subCategoryId}`;
  const mockList = useMemo(() => MOCK_SUBSUB[key] || [], [key]);

  if (USE_MOCK) return <SubSubMock items={mockList} categoryId={categoryId} subCategoryId={subCategoryId} />;

  return (
    <PeopleTable
      title="Sub-Sub-Categories"
      addLabel="Add Sub-Sub-Category"
      endpoint={`/categories/${categoryId}/subcategories/${subCategoryId}/children`}
      columns={columns}
      formFields={formFields}
      token={token}
      desktopAsCards
    />
  );
}
