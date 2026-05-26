import Book from '../models/Book.js';

export const getBookById = async (id) => {
  return await Book.findById(id);
};
