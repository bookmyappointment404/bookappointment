const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/book_my_appointment',
    { useNewUrlParser: true, useUnifiedTopology: true });
const userSchema = new mongoose.Schema({

    Full_name: { type: String, require: true },
    Gender: { type: String, require: true },
    Phone_Number: { type: Number, require: true },
    email: { type: String },
    Password: { type: String, require: true },
    Address: { type: String, require: true },
    district: { type: String, require: true },

}, { timestamps: true }
);

// we are Hasing the password 
userSchema.pre('save', async function (next) {
    this.Password = await bcrypt.hash(this.Password, 10);
    next();
});

module.exports = mongoose.model('user_deatils', userSchema);
