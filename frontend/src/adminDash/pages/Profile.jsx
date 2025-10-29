import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { User } from "lucide-react";
import { useToast } from "../../components/toast/ToastProvider"; 

const PRIMARY = "#028090";

export default function EditProfile() {
  const { userData } = useSelector((state) => state.auth);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    country: "",
    profile_pic_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setFetchLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/users/getUserdata", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success && data.user) {
        setFormData(data.user);
      } else {
        showToast(data.message || "Failed to load profile", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading profile", "error");
    } finally {
      setFetchLoading(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.first_name?.trim()) errors.first_name = "Required";
    if (!formData.last_name?.trim()) errors.last_name = "Required";
    if (!formData.username?.trim()) errors.username = "Required";
    if (!/^\d{10}$/.test(formData.phone_number)) errors.phone_number = "10 digits required";
    if (!formData.country?.trim()) errors.country = "Required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/users/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Profile updated successfully!", "success");
      } else {
        showToast(data.message || "Failed to update profile", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error while saving changes", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-600">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 sm:px-6 py-6 text-[14px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-28 h-28 bg-slate-100 border border-slate-200 rounded-full overflow-hidden grid place-items-center">
              {formData.profile_pic_url ? (
                <img
                  src={formData.profile_pic_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-14 h-14 text-slate-400" />
              )}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[var(--primary)] text-white grid place-items-center shadow-md"
              style={{ background: PRIMARY }}
            >
              +
            </button>
          </div>
          <h1 className="mt-3 font-semibold text-slate-800 text-lg">
            Edit Profile
          </h1>
          <p className="text-slate-500 text-sm">Update your personal details</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "First Name", key: "first_name" },
            { label: "Last Name", key: "last_name" },
            { label: "Username", key: "username" },
            { label: "Email", key: "email", disabled: true },
            { label: "Phone Number", key: "phone_number" },
            { label: "Country", key: "country" },
          ].map((field) => (
            <label key={field.key} className="space-y-1">
              <span className="text-[13px] font-medium text-slate-700">
                {field.label}
              </span>
              <input
                name={field.key}
                value={formData[field.key] || ""}
                onChange={handleChange}
                disabled={field.disabled}
                className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 ${
                  field.disabled
                    ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                    : "bg-white text-slate-800"
                } ${
                  validationErrors[field.key]
                    ? "border-rose-300 focus:ring-rose-200"
                    : "border-slate-300"
                }`}
              />
              {validationErrors[field.key] && (
                <span className="text-xs text-rose-500">
                  {validationErrors[field.key]}
                </span>
              )}
            </label>
          ))}

          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`h-10 px-6 rounded-full text-sm font-medium shadow-sm transition-all border ${
                loading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-[var(--primary)] text-white hover:bg-[#016d7a]"
              }`}
              style={{ background: PRIMARY }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
