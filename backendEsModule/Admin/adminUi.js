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
  UsersAnalytics: componentLoader.add(
    "UsersAnalytics",
    path.join(__dirname, "../../frontend/admin-components/Analytics/userAnalytics.jsx")
  ),
};

export { componentLoader, Components };
