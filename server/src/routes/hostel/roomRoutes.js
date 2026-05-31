import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { authorizeRoles } from '../../middleware/roleMiddleware.js';
import { listRooms, createRoom, getRoom, updateRoom, deleteRoom } from '../../controllers/hostel/roomController.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin', 'super-admin', 'hostel-warden'));

router.get('/', listRooms);
router.post('/', createRoom);
router.get('/:id', getRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

export default router;
