const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/book_my_appointment',
    { useNewUrlParser: true, useUnifiedTopology: true });
const appointment_availability_status = new mongoose.Schema({

    Doctor_phone_no: { type: Number, require: true },
    Date: { type: String, require: true },
    Time: { type: String, require: true },
    availabile_slot: { type: Number, require:true }

   

}, { timestamps: true }
);



module.exports = mongoose.model('appointment_availability_slots', appointment_availability_status);