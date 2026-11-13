const express = require('express');
const router = express.Router();

const {
    createIncident,
    getIncidents,
    getIncident,
    updateIncident,
    deleteIncident
} = require('../controllers/incidentController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createIncident);
router.get('/', protect, getIncidents);
router.get('/:id', protect, getIncident);
router.put('/:id', protect, adminOnly, updateIncident);
router.delete('/:id', protect, adminOnly, deleteIncident);

module.exports = router;