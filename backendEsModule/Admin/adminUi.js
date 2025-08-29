import { ComponentLoader } from "adminjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentLoader = new ComponentLoader();

const Components = {
  Dashboard: componentLoader.add(
    "Dashboard",
    path.join(__dirname, "../../frontend/admin-components/dashboard.jsx")
  ),
  
  Analytics: componentLoader.add(
    "Analytics",
    path.join(__dirname, "../../frontend/admin-components/analytics.jsx")
  ),
  
  // UsersPage: componentLoader.add(
  //   "UsersPage", 
  //   path.join(__dirname, "../../frontend/admin-components/users-page.jsx")
  // ),
  
  // CoursesPage: componentLoader.add(
  //   "CoursesPage",
  //   path.join(__dirname, "../../frontend/admin-components/courses-page.jsx")
  // ),
  
  // AppointmentsPage: componentLoader.add(
  //   "AppointmentsPage",
  //   path.join(__dirname, "../../frontend/admin-components/appointments-page.jsx")
  // ),
  
  // OrdersPage: componentLoader.add(
  //   "OrdersPage",
  //   path.join(__dirname, "../../frontend/admin-components/orders-page.jsx")
  // ),
  
  // // Custom form components
  // RichTextEditor: componentLoader.add(
  //   "RichTextEditor",
  //   path.join(__dirname, "../../frontend/admin-components/rich-text-editor.jsx")
  // ),
  
  // ImageUploader: componentLoader.add(
  //   "ImageUploader",
  //   path.join(__dirname, "../../frontend/admin-components/image-uploader.jsx")
  // ),
  
  // UsersList: componentLoader.add(
  //   "UsersList",
  //   path.join(__dirname, "../../frontend/admin-components/users-list.jsx")
  // ),
  
  // CoursesList: componentLoader.add(
  //   "CoursesList",
  //   path.join(__dirname, "../../frontend/admin-components/courses-list.jsx")
  // ),
  
  // ProjectsList: componentLoader.add(
  //   "ProjectsList",
  //   path.join(__dirname, "../../frontend/admin-components/projects-list.jsx")
  // ),
  
  // // Status components
  // StatusBadge: componentLoader.add(
  //   "StatusBadge",
  //   path.join(__dirname, "../../frontend/admin-components/status-badge.jsx")
  // ),
  
  // // Charts and visualization
  // ChartComponent: componentLoader.add(
  //   "ChartComponent",
  //   path.join(__dirname, "../../frontend/admin-components/chart-component.jsx")
  // ),
  
  // MetricsCard: componentLoader.add(
  //   "MetricsCard",
  //   path.join(__dirname, "../../frontend/admin-components/metrics-card.jsx")
  // ),
  
  // Reports: componentLoader.add(
  //   "Reports",
  //   path.join(__dirname, "../../frontend/admin-components/reports.jsx")
  // ),
  
  UserAnalytics: componentLoader.add(
    "UserAnalytics",
    path.join(__dirname, "../../frontend/admin-components/analytics.jsx")
  ),
  
  // RevenueChart: componentLoader.add(
  //   "RevenueChart",
  //   path.join(__dirname, "../../frontend/admin-components/revenue-chart.jsx")
  // ),
};

export { componentLoader, Components };
