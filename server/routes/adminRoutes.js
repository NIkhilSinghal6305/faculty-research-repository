const express = require('express');
const c = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// Every admin route requires login AND the admin role (enforced on the server)
router.use(protect, authorize('admin'));

router.get('/users', c.getUsers);
router.put('/users/:id/role', c.changeUserRole);
router.delete('/users/:id', c.deleteUser);
router.get('/research', c.getAllResearch);
router.get('/stats', c.getStats);

module.exports = router;
