import axios from "axios";
import { useEffect, useRef, useState,useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { COMPLAINT_STATUS } from "../constants/complaintStatus";
import { API_BASE_URL } from "../constants/api";
import {ROUTES} from "../constants/routes";

// Reusable Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon, color = "blue", trend, subtitle }) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    amber: "text-amber-600 bg-amber-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
    red: "text-red-600 bg-red-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <span>↑</span> {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

const Button = ({ children, variant = "primary", size = "md", onClick, disabled, className = "", ...props }) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400",
    ghost: "bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-400",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

const TextArea = ({ label, error, showCount = false, maxLength, className = "", ...props }) => {
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e) => {
    setCharCount(e.target.value.length);
    if (props.onChange) props.onChange(e);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        {showCount && maxLength && (
          <span className="text-xs text-gray-400">{charCount}/{maxLength}</span>
        )}
      </div>
      <textarea
        className={`
          w-full rounded-lg border border-gray-300 px-4 py-3
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-shadow duration-200 resize-none
          ${error ? "border-red-300 focus:ring-red-500" : ""}
          ${className}
        `}
        maxLength={maxLength}
        onChange={handleChange}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

const normalizeComplaintStatus = (status) =>
  String(status || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

const StatusBadge = ({ status }) => {
  const normalizedStatus = normalizeComplaintStatus(status);
  const variants = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    "in-progress": "bg-sky-50 text-sky-700 border-sky-200",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    assigned: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  const labels = {
    pending: COMPLAINT_STATUS.PENDING,
    "in-progress": COMPLAINT_STATUS.IN_PROGRESS,
    resolved: COMPLAINT_STATUS.RESOLVED,
    assigned: COMPLAINT_STATUS.ASSIGNED,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${variants[normalizedStatus] || variants.pending}`}>
      {labels[normalizedStatus] || status}
    </span>
  );
};

// progress tracker component with stepper UI and remarks display
const ProgressTracker = ({ complaint }) => {
  const steps = [
    { status: COMPLAINT_STATUS.PENDING, label: "Submitted", description: "Your complaint has been received" },
    { status: COMPLAINT_STATUS.ASSIGNED, label: "Assigned", description: "Assigned to relevant department" },
    { status: COMPLAINT_STATUS.IN_PROGRESS, label: "In Progress", description: "Staff is working on it" },
    { status: COMPLAINT_STATUS.RESOLVED, label: "Resolved", description: "Issue has been resolved" },
  ];

  const normalizedStatus = normalizeComplaintStatus(complaint?.status);
  const matchedStepIndex = steps.findIndex((step) => step.status === normalizedStatus);
  const currentStepIndex = matchedStepIndex >= 0 ? matchedStepIndex : 0;

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;

        return (
          <div key={step.status} className="flex items-start space-x-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted 
                  ? isCurrent 
                    ? "bg-green-600 text-white ring-4 ring-green-100"
                    : "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}>
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-12 mt-1 ${
                  index < currentStepIndex ? "bg-green-200" : "bg-gray-200"
                }`} />
              )}
            </div>
            <div className="flex-1 pt-1">
              <p className={`text-sm font-medium ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                {step.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
              {isCurrent && complaint?.remarks && (
                <p className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded-lg">
                  Staff remarks: {complaint.remarks}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const EmptyState = ({ title, description, icon, action }) => (
  <div className="text-center py-12">
    <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
      {icon || (
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )}
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4">{description}</p>
    {action && action}
  </div>
);

// modal component with backdrop and close on outside click, also supports different sizes and has a header with title and close button
const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        
        <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} animate-fadeIn`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

// Chatbot Component
const ChatbotPanel = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Hi! I'm your ASTU assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { text: "How to submit a complaint?", icon: "📝" },
    { text: "Check complaint status", icon: "🔍" },
    { text: "What categories exist?", icon: "📋" },
    { text: "Resolution time?", icon: "⏱️" },
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: "bot",
        content: getBotResponse(inputMessage),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };


  //  chatbot response
  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("submit") || lowerMessage.includes("complaint")) {
      return "To submit a complaint: 1. Go to 'Submit Complaint' from the dashboard 2. Fill in the title and description 3. Select the appropriate category 4. Add an image if needed 5. Click submit. Would you like me to guide you through any specific step?";
    }
    if (lowerMessage.includes("status") || lowerMessage.includes("track")) {
      return "You can track your complaint status in the 'Track Progress' section. Each complaint shows its current status (Pending, Assigned, In Progress, or Resolved). Click on any complaint to see detailed progress.";
    }
    if (lowerMessage.includes("category")) {
      return "We have several categories: General, Academic, Finance, IT, Facility, and Discipline. Choose the one that best matches your issue for faster resolution.";
    }
    if (lowerMessage.includes("time") || lowerMessage.includes("how long")) {
      return "Resolution times vary by category: IT issues typically 24-48 hours, Academic 2-3 days, Facility 3-5 days. Complex issues may take longer. You'll get updates as your complaint progresses.";
    }
    return "I'm here to help with submitting complaints, tracking status, understanding categories, and general FAQs. Could you please rephrase your question or contact support for specific issues?";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl flex flex-col border-l border-gray-200 z-50 animate-slideIn">
      <div className="p-4 border-b border-gray-200 bg-linear-to-r from-blue-600 to-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold">AI</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Assistant</h3>
              <p className="text-xs text-blue-100"><span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                Online • Ready to help</p>
            </div>
          </div>
          {/* close button which is 'X'*/}
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      {/* content body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${message.type === "user" ? "text-blue-100" : "text-gray-400"}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
        {/* quick actions part-bottom  */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <p className="text-xs font-medium text-gray-500 mb-2">QUICK ACTIONS</p>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                setInputMessage(action.text);
                setTimeout(() => handleSendMessage(), 100);
              }}
              className="flex items-center space-x-2 p-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
            >
              <span>{action.icon}</span>
              <span className="truncate">{action.text}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* input text section */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Icon Components
const DashboardIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const SubmitIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const HistoryIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrackIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const ChatIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const LogoutIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const NotificationIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ComplaintIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PendingIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ProgressIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ResolvedIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Helper Functions
const categoryOptions = ["General", "Academic", "Finance", "IT", "Facility", "Discipline"];
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
const maxImageSizeBytes = 70 * 1024;
const maxDataUrlBytes = 90 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

function formatFileSize(size) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

// Main Component
function StudentDashboard() {
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeSection, setActiveSection] = useState("dashboard");
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
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
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [, setIsNotificationsOpen] = useState(false);

  // Fetch all complaints for dashboard
  const fetchAllComplaints = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/complaints?userId=${user.id}`);
      setComplaints(res.data);
    } catch (error) {
      console.error("Failed to fetch complaints", error);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchAllComplaints();
  }, [fetchAllComplaints]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousOverflow || "";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  // Fetch complaints based on section
  useEffect(() => {
    const fetchComplaints = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/complaints?userId=${user.id}`);
        setComplaints(res.data);
      } catch (error) {
        console.error("Failed to fetch complaints", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeSection === "history" || activeSection === "track") {
      fetchComplaints();
    }
  }, [activeSection, user?.id]);

  // Calculate dashboard metrics
  const metrics = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === COMPLAINT_STATUS.PENDING).length,
    inProgress: complaints.filter(c => c.status === COMPLAINT_STATUS.IN_PROGRESS || c.status === COMPLAINT_STATUS.ASSIGNED).length,
    resolved: complaints.filter(c => c.status === COMPLAINT_STATUS.RESOLVED).length,
  };

  // Logout
  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    localStorage.removeItem("user");
    navigate(ROUTES.LOGIN);
  };

  // Form handlers
  const handleComplaintChange = (event) => {
    const { name, value } = event.target;
    setComplaintData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (submissionFeedback.type !== "idle") {
      setSubmissionFeedback({ type: "idle", message: "" });
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImageError("");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // handling image selection with validation for type, size, and encoded data URL size
  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    setImageError("");

    if (!file) {
      setSelectedImage(null);
      return;
    }

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
      setImageError("Image is too large. Please use an image smaller than 70KB.");
      event.target.value = "";
      return;
    }

    setIsReadingImage(true);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const dataUrlBytes = new Blob([dataUrl]).size;
      if (dataUrlBytes > maxDataUrlBytes) {
        setSelectedImage(null);
        setImageError("Image is too large after encoding. Use a smaller image.");
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

  const resetForm = (clearFeedback = true) => {
    setComplaintData({
      title: "",
      description: "",
      category: "General",
    });
    clearImage();
    if (clearFeedback) {
      setSubmissionFeedback({ type: "idle", message: "" });
    }
  };

  // complaint submit handling
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
    setSubmissionFeedback({ type: "idle", message: "" });

    try {
      await axios.post(`${API_BASE_URL}/complaints`, {
        ...complaintData,
        userId: user.id,
        status: COMPLAINT_STATUS.PENDING,
        assignedDepartment: null,
        assignedTo: null,
        assignedStaffId: null,
        remarks: "",
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
        message: "Complaint submitted successfully!",
      });

      // Refresh complaints
      fetchAllComplaints();

      setTimeout(() => {
        setSubmissionFeedback({ type: "idle", message: "" });
      }, 5000);

      resetForm(false);
    } catch (error) {
      const isPayloadTooLarge = error?.response?.status === 413;
      setSubmissionFeedback({
        type: "error",
        message: isPayloadTooLarge
          ? "Image payload is too large. Use a smaller image."
          : "Failed to submit complaint. Please try again.",
      });
      setTimeout(() => {
        setSubmissionFeedback({ type: "idle", message: "" });
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackProgress = (complaint) => {
    setSelectedComplaint(complaint);
    setIsTrackModalOpen(true);
  };

  const handleSidebarNavigation = (sectionId) => {
    setActiveSection(sectionId);
    setIsSidebarOpen(false);
  };

  // Filter complaints by search term in title, description, or category
  const filteredComplaints = complaints.filter(complaint =>
    complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Navigation items
  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: DashboardIcon,
      helper: "Overview & statistics",
    },
    {
      id: "submit",
      label: "Submit Complaint",
      icon: SubmitIcon,
      helper: "Create a new complaint",
    },
    {
      id: "history",
      label: "History",
      icon: HistoryIcon,
      helper: "View all complaints",
    },
    {
      id: "track",
      label: "Track Progress",
      icon: TrackIcon,
      helper: "Monitor your complaints",
    },
  ];

  // Render functions for dashboard section
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Complaints"
          value={metrics.total}
          icon={<ComplaintIcon className="w-6 h-6" />}
          color="blue"
          subtitle="All time submissions"
        />
        <StatCard
          title="Pending"
          value={metrics.pending}
          icon={<PendingIcon className="w-6 h-6" />}
          color="amber"
          subtitle="Awaiting review"
        />
        <StatCard
          title="In Progress"
          value={metrics.inProgress}
          icon={<ProgressIcon className="w-6 h-6" />}
          color="purple"
          subtitle="Being handled"
        />
        <StatCard
          title="Resolved"
          value={metrics.resolved}
          icon={<ResolvedIcon className="w-6 h-6" />}
          color="green"
          subtitle="Completed"
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveSection("history")}
          >
            View All
          </Button>
        </div>

        {complaints.length === 0 ? (
          <EmptyState
            title="No complaints yet"
            description="Submit your first complaint to get started"
            action={
              <Button
                variant="primary"
                onClick={() => setActiveSection("submit")}
              >
                Submit Complaint
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {complaints.slice(0, 5).map((complaint) => (
              <div
                key={complaint.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleTrackProgress(complaint)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-sm font-medium text-gray-900">{complaint.title}</h3>
                    <StatusBadge status={complaint.status} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {complaint.category} • {new Date(complaint.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Tips */}
      <Card className="bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">✨ Quick Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-blue-600">1</span>
            </div>
            <p className="text-sm text-blue-800">Be specific in your complaint description</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-blue-600">2</span>
            </div>
            <p className="text-sm text-blue-800">Attach images to help explain the issue</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-blue-600">3</span>
            </div>
            <p className="text-sm text-blue-800">Track progress regularly for updates</p>
          </div>
        </div>
      </Card>
    </div>
  );
  //  render submit complaint form with image upload and validation
  const renderSubmitComplaint = () => (
    <div className="mx-auto w-full max-w-4xl">
      <Card>
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">Submit a New Complaint</h2>
          <p className="text-sm text-gray-500 mt-2">
            Please provide detailed information about your issue. The more specific you are, 
            the faster we can help resolve it.
          </p>
        </div>

        <form onSubmit={handleComplaintSubmit} className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              label="Title"
              placeholder="e.g., Issue with hostel WiFi"
              name="title"
              value={complaintData.title}
              onChange={handleComplaintChange}
              required
              className="bg-gray-50 focus:bg-white"
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                required
                value={complaintData.category}
                onChange={handleComplaintChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <TextArea
            label="Description"
            placeholder="Describe your issue in detail. Include dates, times, locations, and any other relevant information..."
            name="description"
            value={complaintData.description}
            onChange={handleComplaintChange}
            rows={6}
            required
            showCount
            maxLength={600}
            className="bg-gray-50 focus:bg-white"
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Attachment (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                ref={imageInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleImageChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP up to 70KB
                </p>
              </label>
            </div>
          </div>

          {selectedImage && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
                <img
                  src={selectedImage.dataUrl}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{selectedImage.fileName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(selectedImage.size)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearImage}
                    className="mt-2 text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isReadingImage && (
            <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center">
              <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing image...
            </div>
          )}

          {imageError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {imageError}
            </div>
          )}

          {submissionFeedback.type !== "idle" && (
            <div className={`text-sm p-4 rounded-lg flex items-center ${
              submissionFeedback.type === "success"
                ? "text-green-600 bg-green-50 border border-green-200"
                : "text-red-600 bg-red-50 border border-red-200"
            }`}>
              {submissionFeedback.type === "success" ? (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {submissionFeedback.message}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting || isReadingImage}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : "Submit Complaint"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={resetForm}
              className="w-full sm:w-auto"
            >
              Reset Form
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
  // render history section with search and track progress button for each complaint
  const renderHistory = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">Complaint History</h2>
        <div className="relative w-full sm:w-auto">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-80"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description={searchTerm ? "Try adjusting your search" : "You haven't submitted any complaints yet"}
          action={
            !searchTerm && (
              <Button
                variant="primary"
                onClick={() => setActiveSection("submit")}
              >
                Submit Your First Complaint
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredComplaints.map((complaint) => (
            <Card key={complaint.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => handleTrackProgress(complaint)}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                    <StatusBadge status={complaint.status} />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Ticket ID: #{complaint.id} • {complaint.category}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{complaint.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 sm:gap-4">
                    <span>Submitted: {new Date(complaint.createdAt).toLocaleString()}</span>
                    {complaint.remarks && <span>• Has staff remarks</span>}
                    {complaint.attachment && <span>• Has attachment</span>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTrackProgress(complaint);
                  }}
                  className="w-full sm:ml-4 sm:w-auto"
                >
                  Track Progress
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
  // render track progress section with complaint details and progress tracker component
  const renderTrackProgress = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">Track Complaint Progress</h2>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints to track"
          description="Submit a complaint first to track its progress"
          action={
            <Button
              variant="primary"
              onClick={() => setActiveSection("submit")}
            >
              Submit Complaint
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">SELECT COMPLAINT</h3>
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedComplaint?.id === complaint.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedComplaint(complaint)}
              >
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-gray-900">{complaint.title}</h4>
                  <StatusBadge status={complaint.status} />
                </div>
                <p className="text-xs text-gray-500">
                  {complaint.category} • {new Date(complaint.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedComplaint ? (
              <Card>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedComplaint.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Ticket #{selectedComplaint.id} • {selectedComplaint.category}
                  </p>
                </div>

                <ProgressTracker complaint={selectedComplaint} />

                {selectedComplaint.attachment?.dataUrl && (
                  <div className="mt-6">
                    <p className="text-xs font-medium text-gray-500 mb-2">ATTACHMENT</p>
                    <img
                      src={selectedComplaint.attachment.dataUrl}
                      alt="Attachment"
                      className="h-32 w-auto rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-400">
                    Submitted: {new Date(selectedComplaint.createdAt).toLocaleString()}
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="flex items-center justify-center py-12">
                <div className="text-center">
                  <TrackIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Select a complaint to view progress</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // rendering the page starts from here
  return (
    <div className="min-h-screen bg-gray-50">
      {submissionFeedback.type !== "idle" && (
        <div
          className={`fixed left-1/2 top-4 z-70 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border px-4 py-3 shadow-lg ${
            submissionFeedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {submissionFeedback.type === "success" ? (
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{submissionFeedback.message}</span>
          </div>
        </div>
      )}

      {isSidebarOpen && (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          type="button"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 h-screen w-72 border-r border-blue-900/40 bg-linear-to-b from-blue-950 via-blue-900 to-slate-900 shadow-[6px_0_24px_rgba(2,6,23,0.32)] transition-transform duration-300 lg:z-auto lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full min-h-screen flex-col overflow-hidden">
        <div className="p-6 border-b border-white/15">
          <div className="mb-3 flex justify-end lg:hidden">
            <button
              aria-label="Close sidebar"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
              onClick={() => setIsSidebarOpen(false)}
              type="button"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div>
              <h1 className="font-semibold text-white">ASTU Complaint Tracker</h1>
              <p className="text-xs text-blue-200/90">Student Dashboard</p>
            </div>
          </div>
        </div>
        {/* sidebar navigation items */}
        <nav className="min-h-0 flex-1 overflow-y-auto p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSidebarNavigation(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                  transition-all duration-200 group relative
                  ${isActive
                    ? "bg-blue-500/25 text-white ring-1 ring-cyan-300/35"
                    : "text-blue-100/90 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${
                  isActive ? "text-cyan-100" : "text-blue-200/90 group-hover:text-white"
                }`} />
                <div className="text-left">
                  <span className="text-sm font-medium block">{item.label}</span>
                  <span className={`text-xs ${isActive ? "text-cyan-100/85" : "text-blue-200/70"}`}>
                    {item.helper}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-300 rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>
          {/* chatbot and logout buttons at the bottom of sidebar */}
        <div className="p-4 border-t border-blue-900/30 space-y-2">
          <button
            onClick={() => setIsChatbotOpen(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-blue-100/90 hover:bg-white/10 hover:text-white transition-all duration-200 group"
          >
            <ChatIcon className="w-5 h-5 text-blue-200/90 group-hover:text-white" />
            <div className="text-left">
              <span className="text-sm font-medium block">Ask Assistant</span>
              <span className="text-xs text-blue-200/70">Get help & guidance</span>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-100/90 hover:bg-white/10 hover:text-white transition-all duration-200 group"
          >
            <LogoutIcon className="w-5 h-5 text-red-200 group-hover:text-white" />
            <div className="text-left">
              <span className="text-sm font-medium block">Logout</span>
              <span className="text-xs text-red-100/70">End session</span>
            </div>
          </button>
        </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
            <div className="flex items-start justify-between gap-3 sm:items-center">
              <div className="min-w-0">
                <div className="flex items-start gap-3 sm:items-center">
                  <button
                    type="button"
                    aria-label="Open sidebar"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 lg:hidden"
                    onClick={() => setIsSidebarOpen(true)}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className="min-w-0">
                    <h1 className="truncate text-xl font-semibold text-gray-900 sm:text-2xl">
                      {navigationItems.find(item => item.id === activeSection)?.label}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                      {navigationItems.find(item => item.id === activeSection)?.helper}
                    </p>
                  </div>
                </div>
              </div>
              {/* notification and user profile section */}
              <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                <button className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500" onClick={() => setIsNotificationsOpen(true)}>
                  <NotificationIcon className="w-6 h-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>

                </button>

                <div className="flex items-center space-x-2 rounded-xl border border-gray-200 bg-gray-50 px-2 py-1.5 sm:space-x-3 sm:px-3 sm:py-2">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-semibold">
                      {user?.name?.charAt(0) || "S"}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user?.name || "Student"}</p>
                    <p className="text-xs text-gray-500">Student</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          {activeSection === "dashboard" && renderDashboard()}
          {activeSection === "submit" && renderSubmitComplaint()}
          {activeSection === "history" && renderHistory()}
          {activeSection === "track" && renderTrackProgress()}
        </main>
      </div>

      {/* Chatbot Panel */}
      <ChatbotPanel isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />

      {/* Track Progress Modal (for history view) */}
      <Modal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        title="Track Progress"
        size="lg"
      >
        {selectedComplaint && (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedComplaint.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Ticket #{selectedComplaint.id} • {selectedComplaint.category}
                </p>
              </div>
              <StatusBadge status={selectedComplaint.status} />
            </div>

            <ProgressTracker complaint={selectedComplaint} />

            {selectedComplaint.attachment?.dataUrl && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">ATTACHMENT</p>
                <img
                  src={selectedComplaint.attachment.dataUrl}
                  alt="Attachment"
                  className="h-32 w-auto rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
        {/* logout confirmation modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm text-gray-600">
            Are you sure you want to log out from the student dashboard?
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancel
            </Button>
            <button
              type="button"
              onClick={confirmLogout}
              className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default StudentDashboard;
