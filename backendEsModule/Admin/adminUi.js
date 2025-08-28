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
};

export { componentLoader, Components };
