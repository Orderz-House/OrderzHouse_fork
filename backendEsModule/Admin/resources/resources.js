import { createAdminsResource } from "./admins.js";
import { createClientsResource } from "./clients.js";
import { createFreelancersResource } from "./freelancers.js";
import { createProjectsResource } from "./projects.js";
import { createOffersResource } from "./offers.js";
import { createPaymentsResource } from "./payments.js";
import { createContentResources } from "./content.js";
import { createFinancialResources } from "./financial.js";
import { createSystemResource } from "./system.js";
import { createPlansResource } from "./plans.js";
import { createAppointmentsResource } from "./appointments.js";
import { createCourseResources } from "./courses.js";
// import { createChatsResource } from "./chats.js";
const addLoggingToResource = (resourceConfig, logAdminAction, pool) => {
  const actions = resourceConfig.options?.actions || {};

  const wrapAfter =
    (actionName, originalAfter) => async (response, request, context) => {
      if (originalAfter) {
        response = await originalAfter(response, request, context);
      }

      const { record, records, currentAdmin } = context;
      if (currentAdmin) {
        let logMessage = `Admin ${currentAdmin.email} executed "${actionName}"`;

        if (record) {
          logMessage += ` on ${record.resourceId} #${record.id?.()}`;
        }

        if (records && records.length > 0) {
          const ids = records.map((r) => r.id?.()).join(", ");
          logMessage += ` on ${records[0].resourceId} IDs: [${ids}]`;
        }

        await logAdminAction(
          currentAdmin.id,
          currentAdmin.email,
          logMessage,
          currentAdmin.role_id,
          pool
        );
      }

      return response;
    };

  // Wrap ALL actions, including defaults if not overridden
  const defaultActions = ["new", "edit", "delete", "list", "show"];
  const allActions = { ...actions };

  defaultActions.forEach((name) => {
    if (!allActions[name]) allActions[name] = {};
  });

  const wrappedActions = {};
  for (const [actionName, actionConfig] of Object.entries(allActions)) {
    wrappedActions[actionName] = {
      ...actionConfig,
      after: wrapAfter(actionName, actionConfig?.after),
    };
  }

  return {
    ...resourceConfig,
    options: {
      ...resourceConfig.options,
      actions: wrappedActions,
    },
  };
};

/**
 * Creates all resource configs and attaches logging
 */
export const createResourceConfigs = async (
  db,
  tableExists,
  logAdminAction,
  pool
) => {
  const resources = [];

  // User Management
  resources.push(await createAdminsResource(db, logAdminAction));
  resources.push(await createClientsResource(db, logAdminAction));
  resources.push(await createFreelancersResource(db, logAdminAction));

  // Projects
  resources.push(await createProjectsResource(db, tableExists, logAdminAction));

  // Offers
  resources.push(await createOffersResource(db, logAdminAction));

  // Payments
  resources.push(await createPaymentsResource(db, logAdminAction));

  // Content
  const contentResources = await createContentResources(
    db,
    tableExists,
    logAdminAction
  );
  resources.push(...contentResources);

  // Financial
  const financialResources = await createFinancialResources(
    db,
    tableExists,
    logAdminAction
  );
  resources.push(...financialResources);

  // Courses
  const courseResources = await createCourseResources(
    db,
    tableExists,
    logAdminAction
  );
  resources.push(...courseResources);

  // Other
  resources.push(await createPlansResource(db, logAdminAction));
  resources.push(await createAppointmentsResource(db, logAdminAction));
  resources.push(await createSystemResource(db, logAdminAction));

  // resources.push(await createChatsResource(db, logAdminAction));

  // ✅ Wrap every resource with logging for ALL actions
  return resources.map((r) => addLoggingToResource(r, logAdminAction, pool));
};
