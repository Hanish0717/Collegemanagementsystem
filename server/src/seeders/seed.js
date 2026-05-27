import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Book from '../models/Book.js';
import Fee from '../models/Fee.js';

dotenv.config();

const usersToSeed = [];

const booksToSeed = [
  {
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    category: 'Computer Science',
    isbn: '9780262033848',
    publisher: 'MIT Press',
    edition: '3rd',
    totalCopies: 10,
    availableCopies: 8,
    language: 'English',
    shelfNumber: 'CS-04',
    description: 'A comprehensive guide to the design and analysis of computer algorithms.',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Software Engineering',
    isbn: '9780132350884',
    publisher: 'Prentice Hall',
    edition: '1st',
    totalCopies: 5,
    availableCopies: 4,
    language: 'English',
    shelfNumber: 'SE-02',
    description: 'A handbook of agile software craftsmanship.',
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    category: 'Software Engineering',
    isbn: '9780201616224',
    publisher: 'Addison-Wesley',
    edition: '20th Anniversary',
    totalCopies: 6,
    availableCopies: 6,
    language: 'English',
    shelfNumber: 'SE-03',
    description: 'Your journey to mastery.',
  },
];

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Seed Users
    console.log('Cleaning existing seed users...');
    const emailsToClean = usersToSeed.map(u => u.email);
    await User.deleteMany({ email: { $in: emailsToClean } });

    console.log('Seeding new users...');
    const seededUsers = [];
    for (const u of usersToSeed) {
      const user = await User.create(u);
      seededUsers.push(user);
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    // 2. Find student user and seed Student details
    const studentUser = seededUsers.find(u => u.role === 'student');
    if (studentUser) {
      console.log('Cleaning existing student details for Jane Doe...');
      await Student.deleteMany({ email: studentUser.email });

      console.log('Seeding student details...');
      const studentDetails = await Student.create({
        fullName: studentUser.fullName,
        rollNumber: 'CS2026001',
        email: studentUser.email,
        phoneNumber: studentUser.phoneNumber,
        gender: 'Female',
        dateOfBirth: new Date('2004-05-15'),
        department: 'CSE',
        year: 3,
        semester: 6,
        section: 'A',
        parentName: 'Robert Doe',
        parentPhone: '9876543214',
        cgpa: 9.4,
        attendancePercentage: 92,
      });
      console.log(`Created student profile: ${studentDetails.rollNumber}`);

      // Seed Fee records for this student
      console.log('Cleaning existing fee records...');
      await Fee.deleteMany({ student: studentDetails._id });

      console.log('Seeding fee records...');
      await Fee.create([
        {
          student: studentDetails._id,
          academicYear: '2025-2026',
          semester: 6,
          feeType: 'tuition',
          totalAmount: 50000,
          paidAmount: 50000,
          dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          paymentMethod: 'bank-transfer',
          transactionId: 'TXN8391039',
        },
        {
          student: studentDetails._id,
          academicYear: '2025-2026',
          semester: 6,
          feeType: 'hostel',
          totalAmount: 25000,
          paidAmount: 10000,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          paymentMethod: 'upi',
          transactionId: 'TXN8391040',
        },
        {
          student: studentDetails._id,
          academicYear: '2025-2026',
          semester: 6,
          feeType: 'examination',
          totalAmount: 2500,
          paidAmount: 0,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        }
      ]);
      console.log('Created fee records.');
    }

    // 3. Seed Books
    console.log('Cleaning existing books...');
    const isbnsToClean = booksToSeed.map(b => b.isbn);
    await Book.deleteMany({ isbn: { $in: isbnsToClean } });

    console.log('Seeding books...');
    for (const b of booksToSeed) {
      const book = await Book.create(b);
      console.log(`Created book: ${book.title}`);
    }

    console.log('\nSeeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
}

seed();
