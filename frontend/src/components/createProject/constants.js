import {
  FileText,
  Upload,
  Users,
  CreditCard,
  DollarSign,
  Clock,
  User,
} from "lucide-react";

export const API_BASE = "http://localhost:5000";

export const STEPS = [
  { id: 1, title: "Project Type & Assignment", icon: FileText },
  { id: 2, title: "Project Details", icon: Upload },
  { id: 3, title: "Select Freelancers", icon: Users },
  { id: 4, title: "Payment & Activation", icon: CreditCard },
];

export const PROJECT_TYPES = [
  {
    type: "fixed",
    icon: DollarSign,
    title: "Fixed Price",
    desc: "Set a fixed budget for the entire project",
  },
  {
    type: "bidding",
    icon: FileText,
    title: "Bidding",
    desc: "Let freelancers bid on your project",
  },
  {
    type: "hourly",
    icon: Clock,
    title: "Hourly Rate",
    desc: "Pay by the hour for flexible work",
  },
];

export const ASSIGNMENT_TYPES = [
  {
    type: "solo",
    icon: User,
    title: "Solo Project",
    desc: "Perfect for tasks requiring focused individual expertise",
  },
  {
    type: "team",
    icon: Users,
    title: "Team Project",
    desc: "Ideal for complex projects requiring multiple specialists",
  },
];

export const GUIDELINES = [
  {
    title: "Be Clear & Specific",
    desc: "Provide detailed descriptions of your project requirements, deliverables, and expectations.",
  },
  {
    title: "Set Realistic Budgets",
    desc: "Research market rates and set fair budgets that attract quality freelancers.",
  },
  {
    title: "Define Milestones",
    desc: "Break larger projects into smaller milestones for better tracking and payments.",
  },
  {
    title: "Communication is Key",
    desc: "Respond promptly to questions and provide feedback to freelancers regularly.",
  },
  {
    title: "Upload References",
    desc: "Include examples, mockups, or reference files to clarify your vision.",
  },
  {
    title: "Professional Tone",
    desc: "Maintain a professional and respectful tone in all project communications.",
  },
  {
    title: "Realistic Deadlines",
    desc: "Set achievable timelines that give freelancers adequate time to deliver quality work.",
  },
];

export const INITIAL_FORM_STATE = {
  category_id: "",
  title: "",
  description: "",
  project_type: "",
  budget: "",
  budget_min: "",
  budget_max: "",
  hourly_rate: "",
  duration_type: "days",
  duration_days: 30,
  duration_hours: "",
  preferred_skills: [],
  assignment_type: "",
};