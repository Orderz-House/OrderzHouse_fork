import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE, INITIAL_FORM_STATE } from "../constants";

export const useProjectForm = () => {
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE}/projects/public/categories`)
      .then((res) => setCategories(res.data.categories || []))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addSkill = (skillInput, setSkillInput) => {
    if (
      skillInput.trim() &&
      !form.preferred_skills.includes(skillInput.trim())
    ) {
      setForm((prev) => ({
        ...prev,
        preferred_skills: [...prev.preferred_skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setForm((prev) => ({
      ...prev,
      preferred_skills: prev.preferred_skills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  return {
    form,
    setForm,
    categories,
    handleChange,
    addSkill,
    removeSkill,
  };
};