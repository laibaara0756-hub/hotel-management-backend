const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
   
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized. Please login first.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. You do not have permission.",
      });
    }

    // User has permission
    next();
  };
};

export default roleMiddleware;