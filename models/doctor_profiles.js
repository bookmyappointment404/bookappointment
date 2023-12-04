const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.connect('mongodb://127.0.0.1:27017/book_my_appointment',
 { useNewUrlParser: true, useUnifiedTopology: true });
const Doc_profileSchema = new mongoose.Schema({

    doctor_img: { type: String },
    Doctor_name: { type: String, require: true },
    Doctor_phone_no: { type: Number, require: true },
    Gender: { type: String, require: true },
    Age: { type: String, require: true },
    doctor_available_days_week: { type:Array, require: true },
    consulting_fees: { type: String, require: true },
    doctor_available_date: { type:Array, require: true },
    First_half_time: { type: Array, require: true },
    Second_half_time: { type:Array, require: true },
    Education:{type:String,require:true},
    Department:{type:String,require:true},
    Experience:{type:String,require:true},
    district: { type: String, require: true },
    Address: { type: String, require: true },
    
},{timestamps:true}
);

module.exports = mongoose.model('Doctor_profiles', Doc_profileSchema);