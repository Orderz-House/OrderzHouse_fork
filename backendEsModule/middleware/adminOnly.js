const adminOnly = (req, res, next) => {
  try {
    console.log(req.token);
    
    const tokenData = req.token; 
    
    if (!tokenData) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - No token provided" 
      });
    }

    const roleId = tokenData.role || tokenData.roleId || (tokenData.data && tokenData.data.role) || (tokenData.user && tokenData.user.role_id);
    
    if (Number(roleId) !== 1 && Number(roleId) !== 4) {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden - Admin access required" 
      });
    }

    next();
  } catch (error) {
    console.error("adminOnly error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error in admin verification" 
    });
  }
};

export default adminOnly;