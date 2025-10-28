import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PeopleTable from "../Tables";

export default function Categories() {
  const { token } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const columns = [
    { label: "Name", key: "name" },
    { label: "Description", key: "description" },
  ];

  const formFields = [
    { key: "name", label: "Name", required: true },
    { key: "slug", label: "Slug" },
    { key: "description", label: "Description", type: "textarea" },
  ];

  return (
    <PeopleTable
      title="Categories"
      addLabel="Add Category"
      endpoint="/categories"
      columns={columns}
      formFields={formFields}
      token={token}
      desktopAsCards
      onCardClick={(row, helpers) => navigate(`${helpers.getId(row)}`)}
      crudConfig={{ showDetails: false, showRowEdit: false, showDelete: true }}
      renderCardSubtitle={(row) => {
        const count =
          row.subCount ??
          (Array.isArray(row.subcategories) ? row.subcategories.length : 0) ??
          0;
        return <span className="text-xs text-slate-500">{count} sub-categories</span>;
      }}
    />
  );
}
