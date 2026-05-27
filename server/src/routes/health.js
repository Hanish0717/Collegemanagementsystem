import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'College ERP Backend Running'
  });
});

// Database overview — shows all collections and document counts
router.get('/db', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    const result = {};
    for (const col of collections.sort((a, b) => a.name.localeCompare(b.name))) {
      const count = await db.collection(col.name).countDocuments();
      result[col.name] = count;
    }

    // Fetch sample data
    const users = await db.collection('users').find({}, { projection: { fullName: 1, email: 1, role: 1, _id: 0 } }).toArray();
    const departments = await db.collection('departments').find({}, { projection: { name: 1, code: 1, _id: 0 } }).toArray();
    const students = await db.collection('students').find({}, { projection: { fullName: 1, rollNumber: 1, departmentName: 1, _id: 0 } }).toArray();
    const subjects = await db.collection('subjects').find({}, { projection: { name: 1, code: 1, semester: 1, _id: 0 } }).toArray();
    const books = await db.collection('books').find({}, { projection: { title: 1, author: 1, _id: 0 } }).toArray();

    res.json({
      success: true,
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      totalCollections: collections.length,
      collections: result,
      sampleData: { users, departments, students, subjects, books }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
