import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const lecturerSchema = new mongoose.Schema({
  lecturerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  classesTaught: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }]
}, { timestamps: true });

// Hash password before saving
lecturerSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Method to compare passwords
lecturerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const Lecturer = mongoose.model('Lecturer', lecturerSchema);
export default Lecturer;