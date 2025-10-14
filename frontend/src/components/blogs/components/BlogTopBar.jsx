import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Share2,
  Link as LinkIcon,
  Plus,
  X,
  Bookmark,
  Image as ImageIcon,
  Upload as UploadIcon,
  Link2,
} from "lucide-react";
import axios from "axios";


export default function BlogTopBar({
  showBack = false,
  onBack,
  enableNew = true,
  createUrl = "/api/blogs",
  uploadUrl = "/api/uploads",
  mock = true,
  onCreated,
  currentId,
  currentTitle,
  currentExcerpt,
}) {
  /* -------- Copy / Share -------- */
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

  /* -------- Favorites (localStorage) -------- */
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

  // Cover source: 'upload' | 
  const [coverMode, setCoverMode] = useState("upload");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(""); 

  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image.");
      return;
    }
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

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

  // Resolve cover URL depending on mode
  const resolveCover = async () => {
    if (coverMode === "url") {
      const u = coverUrl.trim();
      if (!u) throw new Error("Please paste a cover URL or switch to Upload.");
      return u;
    }
    // upload mode
    if (!coverFile) {
      if (mock && coverPreview) return coverPreview; // allow preview as cover in MOCK
      throw new Error("Please import an image for the cover.");
    }
    if (mock) {
      // In mock: just use preview
      return coverPreview;
    }
    // Real upload
    const fd = new FormData();
    fd.append("file", coverFile);
    const { data } = await axios.post(uploadUrl, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!data || !data.url) {
      throw new Error("Upload failed: server did not return a URL.");
    }
    return data.url;
  };

  const submitNew = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);

      const cover = await resolveCover();
      const payload = {
        title: form.title.trim(),
        category: form.category.trim(),
        cover,
        excerpt: form.excerpt.trim(),
        date: form.date,
        read: form.read.trim() || "5 min",
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        sections: [
          {
            id: "intro",
            h: "Introduction",
            p: form.content.split("\n\n").map((x) => x.trim()).filter(Boolean),
          },
        ],
      };

      if (!payload.title || !payload.category || !payload.cover) {
        alert("Please fill title, category, and cover image.");
        setCreating(false);
        return;
      }

      let created = payload;
      if (mock) {
        console.log("MOCK CREATE BLOG =>", payload);
        alert("Mock: blog data captured in console.");
      } else {
        const { data } = await axios.post(createUrl, payload);
        created = data || payload;
        alert("Blog created!");
      }

      // Reset
      setOpen(false);
      setForm((f) => ({
        ...f,
        title: "",
        category: "",
        excerpt: "",
        content: "",
        tags: "",
      }));
      setCoverFile(null);
      setCoverPreview("");
      setCoverUrl("");
      setCoverMode("upload");

      onCreated?.(created);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create blog.");
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
            {/* Favorite */}
            {currentId && (
              <button
                onClick={toggleFav}
                className={`w-9 h-9 grid place-items-center rounded-full border hover:bg-slate-50 ${
                  fav ? "border-[#028090]" : "border-slate-200"
                }`}
                title={fav ? "Remove favorite" : "Add to favorites"}
              >
                <Bookmark className={`w-4 h-4 ${fav ? "text-[#028090] fill-[#028090]" : "text-slate-700"}`} />
              </button>
            )}

            {/* Copy */}
            <button
              onClick={copyLink}
              className="h-9 px-3 rounded-full border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2"
              title="Copy link"
            >
              <LinkIcon className="w-4 h-4 text-slate-700" />
              <span className="text-sm text-slate-700 hidden sm:inline">Copy</span>
            </button>

            {/* Share */}
            <button
              onClick={shareLink}
              className="h-9 px-3 rounded-full border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2"
              title="Share"
            >
              <Share2 className="w-4 h-4 text-slate-700" />
              <span className="text-sm text-slate-700 hidden sm:inline">Share</span>
            </button>

            {/* New Blog */}
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

              <form
                onSubmit={submitNew}
                className="p-4 sm:p-6 grid gap-6 overflow-y-auto max-h-[calc(85vh-56px)]"
              >
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">Cover image *</label>

                    {/* Mode toggle */}
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setCoverMode("upload")}
                        className={`px-3 py-1.5 rounded-full text-sm border transition ${
                          coverMode === "upload"
                            ? "bg-[#028090]/5 text-[#028090] border-[#028090]"
                            : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverMode("url")}
                        className={`px-3 py-1.5 rounded-full text-sm border transition ${
                          coverMode === "url"
                            ? "bg-[#028090]/5 text-[#028090] border-[#028090]"
                            : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        URL
                      </button>
                    </div>

                    {coverMode === "upload" ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={onDrop}
                        className="rounded-xl border border-dashed border-slate-300 hover:border-slate-400 transition p-4"
                      >
                        {coverPreview ? (
                          <div className="relative">
                            <img
                              src={coverPreview}
                              alt="Cover preview"
                              className="w-full h-44 object-cover rounded-lg"
                            />
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-9 px-3 rounded-full border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2"
                              >
                                <UploadIcon className="w-4 h-4" />
                                <span className="text-sm">Change image</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCoverFile(null);
                                  setCoverPreview("");
                                }}
                                className="h-9 px-3 rounded-full border border-slate-200 hover:bg-slate-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="mx-auto w-12 h-12 rounded-full grid place-items-center bg-slate-100">
                              <ImageIcon className="w-6 h-6 text-slate-500" />
                            </div>
                            <p className="mt-2 text-sm text-slate-600">
                              Drag & drop an image here, or
                            </p>
                            <div className="mt-3">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-9 px-3 rounded-full border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2"
                              >
                                <UploadIcon className="w-4 h-4" />
                                <span className="text-sm">Import image</span>
                              </button>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFile(e.target.files?.[0])}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative">
                          <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                            placeholder="https://example.com/cover.jpg"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]/50 bg-white"
                          />
                        </div>
                        {!!coverUrl && (
                          <img
                            src={coverUrl}
                            alt="Cover preview"
                            className="w-full h-44 object-cover rounded-lg border border-slate-200"
                            onError={(e) => {
                              e.currentTarget.src = "";
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/*  Title + Category + Excerpt + Tags */}
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
                          placeholder="e.g. Guides"
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
                        rows={4}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028090]/20"
                        placeholder="Short summary..."
                      />
                    </div>

                    {/* ✅ Tags input */}
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Tags (comma separated)</label>
                      <input
                        name="tags"
                        value={form.tags}
                        onChange={onChange}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028090]/20"
                        placeholder="e.g. Hiring, Freelancers"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Content</label>
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={onChange}
                    rows={8}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028090]/20"
                    placeholder="Write your article. Use empty lines to split paragraphs."
                  />
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
                    className="h-10 px-4 rounded-xl border border-[#028090] text-white bg-[#028090] hover:bg-[#028090]/90 disabled:opacity-60"
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
