export const adminThemeConfig = {
  colors: {
    // Primary colors - Blue gradient
    primary100: "#1e40af", // Deep blue
    primary80: "#2563eb", // Medium blue
    primary60: "#3b82f6", // Light blue
    primary40: "#60a5fa", // Lighter blue
    primary20: "#93c5fd", // Very light blue

    // Background colors
    bg: "#ffffff",
    hoverBg: "#f0f9ff", // Very light blue tint

    // Sidebar colors - Green theme
    sidebar: "#f0fdf4", // Very light green
    navigation: "#dcfce7", // Light green

    // Text colors
    text: "#0f172a", // Dark slate
    label: "#1e293b", // Slate

    // Border and accent colors
    border: "#e2e8f0",
    filterBg: "#ffffff",
    accent: "#10b981", // Green accent

    // Button colors
    button: "#059669", // Green
    buttonHover: "#047857", // Darker green
  },
  overrides: {
    // Sidebar styling with green theme
    ".adminjs_SidebarNav": {
      backgroundColor: "#f0fdf4 !important", // Light green background
      borderRight: "1px solid #d1fae5 !important",
      width: "240px !important",
      boxShadow: "0 0 0 1px rgba(16, 185, 129, 0.1), 0 1px 3px 0 rgba(16, 185, 129, 0.2) !important",
    },

    ".adminjs_Logo": {
      backgroundColor: "#f0fdf4 !important",
      padding: "20px 24px !important",
      borderBottom: "1px solid #d1fae5 !important",
      textAlign: "center !important",
    },

    ".adminjs_Logo img": {
      maxHeight: "40px !important",
      width: "auto !important",
    },

    ".adminjs_SidebarNavSection": {
      padding: "16px 0 !important",
    },

    ".adminjs_SidebarNavSectionTitle": {
      color: "#047857 !important", // Dark green
      fontSize: "11px !important",
      fontWeight: "700 !important",
      textTransform: "uppercase !important",
      letterSpacing: "0.8px !important",
      padding: "0 24px 8px 24px !important",
      margin: "0 !important",
    },

    ".adminjs_SidebarNavItem": {
      color: "#065f46 !important", // Dark green text
      padding: "10px 24px !important",
      margin: "0 8px !important",
      borderRadius: "8px !important",
      fontSize: "14px !important",
      fontWeight: "500 !important",
      transition: "all 0.2s ease !important",
      border: "1px solid transparent !important",
    },

    ".adminjs_SidebarNavItem:hover": {
      backgroundColor: "#dcfce7 !important", // Light green hover
      color: "#047857 !important",
      transform: "translateX(2px) !important",
      border: "1px solid #a7f3d0 !important",
      boxShadow: "0 2px 4px 0 rgba(16, 185, 129, 0.1) !important",
    },

    '.adminjs_SidebarNavItem.active, .adminjs_SidebarNavItem[aria-current="page"]': {
      backgroundColor: "#a7f3d0 !important", // Green active background
      color: "#065f46 !important",
      borderLeft: "4px solid #10b981 !important",
      fontWeight: "600 !important",
      border: "1px solid #6ee7b7 !important",
    },

    ".adminjs_SidebarNavItem svg": {
      marginRight: "12px !important",
      width: "18px !important",
      height: "18px !important",
      opacity: "0.8 !important",
      color: "#059669 !important",
    },

    ".adminjs_SidebarNavItem:hover svg": {
      opacity: "1 !important",
      color: "#047857 !important",
    },

    // Top bar with blue theme
    ".adminjs_TopBar": {
      backgroundColor: "#1e40af !important", // Deep blue
      borderBottom: "1px solid #2563eb !important",
      boxShadow: "0 2px 4px 0 rgba(30, 64, 175, 0.2) !important",
      height: "65px !important",
      padding: "0 24px !important",
    },

    ".adminjs_TopBar *": {
      color: "#ffffff !important",
    },

    // Main content area
    ".adminjs_Wrapper": {
      backgroundColor: "#fafafa !important",
    },

    ".adminjs_WrapperBox": {
      backgroundColor: "#ffffff !important",
      padding: "24px !important",
      margin: "16px !important",
      borderRadius: "12px !important",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important",
      border: "1px solid #e2e8f0 !important",
    },

    // Headers
    ".adminjs_H1, .adminjs_H2, .adminjs_H3, .adminjs_H4, .adminjs_H5, .adminjs_H6": {
      color: "#0f172a !important",
      fontWeight: "600 !important",
    },

    // Labels
    ".adminjs_Label, .adminjs_PropertyLabel": {
      color: "#374151 !important",
      fontWeight: "500 !important",
    },

    // Current user navigation
    ".adminjs_CurrentUserNav": {
      color: "#ffffff !important",
    },

    // Buttons with blue theme
    ".adminjs_Button": {
      borderRadius: "8px !important",
      fontWeight: "600 !important",
      transition: "all 0.2s ease !important",
      padding: "8px 16px !important",
    },

    ".adminjs_Button--primary": {
      backgroundColor: "#2563eb !important",
      borderColor: "#2563eb !important",
    },

    ".adminjs_Button--primary:hover": {
      backgroundColor: "#1d4ed8 !important",
      borderColor: "#1d4ed8 !important",
      transform: "translateY(-1px) !important",
      boxShadow: "0 4px 8px 0 rgba(37, 99, 235, 0.3) !important",
    },

    ".adminjs_Button--success": {
      backgroundColor: "#10b981 !important",
      borderColor: "#10b981 !important",
    },

    ".adminjs_Button--success:hover": {
      backgroundColor: "#059669 !important",
      borderColor: "#059669 !important",
    },

    // Tables
    ".adminjs_Table": {
      borderRadius: "12px !important",
      overflow: "hidden !important",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1) !important",
      border: "1px solid #e2e8f0 !important",
    },

    ".adminjs_TableHead": {
      backgroundColor: "#f8fafc !important",
      borderBottom: "2px solid #e2e8f0 !important",
    },

    ".adminjs_TableHead th": {
      color: "#374151 !important",
      fontWeight: "600 !important",
      padding: "16px !important",
    },

    ".adminjs_TableRow:hover": {
      backgroundColor: "#f0f9ff !important",
    },

    // Boxes and cards
    ".adminjs_Box": {
      borderRadius: "12px !important",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1) !important",
      border: "1px solid #e2e8f0 !important",
      padding: "20px !important",
    },

    // Breadcrumbs
    ".adminjs_Breadcrumbs": {
      color: "#6b7280 !important",
    },

    // Login page styling
    ".adminjs_Login": {
      background: "linear-gradient(135deg, #1e40af 0%, #10b981 100%) !important",
      minHeight: "100vh !important",
    },

    ".adminjs_LoginCard": {
      borderRadius: "16px !important",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important",
      border: "1px solid rgba(255, 255, 255, 0.2) !important",
    },

    // Form inputs
    ".adminjs_Input": {
      borderRadius: "8px !important",
      border: "1px solid #d1d5db !important",
      transition: "all 0.2s ease !important",
    },

    ".adminjs_Input:focus": {
      borderColor: "#3b82f6 !important",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1) !important",
    },

    // Error messages
    ".adminjs_MessageBox--danger": {
      backgroundColor: "#fef2f2 !important",
      borderColor: "#fca5a5 !important",
      color: "#991b1b !important",
      borderRadius: "8px !important",
    },

    // Success messages
    ".adminjs_MessageBox--success": {
      backgroundColor: "#f0fdf4 !important",
      borderColor: "#86efac !important",
      color: "#166534 !important",
      borderRadius: "8px !important",
    },

    // Additional form styling
    ".adminjs_FormGroup": {
      marginBottom: "20px !important",
    },

    ".adminjs_Section": {
      backgroundColor: "#ffffff !important",
      border: "1px solid #e2e8f0 !important",
      borderRadius: "12px !important",
      marginBottom: "24px !important",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1) !important",
    },

    ".adminjs_SectionTitle": {
      color: "#0f172a !important",
      fontWeight: "600 !important",
      borderBottom: "1px solid #e2e8f0 !important",
      padding: "16px 20px !important",
      backgroundColor: "#f8fafc !important",
      borderTopLeftRadius: "12px !important",
      borderTopRightRadius: "12px !important",
    },

    // Filter styling
    ".adminjs_FilterDrawer": {
      backgroundColor: "#ffffff !important",
      border: "1px solid #e2e8f0 !important",
      borderRadius: "12px !important",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1) !important",
    },

    // Pagination
    ".adminjs_Pagination": {
      display: "flex !important",
      justifyContent: "center !important",
      marginTop: "24px !important",
    },

    ".adminjs_PaginationItem": {
      margin: "0 4px !important",
      borderRadius: "6px !important",
    },

    // Action buttons
    ".adminjs_ActionButton": {
      borderRadius: "6px !important",
      fontWeight: "500 !important",
      fontSize: "14px !important",
    },

    // Dropzone styling
    ".adminjs_DropZone": {
      border: "2px dashed #d1d5db !important",
      borderRadius: "8px !important",
      backgroundColor: "#f9fafb !important",
      transition: "all 0.2s ease !important",
    },

    ".adminjs_DropZone:hover": {
      borderColor: "#3b82f6 !important",
      backgroundColor: "#f0f9ff !important",
    },

    // Progress bars
    ".adminjs_ProgressBar": {
      backgroundColor: "#e5e7eb !important",
      borderRadius: "4px !important",
      overflow: "hidden !important",
    },

    ".adminjs_ProgressBar_Fill": {
      backgroundColor: "#10b981 !important",
      borderRadius: "4px !important",
      transition: "width 0.3s ease !important",
    },

    // Modal styling
    ".adminjs_Modal": {
      borderRadius: "12px !important",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important",
    },

    ".adminjs_ModalHeader": {
      borderBottom: "1px solid #e2e8f0 !important",
      padding: "20px 24px !important",
      backgroundColor: "#f8fafc !important",
      borderTopLeftRadius: "12px !important",
      borderTopRightRadius: "12px !important",
    },

    ".adminjs_ModalBody": {
      padding: "24px !important",
    },

    ".adminjs_ModalFooter": {
      borderTop: "1px solid #e2e8f0 !important",
      padding: "16px 24px !important",
      backgroundColor: "#f8fafc !important",
      borderBottomLeftRadius: "12px !important",
      borderBottomRightRadius: "12px !important",
    },

    // Search input
    ".adminjs_SearchInput": {
      borderRadius: "8px !important",
      border: "1px solid #d1d5db !important",
      padding: "8px 12px !important",
      fontSize: "14px !important",
      transition: "all 0.2s ease !important",
    },

    ".adminjs_SearchInput:focus": {
      borderColor: "#3b82f6 !important",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1) !important",
      outline: "none !important",
    },

    // Tabs styling
    ".adminjs_Tabs": {
      borderBottom: "1px solid #e2e8f0 !important",
      marginBottom: "24px !important",
    },

    ".adminjs_Tab": {
      padding: "12px 16px !important",
      borderRadius: "6px 6px 0 0 !important",
      marginRight: "4px !important",
      backgroundColor: "transparent !important",
      border: "1px solid transparent !important",
      color: "#6b7280 !important",
      fontWeight: "500 !important",
    },

    ".adminjs_Tab:hover": {
      backgroundColor: "#f9fafb !important",
      color: "#374151 !important",
    },

    ".adminjs_Tab--active": {
      backgroundColor: "#ffffff !important",
      color: "#0f172a !important",
      borderColor: "#e2e8f0 !important",
      borderBottom: "1px solid #ffffff !important",
      marginBottom: "-1px !important",
      fontWeight: "600 !important",
    },

    // Status indicators
    ".adminjs_StatusBadge": {
      padding: "4px 8px !important",
      borderRadius: "4px !important",
      fontSize: "12px !important",
      fontWeight: "500 !important",
    },

    ".adminjs_StatusBadge--success": {
      backgroundColor: "#d1fae5 !important",
      color: "#065f46 !important",
    },

    ".adminjs_StatusBadge--warning": {
      backgroundColor: "#fef3c7 !important",
      color: "#92400e !important",
    },

    ".adminjs_StatusBadge--error": {
      backgroundColor: "#fee2e2 !important",
      color: "#991b1b !important",
    },

    // Loading spinner
    ".adminjs_Spinner": {
      borderColor: "#e5e7eb !important",
      borderTopColor: "#3b82f6 !important",
    },

    // Tooltip
    ".adminjs_Tooltip": {
      backgroundColor: "#1f2937 !important",
      color: "#ffffff !important",
      borderRadius: "6px !important",
      fontSize: "12px !important",
      padding: "6px 8px !important",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1) !important",
    },

    // Card hover effects
    ".adminjs_Card:hover": {
      transform: "translateY(-1px) !important",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important",
    },

    // Responsive adjustments
    "@media (max-width: 768px)": {
      ".adminjs_SidebarNav": {
        width: "100% !important",
        position: "fixed !important",
        zIndex: "1000 !important",
        transform: "translateX(-100%) !important",
        transition: "transform 0.3s ease !important",
      },
      
      ".adminjs_SidebarNav--open": {
        transform: "translateX(0) !important",
      },

      ".adminjs_WrapperBox": {
        margin: "8px !important",
        padding: "16px !important",
      },

      ".adminjs_TopBar": {
        padding: "0 16px !important",
      },
    },
  },
};

