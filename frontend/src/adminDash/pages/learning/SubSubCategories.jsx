import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import PeopleTable from "../Tables";

export default function SubSubCategories() {
  const { token } = useSelector((s) => s.auth);
  const { subCategoryId } = useParams();

  const columns = [
    { label: "Name", key: "name" },
    { label: "Description", key: "description" },
  ];

  const formFields = [
    { key: "name", label: "Name", required: true },
    { key: "description", label: "Description", type: "textarea" },
  ];

  return (
    <PeopleTable
      title="Sub-Sub-Categories"
      addLabel="Add Sub-Sub-Category"
      endpoint={`/category/sub-category/${subCategoryId}/sub-sub-categories`}
      columns={columns}
      formFields={formFields}
      token={token}
      crudConfig={{ showDetails: false, showRowEdit: false, showDelete: true }}
    />
  );
}
