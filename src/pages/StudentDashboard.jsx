import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const navigationItems = [
  {
    id: "submit",
    label: "Submit Complaint",
    helper: "Create a new complaint ticket",
  },
  {
    id: "history",
    label: "Complaint History",
    helper: "See your previous submissions",
  },
  {
    id: "track",
    label: "Track Status",
    helper: "Check progress and responses",
  },
  {
    id: "chatbot",
    label: "Ask Chatbot",
    helper: "Get guidance before submitting",
  },
];

const categoryOptions = ["General", "Academic", "Finance", "IT", "Facility", "Discipline"];
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
const serverPayloadLimitBytes = 100 * 1024;
const maxImageSizeBytes = 70 * 1024;
const maxDataUrlBytes = 90 * 1024;

// image reader helper function
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

// image size calculator
function formatFileSize(size) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function StudentDashboard() {
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeSection, setActiveSection] = useState("submit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState({
    type: "idle",
    message: "",
  });
  const [complaintData, setComplaintData] = useState({
    title: "",
    description: "",
    category: "General",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const [isReadingImage, setIsReadingImage] = useState(false);

  // complaint history
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);


//   mount when history section is active or user changes (e.g. after login
  useEffect(() => {
    const fetchComplaints = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/complaints?userId=${user.id}`);
        setComplaints(res.data);
      } catch (error) {
        console.error("Failed to fetch complaints", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeSection === "history") {
      fetchComplaints();
    }
  }, [activeSection, user?.id]);

//   logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };
  
//   image and complaint form handlers
  const handleComplaintChange = (event) => {
    const { name, value } = event.target;
    setComplaintData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (submissionFeedback.type !== "idle") {
      setSubmissionFeedback({
        type: "idle",
        message: "",
      });
    }
  };
  
//   clear image function to reset image state and clear file input
  const clearImage = () => {
    setSelectedImage(null);
    setImageError("");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    setImageError("");

    if (!file) {
      setSelectedImage(null);
      return;
    }
    // image validation logic: type, extension, size
    const normalizedType = file.type.toLowerCase();
    const normalizedName = file.name.toLowerCase();
    const isAllowedType = allowedImageTypes.includes(normalizedType);
    const hasAllowedExtension = allowedImageExtensions.some((extension) =>
      normalizedName.endsWith(extension)
    );

    if (!isAllowedType && !hasAllowedExtension) {
      setSelectedImage(null);
      setImageError("Only JPG, JPEG, PNG, or WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > maxImageSizeBytes) {
      setSelectedImage(null);
      setImageError("Image is too large for local server. Please use an image smaller than 70KB.");
      event.target.value = "";
      return;
    }

    setIsReadingImage(true);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const dataUrlBytes = new Blob([dataUrl]).size;
      if (dataUrlBytes > maxDataUrlBytes) {
        setSelectedImage(null);
        setImageError("Image is too large after encoding. Use a smaller JPG/PNG image.");
        event.target.value = "";
        return;
      }
      setSelectedImage({
        fileName: file.name,
        mimeType: normalizedType || "image/jpeg",
        size: file.size,
        dataUrl,
      });
    } catch {
      setSelectedImage(null);
      setImageError("Failed to read image. Please choose another file.");
      event.target.value = "";
    } finally {
      setIsReadingImage(false);
    }
  };
  
//   reset form function to clear all fields and feedback
  const resetForm = () => {
    setComplaintData({
      title: "",
      description: "",
      category: "General",
    });
    clearImage();
    setSubmissionFeedback({
      type: "idle",
      message: "",
    });
  };
   
//   complaint submission handling
  const handleComplaintSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || isReadingImage) return;

    if (!user?.id) {
      setSubmissionFeedback({
        type: "error",
        message: "Your session is invalid. Please log in again.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionFeedback({
      type: "idle",
      message: "",
    });

    try {
      await axios.post("http://localhost:5000/complaints", {
        ...complaintData,
        userId: user.id,
        status: "pending",
        createdAt: new Date().toISOString(),
        attachment: selectedImage
          ? {
              fileName: selectedImage.fileName,
              mimeType: selectedImage.mimeType,
              size: selectedImage.size,
              dataUrl: selectedImage.dataUrl,
            }
          : null,
      });

      setSubmissionFeedback({
        type: "success",
        message: "Complaint submitted successfully. You can track it in the status section.",
      });
      setTimeout(()=>{
        setSubmissionFeedback({
          type: "idle",
          message: "",
        });
      }, 5000)

      setComplaintData({
        title: "",
        description: "",
        category: "General",
      });
      clearImage();
    } catch (error) {
      const isPayloadTooLarge = error?.response?.status === 413;
      setSubmissionFeedback({
        type: "error",
        message: isPayloadTooLarge
          ? "Image payload is too large for the local server limit (100KB). Use a smaller image."
          : "Failed to submit complaint. Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPlaceholderSection = (title, description) => (
    <section className="mx-auto w-full max-w-5xl">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-black/30">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-slate-400">{description}</p>
      </div>
    </section>
  );

  const feedbackClassName =
    submissionFeedback.type === "success"
      ? "rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
      : "rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex lg:h-screen">
      <aside className="w-full border-b border-slate-800 bg-slate-900/90 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col p-6 lg:p-7 ">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-indigo-400">Student Panel</h2>
            <p className="mt-1 text-sm text-slate-400">Manage your complaints from one place.</p>
          </div>
          <nav className="mt-8 space-y-2 " >
            {navigationItems.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  className={`group w-full rounded-xl px-4 py-3 text-left transition hover:cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white bg-slate-800/20"
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span className="block text-base font-semibold">{item.label}</span>
                  <span
                    className={`mt-0.5 block text-xs ${
                      isActive ? "text-indigo-100" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  >
                    {item.helper}
                  </span>
                </button>
              );
            })}
          </nav>
            {/* logout button*/}
          <button
            className="mt-14 w-full rounded-xl bg-rose-600 px-4 py-2.5 font-semibold text-white transition hover:bg-rose-500 cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:h-screen lg:overflow-y-auto">
        <header className="border-b border-slate-800 bg-slate-900/85 px-4 py-4 backdrop-blur lg:sticky lg:top-0 lg:z-20 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-white">Welcome, {user?.name}</h1>
              <p className="text-sm text-slate-400">Submit, review, and track your cases.</p>
            </div>
            <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
              Role: {user?.role}
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
            {/* submit section */}
          {activeSection === "submit" && (
            <section className="mx-auto w-full max-w-6xl">
              <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/30">
                  <div className="border-b border-slate-800 px-6 py-6 sm:px-8">
                    <p className="inline-flex rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                      New Ticket
                    </p>
                    <h2 className="mt-4 text-3xl font-black tracking-tight text-white">
                      Submit a Complaint
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      Share what happened clearly so the right team can resolve it faster.
                    </p>
                  </div>

                  <form className="space-y-6 px-6 py-6 sm:px-8" onSubmit={handleComplaintSubmit}>
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-300">Title</span>
                      <input
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                        name="title"
                        onChange={handleComplaintChange}
                        placeholder="Example: Delay in exam result publication"
                        required
                        type="text"
                        value={complaintData.title}
                      />
                    </label>

                    <label className="block">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-300">Description</span>
                        <span className="text-xs text-slate-500">
                          {complaintData.description.length}/600
                        </span>
                      </div>
                      <textarea
                        className="min-h-44 w-full rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 resize-none"
                        maxLength={600}
                        name="description"
                        onChange={handleComplaintChange}
                        placeholder="Provide key details like when it happened, where, and any steps you already took."
                        required
                        rows={7}
                        value={complaintData.description}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-300">Category</span>
                      <select
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                        name="category"
                        onChange={handleComplaintChange}
                        value={complaintData.category}
                      >
                        {categoryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-300">
                        Evidence Image (optional)
                      </span>
                      <input
                        ref={imageInputRef}
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2.5 text-sm text-slate-200 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:font-semibold file:text-white hover:file:bg-indigo-500"
                        onChange={handleImageChange}
                        type="file"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Allowed: JPG, JPEG, PNG, WEBP. Max size: 70KB (local server limit: {serverPayloadLimitBytes / 1024}KB).
                      </p>
                    </label>

                    {isReadingImage && (
                      <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
                        Processing image...
                      </div>
                    )}

                    {imageError && (
                      <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                        {imageError}
                      </div>
                    )}


                    {/* clear selected image */}
                    {selectedImage && (
                      <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                          <img
                            alt="Attachment preview"
                            className="h-28 w-full rounded-xl border border-slate-700 object-cover sm:w-40"
                            src={selectedImage.dataUrl}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-200">
                              {selectedImage.fileName}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {selectedImage.mimeType} • {formatFileSize(selectedImage.size)}
                            </p>
                            <button
                              className="mt-3 cursor-pointer rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                              onClick={clearImage}
                              type="button"
                            >
                              Remove image
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {submissionFeedback.type !== "idle" && (
                      <div className={feedbackClassName}>{submissionFeedback.message}</div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <button
                        className={`rounded-xl px-6 py-3 text-sm font-semibold text-white transition ${
                          isSubmitting || isReadingImage
                            ? "cursor-not-allowed bg-indigo-500/60"
                            : "bg-indigo-600 hover:-translate-y-0.5 hover:bg-indigo-500 cursor-pointer"
                        }`}
                        disabled={isSubmitting || isReadingImage}
                        type="submit"
                      >
                        {isSubmitting
                          ? "Submitting..."
                          : isReadingImage
                          ? "Processing image..."
                          : "Submit Complaint"}
                      </button>

                      <button
                        className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 cursor-pointer"
                        onClick={resetForm}
                        type="button"
                      >
                        Reset Form
                      </button>
                    </div>
                  </form>
                </div>
                {/* form submit guidance section */}
                <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30">
                  <h3 className="text-lg font-bold text-white">Before you submit</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Quick tips to help staff resolve your complaint sooner.
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-200">
                    <li className="rounded-xl border border-slate-800 bg-slate-800/70 p-3">
                      Use a specific title that summarizes the issue.
                    </li>
                    <li className="rounded-xl border border-slate-800 bg-slate-800/70 p-3">
                      Include dates, locations, and relevant names in the description.
                    </li>
                    <li className="rounded-xl border border-slate-800 bg-slate-800/70 p-3">
                      Choose the right category to route the complaint correctly.
                    </li>
                  </ul>
                  <div className="mt-5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs text-indigo-100">
                    Tip: You can track updates after submission from the Track Status tab.
                  </div>
                </aside>
              </div>
            </section>
          )}

          {/* active section */}

          {activeSection === "history" && (
             <div>
                {loading &&<p className="text-gray-400">Loading your complaints...</p>}
                <h2 className="text-2xl font-bold mb-6">
                Complaint History
                </h2>

                {complaints.length === 0 ? (
                <p className="text-gray-400">
                    You have not submitted any complaints yet.
                </p>
                ) : (
                <div className="space-y-4">
                    {complaints.map((complaint) => (
                    <div
                        key={complaint.id}
                        className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">
                                {complaint.title}
                            </h3>

                            <span
                                className={`px-3 py-1 text-sm rounded-full ${
                                complaint.status === "pending"
                                    ? "bg-yellow-600"
                                    : complaint.status === "in-progress"
                                    ? "bg-blue-600"
                                    : "bg-green-600"
                                }`}>
                                {complaint.status}
                            </span>
                        </div>

                        <p className="text-gray-400 mb-3">
                                 {complaint.description}
                        </p>

                        {(complaint.attachment?.dataUrl || complaint.attachment?.url) && (
                          <div className="mb-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Attached Image
                            </p>
                            <a
                              className="inline-block"
                              href={complaint.attachment?.dataUrl || complaint.attachment?.url}
                              rel="noreferrer"
                              target="_blank"
                              title="Open image in new tab"
                            >
                              <img
                                alt={`Attachment for ${complaint.title}`}
                                className="h-36 w-full max-w-sm rounded-xl border border-slate-700 object-cover transition hover:opacity-90"
                                src={complaint.attachment?.dataUrl || complaint.attachment?.url}
                              />
                            </a>
                            <p className="mt-2 text-xs text-slate-400">
                              {complaint.attachment?.fileName || "image-attachment"}
                            </p>
                          </div>
                        )}

                        <div className="text-sm text-gray-500">
                            Category: {complaint.category} | 
                            Submitted: {new Date(complaint.createdAt).toLocaleString()}
                        </div>
                    </div>
                    ))}
                </div>
                )}
             </div>
            )}

            {/* complaint track section */}

          {activeSection === "track" &&
            renderPlaceholderSection(
              "Track Complaint Status",
              "Live updates, assigned office, and resolution progress will appear in this section."
            )}

            {/* chatbot section */}

          {activeSection === "chatbot" &&
            renderPlaceholderSection(
              "Ask the Support Chatbot",
              "Ask questions about complaint categories, expected timelines, and process guidance."
            )}
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
