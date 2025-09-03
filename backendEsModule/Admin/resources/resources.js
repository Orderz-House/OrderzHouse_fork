import { createAdminsResource } from "./admins.js";
import { createClientsResource } from "./clients.js";
import { createFreelancersResource } from "./freelancers.js";
import { createProjectsResource } from "./projects.js";
import { createContentResources } from "./content.js";
import { createFinancialResources } from "./financial.js";
import { createSystemResource } from "./system.js";
import { createPlansResource } from "./plans.js";
import { createAppointmentsResource } from "./appointments.js";

export const createResourceConfigs = async (
  db,
  tableExists,
  logAdminAction
) => {
  const resources = [];

  // User Management Resources
  resources.push(await createAdminsResource(db, logAdminAction));
  resources.push(await createClientsResource(db, logAdminAction));
  resources.push(await createFreelancersResource(db, logAdminAction));

  // Project Management Resources
  resources.push(await createProjectsResource(db, tableExists, logAdminAction));

  // Content Management Resources
  const contentResources = await createContentResources(
    db,
    tableExists,
    logAdminAction
  );
  resources.push(...contentResources);

  // Financial Management Resources
  const financialResources = await createFinancialResources(
    db,
    tableExists,
    logAdminAction
  );
  resources.push(...financialResources);

  // Plans & Appointments Resources
  resources.push(await createPlansResource(db, logAdminAction));
  resources.push(await createAppointmentsResource(db, logAdminAction));

  // System Management Resources
  resources.push(await createSystemResource(db, logAdminAction));

  return resources;
};
