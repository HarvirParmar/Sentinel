const Incident = require('../models/Incident');

const createIncident = async (req, res) => {
    try {
        const { title, description, category, severity } = req.body;

        const incident = await Incident.create({
            title,
            description,
            category,
            severity,
            reportedBy: req.user.id
        });

        res.status(201).json({
            message: 'Incident reported successfully',
            incident
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not create incident' });
    }
};

const getIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find()
            .populate('reportedBy', 'name email');

        res.status(200).json(incidents);
    } catch (error) {
        res.status(500).json({ message: 'Could not retrieve incidents' });
    }
};

const getIncident = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id)
            .populate('reportedBy', 'name email');

        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        res.status(200).json(incident);
    } catch (error) {
        res.status(500).json({ message: 'Could not retrieve incident' });
    }
};

const updateIncident = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        res.status(200).json({
            message: 'Incident updated successfully',
            incident
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not update incident' });
    }
};

const deleteIncident = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndDelete(req.params.id);

        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        res.status(200).json({ message: 'Incident deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Could not delete incident' });
    }
};

module.exports = {
    createIncident,
    getIncidents,
    getIncident,
    updateIncident,
    deleteIncident
};