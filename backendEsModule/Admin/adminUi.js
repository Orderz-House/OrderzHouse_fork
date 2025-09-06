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
  // Course Components
  RelatedMaterials: componentLoader.add(
    "RelatedMaterials",
    path.join(__dirname, "../../frontend/admin-components/course-components.jsx")
  ),
  RelatedEnrollments: componentLoader.add(
    "RelatedEnrollments",
    path.join(__dirname, "../../frontend/admin-components/course-components.jsx")
  ),
};

export { componentLoader, Components };