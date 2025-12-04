import multer from 'multer';

// Create multer instance
const upload = multer({ storage: multer.memoryStorage() });

// Custom middleware to handle both JSON and form data
const handleJsonOrForm = (req, res, next) => {
  // Check if the request is JSON
  if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
    // If it's JSON, just call next
    return next();
  }
  
  // Otherwise, use multer to handle form data
  upload.fields([
    { name: "cover_pic", maxCount: 1 },
    { name: "project_files", maxCount: 10 },
  ])(req, res, next);
};

export default handleJsonOrForm;