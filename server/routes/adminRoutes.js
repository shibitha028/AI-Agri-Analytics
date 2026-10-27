const express = require('express');
const router = express.Router();
const {
  uploadDataset,
  importDataset,
  getUsers,
  getUploadHistory,
  getAdminDashboard
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.post('/upload', upload.single('file'), uploadDataset);
router.post('/import', importDataset);
router.get('/users', getUsers);
router.get('/uploads', getUploadHistory);

module.exports = router;
