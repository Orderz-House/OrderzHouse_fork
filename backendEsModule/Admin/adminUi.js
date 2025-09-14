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
  // Analytics: componentLoader.add(
  //   "Analytics",
  //   path.join(__dirname, "../../frontend/admin-components/analytics.jsx")
  // ),
  UsersAnalytics: componentLoader.add(
    "UsersAnalytics",
    path.join(
      __dirname,
      "../../frontend/admin-components/Analytics/userAnalytics.jsx"
    )
  ),
  UserManagement: componentLoader.add(
    "UserManagement",
    path.join(__dirname, "../../frontend/admin-components/userManagement.jsx")
  ),
  AdminProjectsDashboard: componentLoader.add(
    "AdminProjectsDashboard",
    path.join(
      __dirname,
      "../../frontend/admin-components/projectManagement.jsx"
    )
  ),
  AdminManagement: componentLoader.add(
    "AdminManagement",
    path.join(__dirname, "../../frontend/admin-components/adminsManagement.jsx")
  ),
  PlansManager: componentLoader.add(
    "PlansManager",
    path.join(__dirname, "../../frontend/admin-components/plansManagement.jsx")
  ),
  // ClientsManagement: componentLoader.add(
  //   "ClientsManagement",
  //   path.join(__dirname, "../../frontend/admin-components/clientsManagement.jsx")
  // ),
  // FreelancersManagement: componentLoader.add(
  //   "FreelancersManagement",
  //   path.join(__dirname, "../../frontend/admin-components/freelancersManagement.jsx")
  // ),
};

export { componentLoader, Components };
