/**
 * Library Management Seeder
 * Usage: npm run seed:library
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Book from '../models/library/Book.js';
import BookCategory from '../models/library/BookCategory.js';
import BookAuthor from '../models/library/BookAuthor.js';
import IssuedBook from '../models/library/IssuedBook.js';
import BookReturn from '../models/library/BookReturn.js';
import BookFine from '../models/library/BookFine.js';
import LibraryMember from '../models/library/LibraryMember.js';
import Student from '../models/student/Student.js';
import Faculty from '../models/faculty/Faculty.js';
import User from '../models/auth/User.js';

dotenv.config();

const authorsData = [
  { name: 'Thomas H. Cormen', nationality: 'American', specialization: ['Algorithms', 'Data Structures'], birthYear: 1956 },
  { name: 'Andrew S. Tanenbaum', nationality: 'American', specialization: ['Operating Systems', 'Computer Networks'], birthYear: 1944 },
  { name: 'Robert C. Martin', nationality: 'American', specialization: ['Software Engineering', 'Clean Code'], birthYear: 1952 },
  { name: 'Herbert Schildt', nationality: 'American', specialization: ['Java', 'C++', 'Programming'], birthYear: 1951 },
  { name: 'Abraham Silberschatz', nationality: 'Israeli', specialization: ['Database Systems', 'OS'], birthYear: 1952 },
  { name: 'Behrouz A. Forouzan', nationality: 'American', specialization: ['Data Communications', 'Networking'] },
  { name: 'William Stallings', nationality: 'American', specialization: ['Computer Organization', 'Cryptography'] },
  { name: 'Dennis Ritchie', nationality: 'American', specialization: ['C Programming', 'Unix'], birthYear: 1941, deathYear: 2011 },
];

const booksData = [
  { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', publisher: 'MIT Press', edition: '3rd', year: 2009, pages: 1312, copies: 10, price: 850, category: 'CSE', shelf: 'A1', rack: 'R1', tags: ['algorithms', 'data structures'] },
  { title: 'Operating System Concepts', author: 'Abraham Silberschatz', isbn: '978-1119800361', publisher: 'Wiley', edition: '10th', year: 2021, pages: 920, copies: 8, price: 750, category: 'CSE', shelf: 'A2', rack: 'R1', tags: ['os', 'systems'] },
  { title: 'Computer Networking: A Top-Down Approach', author: 'James Kurose', isbn: '978-0133594140', publisher: 'Pearson', edition: '7th', year: 2017, pages: 800, copies: 6, price: 680, category: 'CSE', shelf: 'A3', rack: 'R1', tags: ['networking', 'tcp/ip'] },
  { title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', publisher: 'Prentice Hall', edition: '1st', year: 2008, pages: 464, copies: 12, price: 550, category: 'CSE', shelf: 'A4', rack: 'R2', tags: ['clean code', 'best practices'] },
  { title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '978-0078022159', publisher: 'McGraw-Hill', edition: '7th', year: 2019, pages: 1376, copies: 7, price: 900, category: 'CSE', shelf: 'A5', rack: 'R2', tags: ['database', 'sql'] },
  { title: 'Design Patterns', author: 'Erich Gamma', isbn: '978-0201633610', publisher: 'Addison-Wesley', edition: '1st', year: 1994, pages: 395, copies: 5, price: 620, category: 'CSE', shelf: 'A6', rack: 'R2', tags: ['patterns', 'oop'] },
  { title: 'Data Communications and Networking', author: 'Behrouz A. Forouzan', isbn: '978-0073376226', publisher: 'McGraw-Hill', edition: '5th', year: 2012, pages: 1264, copies: 6, price: 780, category: 'ECE', shelf: 'B1', rack: 'R3', tags: ['networking', 'data comm'] },
  { title: 'Engineering Mathematics', author: 'B.S. Grewal', isbn: '978-8174091154', publisher: 'Khanna Publishers', edition: '44th', year: 2020, pages: 1350, copies: 15, price: 450, category: 'SCI', shelf: 'C1', rack: 'R4', tags: ['mathematics', 'engineering'] },
  { title: 'Engineering Physics', author: 'H.K. Malik', isbn: '978-0070702523', publisher: 'McGraw-Hill', edition: '2nd', year: 2018, pages: 690, copies: 10, price: 380, category: 'SCI', shelf: 'C2', rack: 'R4', tags: ['physics'] },
  { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', isbn: '978-0134610993', publisher: 'Pearson', edition: '4th', year: 2020, pages: 1136, copies: 8, price: 950, category: 'CSE', shelf: 'A7', rack: 'R3', tags: ['ai', 'machine learning'] },
];

async function seedLibrary() {
  const startTime = Date.now();
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Library Management Module — Seeder');
    console.log('═══════════════════════════════════════════════════');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.\n');

    // ── Authors ─────────────────────────────────────
    console.log('📌 Seeding Book Authors...');
    await BookAuthor.deleteMany({}).setOptions({ includeDeleted: true });
    const authorMap = {};
    for (const a of authorsData) {
      const author = await BookAuthor.create(a);
      authorMap[a.name] = author;
      console.log(`   ✅ ${a.name}`);
    }

    // ── Categories (clean re-seed) ──────────────────
    console.log('\n📌 Seeding Book Categories...');
    await BookCategory.deleteMany({}).setOptions({ includeDeleted: true });
    const catMap = {};
    const categories = [
      { name: 'Computer Science & Engineering', code: 'CSE', shelfPrefix: 'A', description: 'CS/IT related books' },
      { name: 'Electronics & Communication', code: 'ECE', shelfPrefix: 'B', description: 'Electronics/telecom books' },
      { name: 'Mechanical Engineering', code: 'ME', shelfPrefix: 'D', description: 'Mechanical engineering books' },
      { name: 'Science & Mathematics', code: 'SCI', shelfPrefix: 'C', description: 'Physics, chemistry, mathematics' },
      { name: 'General & Reference', code: 'GEN', shelfPrefix: 'G', description: 'General knowledge and reference' },
      { name: 'Management & Business', code: 'MBA', shelfPrefix: 'M', description: 'Business, finance, HR' },
      { name: 'Literature & Fiction', code: 'LIT', shelfPrefix: 'L', description: 'Novels, poetry, drama' },
      { name: 'Competitive Exams', code: 'COMP', shelfPrefix: 'X', description: 'GATE, GRE, CAT preparation' },
    ];
    for (const c of categories) {
      const cat = await BookCategory.create(c);
      catMap[c.code] = cat;
      console.log(`   ✅ ${c.name} (${c.code})`);
    }

    // ── Books ───────────────────────────────────────
    console.log('\n📌 Seeding Books...');
    await Book.deleteMany({}).setOptions({ includeDeleted: true });
    const bookDocs = [];
    for (const b of booksData) {
      const cat = catMap[b.category];
      const authorRef = authorMap[b.author];
      const book = await Book.create({
        title: b.title, author: b.author, isbn: b.isbn, publisher: b.publisher,
        edition: b.edition, publicationYear: b.year, pages: b.pages, price: b.price,
        totalCopies: b.copies, category: cat?._id, categoryName: cat?.name,
        authors: authorRef ? [authorRef._id] : [],
        shelfNumber: b.shelf, rackNumber: b.rack, tags: b.tags,
        condition: 'good', acquisitionSource: 'purchase',
        barcode: `LIB-${b.isbn.slice(-6)}`,
      });
      bookDocs.push(book);
      console.log(`   ✅ ${b.title}`);
    }

    // ── Library Members ─────────────────────────────
    console.log('\n📌 Seeding Library Members...');
    await LibraryMember.deleteMany({}).setOptions({ includeDeleted: true });
    const students = await Student.find({}).populate('user').lean();
    const faculty = await Faculty.find({}).populate('user').lean();
    let memCount = 0;
    const memberDocs = [];

    for (const s of students) {
      const member = await LibraryMember.create({
        user: s.user._id, membershipId: `LIB-S-${s.rollNumber}`,
        memberType: 'student', department: s.department, student: s._id,
        fullName: s.fullName, email: s.email,
        maxBooksAllowed: 5, maxDaysAllowed: 14,
        validFrom: new Date(2025, 6, 1), validTo: new Date(2026, 5, 30),
      });
      memberDocs.push(member);
      memCount++;
    }
    for (const f of faculty) {
      const member = await LibraryMember.create({
        user: f.user._id, membershipId: `LIB-F-${f.employeeId}`,
        memberType: 'faculty', department: f.department, faculty: f._id,
        fullName: f.fullName, email: f.email,
        maxBooksAllowed: 10, maxDaysAllowed: 30,
        validFrom: new Date(2025, 6, 1), validTo: new Date(2026, 5, 30),
      });
      memberDocs.push(member);
      memCount++;
    }
    console.log(`   ✅ ${memCount} members registered`);

    // ── Book Issues ─────────────────────────────────
    console.log('\n📌 Seeding Book Issues...');
    await IssuedBook.deleteMany({}).setOptions({ includeDeleted: true });
    const librarianUser = await User.findOne({ role: 'librarian' });
    const issueDocs = [];

    for (let i = 0; i < 5 && i < students.length && i < bookDocs.length; i++) {
      const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 14);
      const issueDate = new Date(); issueDate.setDate(issueDate.getDate() - 7);
      const issue = await IssuedBook.create({
        book: bookDocs[i]._id, borrower: students[i].user._id,
        borrowerType: 'student', issuedBy: librarianUser?._id || students[i].user._id,
        issueDate, dueDate, status: 'issued',
      });
      issueDocs.push(issue);
      // Decrement available copies
      await Book.findByIdAndUpdate(bookDocs[i]._id, { $inc: { availableCopies: -1 } });
    }

    // Add some overdue issues
    for (let i = 0; i < 2 && i < students.length; i++) {
      const issueDate = new Date(); issueDate.setDate(issueDate.getDate() - 25);
      const dueDate = new Date(); dueDate.setDate(dueDate.getDate() - 11);
      const book = bookDocs[5 + i] || bookDocs[i];
      const issue = await IssuedBook.create({
        book: book._id, borrower: students[i].user._id,
        borrowerType: 'student', issuedBy: librarianUser?._id || students[i].user._id,
        issueDate, dueDate, status: 'overdue',
      });
      issueDocs.push(issue);
      await Book.findByIdAndUpdate(book._id, { $inc: { availableCopies: -1 } });
    }
    console.log(`   ✅ ${issueDocs.length} book issues`);

    // ── Book Returns ────────────────────────────────
    console.log('\n📌 Seeding Book Returns...');
    await BookReturn.deleteMany({}).setOptions({ includeDeleted: true });
    // Return 2 books
    let returnCount = 0;
    for (let i = 0; i < 2 && i < issueDocs.length; i++) {
      const issue = issueDocs[i];
      const returnDate = new Date();
      await BookReturn.create({
        issuedBook: issue._id, book: issue.book, borrower: issue.borrower,
        returnDate, receivedBy: librarianUser?._id || issue.borrower,
        dueDate: issue.dueDate, conditionOnReturn: 'good',
      });
      await IssuedBook.findByIdAndUpdate(issue._id, { status: 'returned', returnDate });
      await Book.findByIdAndUpdate(issue.book, { $inc: { availableCopies: 1 } });
      returnCount++;
    }
    console.log(`   ✅ ${returnCount} returns processed`);

    // ── Book Fines ──────────────────────────────────
    console.log('\n📌 Seeding Book Fines...');
    await BookFine.deleteMany({}).setOptions({ includeDeleted: true });
    let fineCount = 0;
    const overdueIssues = issueDocs.filter((i) => i.status === 'overdue');
    for (const issue of overdueIssues) {
      const daysLate = Math.ceil((new Date() - issue.dueDate) / (1000 * 60 * 60 * 24));
      const member = memberDocs.find((m) => m.user.toString() === issue.borrower.toString());
      await BookFine.create({
        member: member?._id, borrower: issue.borrower,
        issuedBook: issue._id, book: issue.book,
        bookTitle: bookDocs.find((b) => b._id.toString() === issue.book.toString())?.title,
        fineType: 'late-return', fineAmount: daysLate * 5,
        daysLate, finePerDay: 5, paymentStatus: 'pending',
      });
      fineCount++;
    }
    // Add a damage fine
    if (memberDocs.length > 0) {
      await BookFine.create({
        member: memberDocs[0]._id, borrower: memberDocs[0].user,
        book: bookDocs[0]._id, bookTitle: bookDocs[0].title,
        fineType: 'damaged', fineAmount: 200, paymentStatus: 'paid',
        paidAmount: 200, paymentMethod: 'cash',
        receiptNumber: 'FINE-2026-001',
      });
      fineCount++;
    }
    console.log(`   ✅ ${fineCount} fines`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ Library module seeded in ${elapsed}s`);
    console.log('═══════════════════════════════════════════════════');
  } catch (error) {
    console.error('\n❌ Error:', error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

seedLibrary();
