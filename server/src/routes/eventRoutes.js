import express from 'express';
import { getEvents, getEventStats, createEvent, updateEventStatus, deleteEvent } from '../controllers/eventController.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/stats', getEventStats);
router.post('/', createEvent);
router.put('/:id/status', updateEventStatus);
router.delete('/:id', deleteEvent);

export default router;
