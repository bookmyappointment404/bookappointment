const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.connect('mongodb://127.0.0.1:27017/book_my_appointment', { useNewUrlParser: true, useUnifiedTopology: true });
const user_appointmentSchema = new mongoose.Schema({
    
    Doctor_phone_no: { type: Number, require: true },
    Doctor_Name: { type: String, require: true },
    Old_booking_Id: { type: String, require: true },
    booking_Id: { type: String, require: true },
    Register_phone:{ type: Number, require: true },
    Pasent_name: { type: String, require: true },
    Gender: { type: String, require: true },
    Age: { type: String, require: true },
    Date: { type: String, require: true },
    Time: { type: String, require: true },
    district: { type: String, require: true },
    Adress: { type: String, require: true },
    Status: { type: Boolean, require: true },

    
},{timestamps:true}
);

module.exports = mongoose.model('user_appointment', user_appointmentSchema);