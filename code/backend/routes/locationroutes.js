import express from 'express';
import auth from '../middleware/auth.js';
import Location from '../models/location.js';

const router = express.Router();

// GET /api/locations — list all
router.get('/', auth, async (req, res) => {
  try {
    const locations = await Location.find().sort({ city: 1 });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch locations', error: err.message });
  }
});

// POST /api/locations — add one
router.post('/', auth, async (req, res) => {
  try {
    const { city } = req.body;
    const loc = new Location({ city });
    await loc.save();
    res.status(201).json(loc);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create location', error: err.message });
  }
});

// DELETE /api/locations/:id — remove one
router.delete('/:id', auth, async (req, res) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: 'Location deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete location', error: err.message });
  }
});

export default router;
