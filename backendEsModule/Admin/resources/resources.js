import { createAdminsResource } from "./admins.js";
import { createClientsResource } from "./clients.js";
import { createFreelancersResource } from "./freelancers.js";
import { createProjectsResource } from "./projects.js";
import { createContentResources } from "./content.js";
import { createFinancialResources } from "./financial.js";
import { createSystemResource } from "./system.js";
import { createPlansResource } from "./plans.js";
import { createAppointmentsResource } from "./appointments.js";
import { createChatsResource } from "./chats.js"; 
export const createResourceConfigs = async (
  db,
  tableExists,
  logAdminAction
) => {
  const resources = [];

  resources.push(await createAdminsResource(db, logAdminAction));
  resources.push(await createClientsResource(db, logAdminAction));
  resources.push(await createFreelancersResource(db, logAdminAction));

  resources.push(await createProjectsResource(db, tableExists, logAdminAction));

  const contentResources = await createContentResources(
    db,
    tableExists,
    logAdminAction
  );
  resources.push(...contentResources);

  const financialResources = await createFinancialResources(
    db,
    tableExists,
    logAdminAction
  );
  resources.push(...financialResources);

  resources.push(await createPlansResource(db, logAdminAction));
  resources.push(await createAppointmentsResource(db, logAdminAction));

  resources.push(await createSystemResource(db, logAdminAction));

  resources.push(await createChatsResource(db, logAdminAction));

  return resources;
};