// CSS string for React component approach
export const themeCSS = `
/* Sidebar styling with green theme */
.adminjs_SidebarNav {
  background-color: #f0fdf4 !important;
  border-right: 1px solid #d1fae5 !important;
  width: 240px !important;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.1), 0 1px 3px 0 rgba(16, 185, 129, 0.2) !important;
}

.adminjs_Logo {
  background-color: #f0fdf4 !important;
  padding: 20px 24px !important;
  border-bottom: 1px solid #d1fae5 !important;
  text-align: center !important;
}

.adminjs_Logo img {
  max-height: 40px !important;
  width: auto !important;
}

.adminjs_SidebarNavSection {
  padding: 16px 0 !important;
}

.adminjs_SidebarNavSectionTitle {
  color: #047857 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.8px !important;
  padding: 0 24px 8px 24px !important;
  margin: 0 !important;
}

.adminjs_SidebarNavItem {
  color: #065f46 !important;
  padding: 10px 24px !important;
  margin: 0 8px !important;
  border-radius: 8px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
  border: 1px solid transparent !important;
}

.adminjs_SidebarNavItem:hover {
  background-color: #dcfce7 !important;
  color: #047857 !important;
  transform: translateX(2px) !important;
  border: 1px solid #a7f3d0 !important;
  box-shadow: 0 2px 4px 0 rgba(16, 185, 129, 0.1) !important;
}

.adminjs_SidebarNavItem.active, 
.adminjs_SidebarNavItem[aria-current="page"] {
  background-color: #a7f3d0 !important;
  color: #065f46 !important;
  border-left: 4px solid #10b981 !important;
  font-weight: 600 !important;
  border: 1px solid #6ee7b7 !important;
}

.adminjs_SidebarNavItem svg {
  margin-right: 12px !important;
  width: 18px !important;
  height: 18px !important;
  opacity: 0.8 !important;
  color: #059669 !important;
}

.adminjs_SidebarNavItem:hover svg {
  opacity: 1 !important;
  color: #047857 !important;
}

/* Top bar with blue theme */
.adminjs_TopBar {
  background-color: #1e40af !important;
  border-bottom: 1px solid #2563eb !important;
  box-shadow: 0 2px 4px 0 rgba(30, 64, 175, 0.2) !important;
  height: 65px !important;
  padding: 0 24px !important;
}

.adminjs_TopBar * {
  color: #ffffff !important;
}

/* Main content area */
.adminjs_Wrapper {
  background-color: #fafafa !important;
}

.adminjs_WrapperBox {
  background-color: #ffffff !important;
  padding: 24px !important;
  margin: 16px !important;
  border-radius: 12px !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
  border: 1px solid #e2e8f0 !important;
}

/* Headers */
.adminjs_H1, .adminjs_H2, .adminjs_H3, .adminjs_H4, .adminjs_H5, .adminjs_H6 {
  color: #0f172a !important;
  font-weight: 600 !important;
}

/* Labels */
.adminjs_Label, .adminjs_PropertyLabel {
  color: #374151 !important;
  font-weight: 500 !important;
}

/* Current user navigation */
.adminjs_CurrentUserNav {
  color: #ffffff !important;
}

/* Buttons with blue theme */
.adminjs_Button {
  border-radius: 8px !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
  padding: 8px 16px !important;
}

.adminjs_Button--primary {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
}

.adminjs_Button--primary:hover {
  background-color: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 8px 0 rgba(37, 99, 235, 0.3) !important;
}

.adminjs_Button--success {
  background-color: #10b981 !important;
  border-color: #10b981 !important;
}

.adminjs_Button--success:hover {
  background-color: #059669 !important;
  border-color: #059669 !important;
}

/* Tables */
.adminjs_Table {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
  border: 1px solid #e2e8f0 !important;
}

.adminjs_TableHead {
  background-color: #f8fafc !important;
  border-bottom: 2px solid #e2e8f0 !important;
}

.adminjs_TableHead th {
  color: #374151 !important;
  font-weight: 600 !important;
  padding: 16px !important;
}

.adminjs_TableRow:hover {
  background-color: #f0f9ff !important;
}

/* Boxes and cards */
.adminjs_Box {
  border-radius: 12px !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
  border: 1px solid #e2e8f0 !important;
  padding: 20px !important;
}

/* Breadcrumbs */
.adminjs_Breadcrumbs {
  color: #6b7280 !important;
}

/* Login page styling */
.adminjs_Login {
  background: linear-gradient(135deg, #1e40af 0%, #10b981 100%) !important;
  min-height: 100vh !important;
}

.adminjs_LoginCard {
  border-radius: 16px !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

/* Form inputs */
.adminjs_Input {
  border-radius: 8px !important;
  border: 1px solid #d1d5db !important;
  transition: all 0.2s ease !important;
}

.adminjs_Input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

/* Error messages */
.adminjs_MessageBox--danger {
  background-color: #fef2f2 !important;
  border-color: #fca5a5 !important;
  color: #991b1b !important;
  border-radius: 8px !important;
}

/* Success messages */
.adminjs_MessageBox--success {
  background-color: #f0fdf4 !important;
  border-color: #86efac !important;
  color: #166534 !important;
  border-radius: 8px !important;
}

/* Additional enhanced styling */
.adminjs_FormGroup {
  margin-bottom: 20px !important;
}

.adminjs_Section {
  background-color: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  margin-bottom: 24px !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
}

.adminjs_SectionTitle {
  color: #0f172a !important;
  font-weight: 600 !important;
  border-bottom: 1px solid #e2e8f0 !important;
  padding: 16px 20px !important;
  background-color: #f8fafc !important;
  border-top-left-radius: 12px !important;
  border-top-right-radius: 12px !important;
}

.adminjs_FilterDrawer {
  background-color: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
}

.adminjs_Card:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .adminjs_SidebarNav {
    width: 100% !important;
  }
  
  .adminjs_WrapperBox {
    margin: 8px !important;
    padding: 16px !important;
  }
  
  .adminjs_TopBar {
    padding: 0 16px !important;
  }
}
`;

export default { adminThemeConfig, themeCSS };