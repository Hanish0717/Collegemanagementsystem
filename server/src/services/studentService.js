import Student from '../models/Student.js';

export const getStudentById = async (id) => {
  return await Student.findById(id);
};
