// require('dotenv').config();
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// console.log('🔧 Starting password reset...');

// const MONGODB_URI = process.env.MONGO_URI;

// if (!MONGODB_URI) {
//   console.error("❌ MONGO_URI is missing. Check your .env file!");
//   process.exit(1);
// }

// const newPassword = 'YourNewPassword123';

// const userSchema = new mongoose.Schema({
//   username: String,
//   password: String,
//   role: String,
// });

// const User = mongoose.model('User', userSchema);

// async function resetPassword() {
//   try {
//     console.log('⏳ Connecting to MongoDB...');
//     await mongoose.connect(MONGODB_URI);
//     console.log('✅ Connected to MongoDB');

//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     console.log('🔐 Password hashed.');

//     const result = await User.updateOne(
//       { username: 'superadmin' },
//       { $set: { password: hashedPassword } }
//     );

//     if (result.modifiedCount > 0) {
//       console.log('✅ Password successfully reset!');
//     } else {
//       console.log('⚠️ No user updated. Either user not found or same password.');
//     }

//     await mongoose.disconnect();
//     console.log('🔌 Disconnected');
//   } catch (err) {
//     console.error('❌ Error:', err);
//   }
// }

// resetPassword();
