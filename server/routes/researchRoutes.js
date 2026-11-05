const express = require('express');
const c = require('../controllers/researchController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', c.getPublicResearch);
// "/mine" MUST be registered before "/:id", otherwise Express treats "mine" as an id
router.get('/mine', protect, authorize('faculty', 'admin'), c.getMyResearch);
router.get('/:id', optionalAuth, c.getResearchById);
router.post('/', protect, authorize('faculty', 'admin'), c.createResearch);
router.put('/:id', protect, authorize('faculty', 'admin'), c.updateResearch);
router.delete('/:id', protect, authorize('faculty', 'admin'), c.deleteResearch);

module.exports = router;
