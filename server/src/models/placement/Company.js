/**
 * Company Model
 * 
 * Represents companies recruiting from the college.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
      maxlength: 150,
    },
    logo: { type: String, trim: true },
    website: { type: String, trim: true },
    industry: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 1000 },
    contacts: [
      {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, trim: true },
        designation: { type: String, trim: true },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'companies',
  }
);

companySchema.plugin(baseSchemaPlugin);
companySchema.index({ name: 'text', industry: 'text' });

const Company = mongoose.model('Company', companySchema);
export default Company;
