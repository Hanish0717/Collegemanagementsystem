import express from 'express';
import { listComplaints, createComplaint, updateComplaintStatus } from '../../controllers/hostel/complaintController.js';

const router = express.Router();

router.route('/')
  .get(listComplaints)
  .post(createComplaint);

router.route('/:id/status')
  .put(updateComplaintStatus);

export default router;
