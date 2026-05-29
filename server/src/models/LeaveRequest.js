import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    type: {
      type: String,
      enum: {
        values: ['Sick Leave', 'Casual Leave', 'Earned Leave'],
        message: 'Leave type must be Sick Leave, Casual Leave, or Earned Leave',
      },
      required: [true, 'Leave type is required'],
    },
    from: {
      type: Date,
      required: [true, 'From date is required'],
    },
    to: {
      type: Date,
      required: [true, 'To date is required'],
    },
    days: {
      type: Number,
      required: [true, 'Total days is required'],
    },
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

export default LeaveRequest;
