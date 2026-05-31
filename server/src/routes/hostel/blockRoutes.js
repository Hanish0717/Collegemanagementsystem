import express from 'express';
import * as controller from '../../controllers/hostel/blockController.js';

const router = express.Router();

router.get('/', controller.listBlocks);
router.post('/', controller.createBlock);
router.get('/:id', controller.getBlock);
router.put('/:id', controller.updateBlock);
router.delete('/:id', controller.deleteBlock);

export default router;
