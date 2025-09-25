import React, { useEffect } from "react";
import { themeCSS } from "./theme.js";

const AdminTheme = () => {
  useEffect(() => {
    // Inject custom theme CSS
    const style = document.createElement("style");
    style.id = "adminjs-custom-theme";
    style.textContent = themeCSS;
    const existingStyle = document.getElementById("adminjs-custom-theme");
    if (existingStyle) existingStyle.remove();
    document.head.appendChild(style);

    // Sidebar animation + accordion functionality
    const enhanceSidebar = () => {
      const sidebar = document.querySelector(".adminjs_Sidebar");
      if (!sidebar) return;

      // Tailwind classes for smooth transition
      sidebar.classList.add("transition-all", "duration-300", "ease-in-out");

      const folders = Array.from(
        document.querySelectorAll(".adminjs_SidebarNavItem.adminjs_SidebarGroup")
      );

      folders.forEach((folder) => {
        const folderHeader = folder.querySelector("button, .adminjs_SidebarNavLink");
        const folderContent = folder.querySelector(".adminjs_SidebarNavItems");

        if (!folderContent || folder.dataset.init) return;

        folderContent.classList.add("overflow-hidden", "transition-max-height", "duration-300", "ease-in-out");
        folderContent.style.maxHeight = "0px"; // initially collapsed

        folderHeader.addEventListener("click", () => {
          // Close all other folders
          folders.forEach((f) => {
            const content = f.querySelector(".adminjs_SidebarNavItems");
            if (f !== folder && content) content.style.maxHeight = "0px";
          });

          // Toggle current folder
          const isOpen = folderContent.style.maxHeight !== "0px";
          folderContent.style.maxHeight = isOpen ? "0px" : `${folderContent.scrollHeight}px`;
        });

        folder.dataset.init = "true"; // avoid double-binding
      });

      // Move Pages folder from bottom to top
      const pagesItem = document.querySelector(".adminjs_SidebarNavItem[data-id='pages']");
      if (pagesItem && sidebar.firstChild !== pagesItem) {
        sidebar.insertBefore(pagesItem, sidebar.firstChild);
      }
    };

    // Run once after mount + on DOM changes
    const timeoutId = setTimeout(enhanceSidebar, 100);
    const observer = new MutationObserver(enhanceSidebar);
    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      const styleEl = document.getElementById("adminjs-custom-theme");
      if (styleEl) styleEl.remove();
    };
  }, []);

  return null;
};

export default AdminTheme;
