import { ComponentLoader } from "adminjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentLoader = new ComponentLoader();

const Components = {
  Dashboard: componentLoader.add(
    "Dashboard",
    path.join(__dirname, "../../frontend/admin-components/Dashboard.jsx")
  ),
  // Analytics: componentLoader.add(
  //   "Analytics",
  //   path.join(__dirname, "../../frontend/admin-components/Analytics.jsx")
  // ),
  // UsersPage: componentLoader.add(
  //   "UsersPage",
  //   path.join(__dirname, "../../frontend/admin-components/UsersPage.jsx")
  // ),
  // CoursesPage: componentLoader.add(
  //   "CoursesPage",
  //   path.join(__dirname, "../../frontend/admin-components/CoursesPage.jsx")
  // ),
  // AppointmentsPage: componentLoader.add(
  //   "AppointmentsPage",
  //   path.join(__dirname, "../../frontend/admin-components/AppointmentsPage.jsx")
  // ),
  // OrdersPage: componentLoader.add(
  //   "OrdersPage",
  //   path.join(__dirname, "../../frontend/admin-components/OrdersPage.jsx")
  // ),
};

export { componentLoader, Components };
