import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import PeopleTable from "../Tables";

export default function SubCategories() {
  const { token } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const { categoryId } = useParams();

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

  return (
    <PeopleTable
      title="Sub-Categories"
      addLabel="Add Sub-Categories"
      endpoint={`/category/${categoryId}/sub-categories`}  
      columns={columns}
      formFields={formFields}
      token={token}
      desktopAsCards
      onCardClick={(row, helpers) => navigate(`sub/${helpers.getId(row)}`)} 
      crudConfig={{ showDetails: false, showRowEdit: false, showDelete: true }}
      renderCardSubtitle={(row) => {
        const count =
          row.childrenCount ??
          (Array.isArray(row.children) ? row.children.length : 0) ??
          row.subSubCount ??
          0;
        return <span className="text-xs text-slate-500">{count} sub-sub categories</span>;
      }}
    />
  );
}
