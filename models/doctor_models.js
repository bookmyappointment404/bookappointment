const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.connect('mongodb://127.0.0.1:27017/book_my_appointment', { useNewUrlParser: true, useUnifiedTopology: true });
const DoctoreSchema = new mongoose.Schema({

    Doctor_name: { type: String, require: true },
    email: { type: String ,require: true},
    Phone_Number: { type: Number, require: true },
    Password: { type: String, require: true },
    
},{timestamps:true}
);

// we are Hasing the password 
DoctoreSchema.pre('save', async function (next) {
    console.log('password is encricpted')
    this.Password = await bcrypt.hash(this.Password, 10);
    next();

});

module.exports = mongoose.model('Doctor_deatils', DoctoreSchema);
