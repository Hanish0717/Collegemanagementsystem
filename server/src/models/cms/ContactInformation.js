/**
 * Contact Information Model
 * 
 * Manages institutional contact details, social links, and coordinates.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const contactInformationSchema = new mongoose.Schema(
  {
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pinCode: { type: String, required: true, trim: true },
    },
    phoneNumbers: [{ type: String, trim: true }],
    emails: [{ type: String, trim: true }],
    socialLinks: {
      facebook: { type: String, trim: true },
      twitter: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      youtube: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'contactinformation',
  }
);

contactInformationSchema.plugin(baseSchemaPlugin);

const ContactInformation = mongoose.model('ContactInformation', contactInformationSchema);
export default ContactInformation;
