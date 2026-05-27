/**
 * College Information Model
 * 
 * Stores editable central details for the homepage and SEO.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const collegeInformationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
    },
    tagline: { type: String, trim: true },
    logo: { type: String, trim: true },
    aboutUs: { type: String, trim: true, maxlength: 3000 },
    vision: { type: String, trim: true, maxlength: 1000 },
    mission: { type: String, trim: true, maxlength: 1000 },
    establishedYear: { type: Number },
    accreditations: [{ type: String, trim: true }],
    bannerImages: [{ type: String, trim: true }],
    seoMetadata: {
      title: { type: String, trim: true },
      description: { type: String, trim: true, maxlength: 500 },
      keywords: [{ type: String, trim: true }],
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'collegeinformation',
  }
);

collegeInformationSchema.plugin(baseSchemaPlugin);

const CollegeInformation = mongoose.model('CollegeInformation', collegeInformationSchema);
export default CollegeInformation;
