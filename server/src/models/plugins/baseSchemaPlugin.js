import mongoose from 'mongoose';

const baseSchemaPlugin = (schema, options = {}) => {
  // Soft Delete Fields
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  });

  // Audit Trail Fields
  if (options.audit !== false) {
    schema.add({
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    });
  }

  // Instance Methods
  schema.methods.softDelete = function (userId = null) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    if (userId) this.deletedBy = userId;
    return this.save();
  };

  schema.methods.restore = function () {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save();
  };

  // Static Methods
  schema.statics.findDeleted = function (filter = {}) {
    return this.find({ ...filter, isDeleted: true });
  };

  schema.statics.findWithDeleted = function (filter = {}) {
    return this.find(filter).setOptions({ includeDeleted: true });
  };

  schema.statics.softDeleteById = function (id, userId = null) {
    const update = { isDeleted: true, deletedAt: new Date() };
    if (userId) update.deletedBy = userId;
    return this.findByIdAndUpdate(id, update, { new: true });
  };

  schema.statics.restoreById = function (id) {
    return this.findByIdAndUpdate(
      id,
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true }
    ).setOptions({ includeDeleted: true });
  };

  // Query Middleware (auto-filter soft-deleted)
  const queryMiddleware = function () {
    if (this.getOptions().includeDeleted) return;
    if (this.getFilter().isDeleted !== undefined) return;
    this.where({ isDeleted: { $ne: true } });
  };

  schema.pre('find', queryMiddleware);
  schema.pre('findOne', queryMiddleware);
  schema.pre('findOneAndUpdate', queryMiddleware);
  schema.pre('countDocuments', queryMiddleware);
  schema.pre('aggregate', function () {
    const pipelineOptions = this.options || {};
    if (pipelineOptions.includeDeleted) return;
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  });

  // JSON Transform
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      if (!ret.isDeleted) {
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.deletedBy;
      }
      return ret;
    },
  });

  schema.set('toObject', {
    virtuals: true,
    versionKey: false,
  });
};

export default baseSchemaPlugin;
