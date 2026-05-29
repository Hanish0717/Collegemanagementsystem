import mongoose from 'mongoose';

const placementSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Job position is required'],
      trim: true,
    },
    appliedStudents: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          enum: ['Applied', 'Shortlisted', 'Interview Scheduled', 'Offered', 'Rejected'],
          default: 'Applied',
        },
        appliedDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Placement = mongoose.model('Placement', placementSchema);

export default Placement;
