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
    { label: "Description", key: "description" },
    { label: "Sub-Sub Count", key: "subsub_count" },
  ];

  const formFields = [
    { key: "name", label: "Name", required: true },
    { key: "description", label: "Description", type: "textarea" },
  ];

  return (
    <PeopleTable
      title="Sub-Categories"
      addLabel="Add Sub-Category"
      endpoint={`/category/${categoryId}/sub-categories`}
      columns={columns}
      formFields={formFields}
      token={token}
      desktopAsCards
      mobileAsCards
      onCardClick={(row, helpers) =>
        navigate(`/category/sub-category/${helpers.getId(row)}`)
      }
      crudConfig={{ showDetails: false, showRowEdit: false, showDelete: true }}
      renderSubtitle={(row) => {
        const count = Number(row.subsub_count) || 0;
        return (
          <span className="text-xs font-medium text-emerald-600">
            {count} sub-sub {count === 1 ? "category" : "categories"}
          </span>
        );
      }}
    />
  );
}