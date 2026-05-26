import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.get('/seed-demo', async (req, res) => {
  try {
    const demoUsers = [
      { name: 'Super Admin', email: 'superadmin@college.com', role: 'super-admin' },
      { name: 'Admin', email: 'admin@college.com', role: 'admin' },
      { name: 'Faculty', email: 'faculty@college.com', role: 'faculty' },
      { name: 'Student', email: 'student@college.com', role: 'student' },
      { name: 'Parent', email: 'parent@college.com', role: 'parent' },
      { name: 'Librarian', email: 'librarian@college.com', role: 'librarian' },
      { name: 'Placement Officer', email: 'placement@college.com', role: 'placement-officer' },
      { name: 'Hostel Warden', email: 'warden@college.com', role: 'hostel-warden' },
      { name: 'Transport Manager', email: 'transport@college.com', role: 'transport-manager' }
    ];
    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create({
          name: u.name, fullName: u.name, email: u.email, password: 'password123',
          role: u.role, mobile: '0000000000', phoneNumber: '0000000000',
          isVerified: true, mobileVerified: true, isActive: true
        });
      }
    }
    res.send('<h1>Demo accounts seeded successfully!</h1><p>You can now go back to the app and login.</p>');
  } catch (error) {
    res.status(500).send('Error seeding: ' + error.message);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
