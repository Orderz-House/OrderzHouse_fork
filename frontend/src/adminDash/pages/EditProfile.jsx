import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { User } from "lucide-react";

const THEME = {
  BG: "#F6F7FB",
  CARD_SHADOW: "0 10px 30px rgba(15,23,42,0.06)",
  RING: "rgba(15,23,42,0.10)",
  PRIMARY: "#6366F1",
  PRIMARY_DARK: "#4F46E5",
};

function EditProfile() {
  const { userData } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    country: "",
    profile_pic_url: "",
  });

  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setFetchLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage({
          type: "error",
          text: "Authentication required. Please login.",
        });
        setFetchLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/users/getUserdata", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success && data.user) {
        const userData = {
          first_name: data.user.first_name || "",
          last_name: data.user.last_name || "",
          username: data.user.username || "",
          email: data.user.email || "",
          phone_number: data.user.phone_number || "",
          country: data.user.country || "",
          profile_pic_url: data.user.profile_pic_url || "",
        };
        setFormData(userData);
        setOriginalData(userData);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to load profile",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error loading profile" });
      console.error("Error:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      formData.first_name !== originalData.first_name ||
      formData.last_name !== originalData.last_name ||
      formData.username !== originalData.username ||
      formData.phone_number !== originalData.phone_number ||
      formData.country !== originalData.country ||
      formData.profile_pic_url !== originalData.profile_pic_url
    );
  };

  const validateField = (name, value) => {
    const errors = { ...validationErrors };

    if (
      name === "first_name" ||
      name === "last_name" ||
      name === "username" ||
      name === "country"
    ) {
      if (!value || value.trim() === "") {
        errors[name] = "This field is required";
      } else {
        delete errors[name];
      }
    }

    if (name === "phone_number") {
      if (!value || value.trim() === "") {
        errors[name] = "Phone number is required";
      } else if (!/^\d{10}$/.test(value)) {
        errors[name] = "Phone number must be exactly 10 digits with no letters";
      } else {
        delete errors[name];
      }
    }

    setValidationErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone_number") {
      const digitsOnly = value.replace(/\D/g, "");
      const limitedValue = digitsOnly.slice(0, 10);
      setFormData({
        ...formData,
        [name]: limitedValue,
      });
      validateField(name, limitedValue);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      validateField(name, value);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.first_name || formData.first_name.trim() === "") {
      errors.first_name = "First name is required";
    }
    if (!formData.last_name || formData.last_name.trim() === "") {
      errors.last_name = "Last name is required";
    }
    if (!formData.username || formData.username.trim() === "") {
      errors.username = "Username is required";
    }
    if (!formData.phone_number || formData.phone_number.trim() === "") {
      errors.phone_number = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone_number)) {
      errors.phone_number = "Phone number must be exactly 10 digits";
    }
    if (!formData.country || formData.country.trim() === "") {
      errors.country = "Country is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    if (!hasChanges()) {
      setMessage({ type: "error", text: "No changes to save" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage({
          type: "error",
          text: "Authentication required. Please login.",
        });
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/users/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username,
          phone_number: formData.phone_number,
          country: formData.country,
          profile_pic_url: formData.profile_pic_url,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setOriginalData(formData);
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to update profile",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error connecting to server" });
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[420px]"
        style={{ background: THEME.BG }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderBottomColor: THEME.PRIMARY_DARK }}
          />
          <p className="mt-4 text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const isButtonDisabled =
    !hasChanges() || loading || Object.keys(validationErrors).length > 0;

  return (
    <div className="min-h-screen" style={{ background: THEME.BG }}>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slideDown 0.5s ease-out; }
      `}</style>

      <div className="mx-auto w-full">
        {/* Hero */}
        <div className="rounded-[26px] overflow-hidden" style={{ boxShadow: THEME.CARD_SHADOW }}>
          <div className="relative bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 px-5 sm:px-6 py-5 sm:py-6 text-white">
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/80">
              SETTINGS
            </div>
            <h1 className="mt-2 text-[18px] sm:text-2xl font-extrabold">
              Edit Profile
            </h1>
            <p className="text-white/85 text-xs sm:text-sm mt-1">
              Update your personal information
            </p>
          </div>
        </div>

        {/* Content Card */}
        <div
          className="mt-5 sm:mt-6 rounded-[26px] bg-white p-4 sm:p-6"
          style={{ boxShadow: THEME.CARD_SHADOW }}
        >
          {/* Avatar */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-100 ring-1 ring-slate-200 grid place-items-center">
                {formData.profile_pic_url ? (
                  <img
                    src={formData.profile_pic_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-slate-300" />
                )}
              </div>

              {/* زر شكلي فقط (نفس منطقك القديم بدون وظيفة) */}
            
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-8 gap-y-5 sm:gap-y-6">
            <Field
              label="First Name"
              required
              error={validationErrors.first_name}
            >
              <Input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="OrderzHouse"
                error={!!validationErrors.first_name}
              />
            </Field>

            <Field
              label="Last Name"
              required
              error={validationErrors.last_name}
            >
              <Input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="User"
                error={!!validationErrors.last_name}
              />
            </Field>

            <Field
              label="Username"
              required
              error={validationErrors.username}
            >
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="orderzhouse_user"
                error={!!validationErrors.username}
              />
            </Field>

            <Field label="Email">
              <Input name="email" value={formData.email} disabled />
              <p className="mt-2 text-xs text-slate-500">
                Email cannot be changed
              </p>
            </Field>

            <Field
              label="Phone Number"
              required
              error={validationErrors.phone_number}
            >
              <Input
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="0791234567"
                error={!!validationErrors.phone_number}
              />
            </Field>

            <Field
              label="Country"
              required
              error={validationErrors.country}
            >
              <Input
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Jordan"
                error={!!validationErrors.country}
              />
            </Field>

          
          </div>

          {message.text ? (
            <div
              className={`mt-6 p-4 rounded-2xl border animate-slide-down ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{message.text}</span>
              </div>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex justify-end mt-7">
            <button
              onClick={handleSubmit}
              disabled={isButtonDisabled}
              className={`h-11 px-8 rounded-2xl font-semibold text-sm transition-colors ${
                isButtonDisabled
                  ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                  : "text-white hover:opacity-95"
              }`}
              style={{
                background: isButtonDisabled ? undefined : THEME.PRIMARY_DARK,
              }}
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI small helpers (theme only) ---------- */
function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-2">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-rose-500">{error}</p> : null}
    </div>
  );
}

function Input({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={
        "w-full h-11 rounded-2xl px-4 bg-white border outline-none text-sm text-slate-700 " +
        (error ? "border-rose-300 focus:ring-4 focus:ring-rose-100" : "border-slate-200 focus:ring-4 focus:ring-indigo-100") +
        " " +
        className
      }
    />
  );
}

export default EditProfile;
