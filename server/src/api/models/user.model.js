import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name.'],
      trim: true,
      lowercase: true
    },
    email: {
      type: String,
      required: [true, 'A user must have an email.'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: {
        countryCode: {
          type: String,
          required: [true, 'Country code is required.'],
          trim: true,
        },
        number: {
          type: String,
          required: [true, 'Phone number is required.'],
          trim: true,
        },
      },
      // Making the phone object itself not required, but its fields are if it exists
      required: false,
    },
    // --- NEW PASSWORD FIELD ---
    password: {
      type: String,
      required: [true, 'Please provide a password.'],
      minlength: 8,
      select: false, // Critically important: Hides the password from any query by default
    },
    // --- NEW FIELDS FOR PASSWORD RESET ---
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// --- HASH PASSWORD BEFORE SAVING ---
// This function runs before a document is saved (.save() or .create())
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with a cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

// --- INSTANCE METHOD TO CHECK PASSWORD ---
// This method will be available on all user documents
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // 'this.password' is not available here because of 'select: false'
  // so we must pass the userPassword in
  return await bcrypt.compare(candidatePassword, userPassword);
};

// --- NEW INSTANCE METHOD TO GENERATE THE RESET TOKEN ---
userSchema.methods.createPasswordResetToken = function () {
  // 2. Generate a random, simple token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 3. Hash the token and store it in the database (for security)
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 4. Set an expiration time (e.g., 10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // 5. Return the UN-hashed token to be sent to the user via email
  return resetToken;
};


// Add a unique index for the phone number if it exists
userSchema.index(
  { 'phone.countryCode': 1, 'phone.number': 1 },
  { unique: true, sparse: true } // sparse: true allows multiple nulls
);


const User = mongoose.model('User', userSchema);

export default User;