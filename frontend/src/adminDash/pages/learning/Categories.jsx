import { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import PeopleTable from "../Tables";
import { FiArrowLeft } from "react-icons/fi";

export default function Categories() {
  const token = useSelector((state) => state.auth?.token);

  const [level, setLevel] = useState("main");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentEndpoint = useMemo(() => {
    if (level === "main") return "/category";
    if (level === "sub" && selectedCategory?.id)
      return `/category/${selectedCategory.id}/sub-categories`;
    if (level === "subsub" && (selectedSub?.id || selectedSub?.sub_category_id))
      return `/category/sub-category/${
        selectedSub.id || selectedSub.sub_category_id
      }/sub-sub-categories`;
    return null;
  }, [level, selectedCategory, selectedSub]);

  const formFields = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        type: "text",
        required: true,
        placeholder: "Enter name...",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter description...",
      },
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        label: "Name",
        key: "name",
        render: (row) =>
          row.name || row.sub_category_name || row.sub_sub_category_name,
      },
      {
        label: "Description",
        key: "description",
        render: (row) =>
          row.description ||
          row.sub_category_description ||
          row.sub_sub_category_description,
      },
    ],
    []
  );

  const goBack = useCallback(() => {
    if (level === "subsub") {
      setLevel("sub");
      setSelectedSub(null);
    } else if (level === "sub") {
      setLevel("main");
      setSelectedCategory(null);
    }
    setRefreshKey((k) => k + 1);
  }, [level]);

  const navigateToSub = useCallback((category) => {
    setSelectedCategory(category);
    setLevel("sub");
    setRefreshKey((k) => k + 1);
  }, []);

  const navigateToSubSub = useCallback((subCategory) => {
    setSelectedSub(subCategory);
    setLevel("subsub");
    setRefreshKey((k) => k + 1);
  }, []);

  // Dynamic title
  const title = useMemo(() => {
    if (level === "main") return "Categories";
    if (level === "sub") return selectedCategory?.name || "Sub-Categories";
    return (
      selectedSub?.name ||
      selectedSub?.sub_category_name ||
      "Sub-Sub-Categories"
    );
  }, [level, selectedCategory, selectedSub]);

  return (
    <div>
      {level !== "main" && (
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
          >
            <FiArrowLeft /> Back
          </button>
        </div>
      )}

      <PeopleTable
        key={`${level}-${refreshKey}`}
        title={title}
        endpoint={currentEndpoint}
        token={token}
        columns={columns}
        formFields={formFields}
        addLabel="Add New"
        desktopAsCards={true}
        onCardClick={(row) => {
          if (level === "main") navigateToSub(row);
          else if (level === "sub") navigateToSubSub(row);
        }}
        crudConfig={{
          showEdit: true,
          showDelete: true,
          showExpand: false,
          showRowEdit: false,
          showDetails: false,
        }}
      />
    </div>
  );
}
