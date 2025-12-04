const adminViewerOnly = (req, res, next) => {
  try {
    const tokenData = req.token; 
    
    if (!tokenData) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - No token provided" 
      });
    }

    const roleId = tokenData.role_id || tokenData.role;
    
    // Check if user has role_id = 4 (Admin Viewer)
    if (Number(roleId) !== 4) {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden - Admin Viewer access required" 
      });
    }

    next();
  } catch (error) {
    console.error("adminViewerOnly error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error in admin viewer verification" 
    });
  }
};

export default adminViewerOnly;