import Fee from '../models/Fee.js';

export const getFeeById = async (id) => {
  return await Fee.findById(id);
};
