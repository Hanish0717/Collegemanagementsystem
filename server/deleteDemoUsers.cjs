const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({ email: String }, { strict: false }));
  const result = await User.deleteMany({ email: { $regex: '@college.com$' } });
  console.log('Deleted demo users:', result.deletedCount);
  mongoose.disconnect();
}).catch(console.error);
