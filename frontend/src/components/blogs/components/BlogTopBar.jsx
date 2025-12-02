import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Share2,
  Link as LinkIcon,
  Plus,
  X,
  Bookmark,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_APP_API_URL;  

export default function BlogTopBar({
  showBack = false,
  onBack,
  enableNew = true,
  onCreated,
  currentId,
  currentTitle,
  currentExcerpt,
}) {
  const copyLink = async () => {
    try {
      await navigator.clipboard?.writeText(window.location.href);
      alert("Link copied!");
    } catch {
      alert("Cannot copy link.");
    }
  };

  const shareLink = async () => {
    const data = {
      title: currentTitle || document.title,
      text: currentExcerpt || "",
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {}
    } else {
      await copyLink();
    }
  };

  /* -------- Favorites -------- */
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (!currentId) return;
    const raw = localStorage.getItem("blog_favs");
    const arr = raw ? JSON.parse(raw) : [];
    setFav(arr.includes(currentId));
  }, [currentId]);

  const toggleFav = () => {
    if (!currentId) return;
    const raw = localStorage.getItem("blog_favs");
    const arr = raw ? JSON.parse(raw) : [];
    const exists = arr.includes(currentId);
    const next = exists ? arr.filter((x) => x !== currentId) : [...arr, currentId];
    localStorage.setItem("blog_favs", JSON.stringify(next));
    setFav(!exists);
  };

  /* -------- Modal: New Blog -------- */
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const attachmentsRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    excerpt: "",
    content: "",
    tags: "",
    read: "5 min",
    date: new Date().toISOString().slice(0, 10),
  });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCoverFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image for cover.");
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleAttachments = (files) => {
    const validFiles = Array.from(files).filter((file) => {
      const allowed = [
        "image/",
        "application/pdf",
        "text/",
        "application/msword",
        "application/vnd.openxmlformats-officedocument",
      ];
      return allowed.some((type) => file.type.startsWith(type));
    });

    if (validFiles.length !== files.length) {
      alert(
        "Some files were skipped (unsupported format). Only images, PDFs, docs, and text files allowed."
      );
    }

    setAttachments((prev) => [...prev, ...validFiles.slice(0, 5 - prev.length)]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const submitNew = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);

      if (!coverFile) {
        alert("Please select a cover image.");
        setCreating(false);
        return;
      }

      if (!form.title.trim() || !form.category.trim() || !form.content.trim()) {
        alert("Please fill title, category, and content.");
        setCreating(false);
        return;
      }

      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      const authorName = user?.name || "Anonymous";

      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.content.trim());
      formData.append("category", form.category.trim());
      formData.append("read_time", form.read.trim() || "5 min");
      formData.append("cover", coverFile);
      formData.append("author", authorName);

      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (tags.length > 0) {
        formData.append("tags", tags.join(","));
      }

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const token = localStorage.getItem("token");

      const { data } = await axios.post(`${API_BASE}/blogs`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      alert("Blog created!");
      setOpen(false);
      setForm({ title: "", category: "", excerpt: "", content: "", tags: "", read: "5 min" });
      setCoverFile(null);
      setCoverPreview("");
      setAttachments([]);
      onCreated?.(data);
    } catch (err) {
      console.error("Blog creation error:", err);
      alert(err.response?.data?.message || err.message || "Failed to create blog.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBack && (
              <button
                onClick={onBack}
                className="h-9 px-3 rounded-full border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentId && (
              <button
                onClick={toggleFav}
                className={`w-9 h-9 grid place-items-center rounded-full border hover:bg-slate-50 ${
                  fav ? "border-[#028090]" : "border-slate-200"
                }`}
                title={fav ? "Remove favorite" : "Add to favorites"}
              >
                <Bookmark
                  className={`w-4 h-4 ${fav ? "text-[#028090] fill-[#028090]" : "text-slate-700"}`}
                />
              </button>
            )}

            <button
              onClick={copyLink}
              className="h-9 px-3 rounded-full border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2"
              title="Copy link"
            >
              <LinkIcon className="w-4 h-4 text-slate-700" />
              <span className="text-sm text-slate-700 hidden sm:inline">Copy</span>
            </button>

            <button
              onClick={shareLink}
              className="h-9 px-3 rounded-full border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2"
              title="Share"
            >
              <Share2 className="w-4 h-4 text-slate-700" />
              <span className="text-sm text-slate-700 hidden sm:inline">Share</span>
            </button>

            {enableNew && (
              <button
                onClick={() => setOpen(true)}
                className="h-9 px-3 rounded-full border border-[#028090] text-[#028090] hover:bg-[#028090]/5 inline-flex items-center gap-2"
                title="New Blog"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">New Blog</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-40 flex items-start sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => !creating && setOpen(false)}
          />

          <div className="relative z-50 w-full max-w-3xl">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden max-h-[85vh]">
              {/* Header */}
              <div className="h-14 px-4 sm:px-6 border-b border-slate-200/60 bg-white/80 backdrop-blur flex items-center justify-between">
                <div className="font-semibold text-slate-900">Create new blog</div>
                <button
                  onClick={() => !creating && setOpen(false)}
                  className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 hover:bg-slate-50"
                  title="Close"
                >
                  <X className="w-4 h-4 text-slate-700" />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={submitNew}
                className="p-4 sm:p-6 grid gap-6 overflow-y-auto max-h-[calc(85vh-56px)]"
              >
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Cover Upload */}
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">Cover Image *</label>
                    <div
                      className="rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 transition p-4 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {coverPreview ? (
                        <div className="relative">
                          <img
                            src={coverPreview}
                            alt="Cover preview"
                            className="w-full h-44 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition">
                            <span className="text-white text-sm">Change cover</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="mx-auto w-12 h-12 rounded-full grid place-items-center bg-slate-100">
                            <ImageIcon className="w-6 h-6 text-slate-500" />
                          </div>
                          <p className="mt-2 text-sm text-slate-600">Click to upload cover image</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleCoverFile(e.target.files?.[0])}
                    />
                  </div>

                  {/* Fields */}
                  <div className="grid gap-4 content-start">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Title *</label>
                        <input
                          name="title"
                          value={form.title}
                          onChange={onChange}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028090]/20"
                          placeholder="Blog title"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Category *</label>
                        <input
                          name="category"
                          value={form.category}
                          onChange={onChange}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028090]/20"
                          placeholder="e.g. Tutorial"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Excerpt</label>
                      <textarea
                        name="excerpt"
                        value={form.excerpt}
                        onChange={onChange}
                        rows={2}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-[#028090]/20"
                        placeholder="Short summary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Tags</label>
                      <input
                        name="tags"
                        value={form.tags}
                        onChange={onChange}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-[#028090]/20"
                        placeholder="React, JavaScript"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Content *</label>
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={onChange}
                    rows={6}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-[#028090]/20"
                    placeholder="Write your article..."
                    required
                  />
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm text-slate-600 mb-2">
                    Attachments
                    <span className="text-xs text-slate-500 ml-2">Max 5 files</span>
                  </label>
                  <div
                    className="rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 transition p-4 cursor-pointer"
                    onClick={() => attachmentsRef.current?.click()}
                  >
                    <div className="flex flex-col items-center">
                      <Paperclip className="w-6 h-6 text-slate-500" />
                      <p className="mt-2 text-sm text-slate-600">
                        {attachments.length > 0
                          ? `${attachments.length} file(s)`
                          : "Click to add attachments"}
                      </p>
                    </div>
                  </div>

                  <input
                    ref={attachmentsRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleAttachments(e.target.files)}
                  />

                  {attachments.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="bg-slate-100 rounded-lg p-2 text-xs truncate">
                            {file.name}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => !creating && setOpen(false)}
                    className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creating}
                    className="h-10 px-4 rounded-xl bg-[#028090] border border-[#028090] text-white hover:bg-[#028090]/90 disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
