const express = require('express');
const nodemailer = require("nodemailer")
require('./models/mongo_config');
const User = require('./models/user_models');
const user_appointment = require('./models/user_appointment');
const Doctor = require('./models/doctor_models');
const Doctor_profiles = require('./models/doctor_profiles');
const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key';
const app = express();
app.use(express.json());
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const { log, count } = require('console');

// Configure body-parser to handle JSON data
app.use(bodyParser.json());
// Recieved Data From CrossHeader...........................
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
//........................................................................................................
//........................ALL API FOR USER................................................................
//........................................................................................................
// Registration API  For User Registration..................
//..........................................................
app.post('/register', async (req, res) => {
  const { Phone_Number, Password } = req.body;

  try {
    // Check if the username already exists in the database
    const existingUser = await User.findOne({ Phone_Number });

    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    // Create a new user document
    const newUser = new User(req.body);
    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});
//...........................................................
//Login API Heare for User Login.............................
//...........................................................
app.post('/login', async (req, res) => {

  const { Phone_Number, Password } = req.body;
  try {

    const user = await User.findOne({ Phone_Number });


    if (!user) {
      return res.status(200).json('Worng_Phone_no!!');
    }

    const passwordMatch = await bcrypt.compare(Password, user.Password);

    if (!passwordMatch) {
      return res.status(200).json('Worng_password!!');
    }

    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

    res.status(200).json({ message: "success", name: `${user.First_name}`, user_details: `${User._id}`, phone: `${Phone_Number}` });
  } catch (error) {
    console.error('Error during login', error);
    res.status(500).json({ error: 'Login failed' });
  }
});
//...........................................................
//Forget-link Password Api is Here...........................
//...........................................................
// Configure Nodemailer for sending emails (SMTP server)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'bookmyappointment.io@gmail.com',
    pass: 'twvabwjjcyamnrqw'
  }
});
// In-memory storage for password reset tokens (You should use a database in production)
const passwordResetTokens = new Map();
// Generate a random token
function generateToken() {
  return crypto.randomBytes(20).toString('hex');
}
// Send password reset email
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const Existingmail = await User.findOne({ email });

    if (!Existingmail) {
      return res.status(200).json({ message: 'Email address is not Register Please Register First.' });
    }

    // Generate a unique token for this user
    const token = generateToken();

    // Store the token (you should use a database in production)
    passwordResetTokens.set(email, token);

    // Send a password reset email to the user
    const mailOptions = {
      from: 'bookmyappointment.io@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Click the following link to reset your password: http://localhost:${port}/reset-password`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send password reset email.' });
      } else {
        res.json({ message: 'Password reset email sent.' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Please Try after some time' });

  }
});
//................................................................
//Forget_Password API for User.....................................
//.................................................................
app.post('/forget_pass_user', async (req, res) => {
  const { Phone_Number } = req.body;
  const passi = req.body;

  try {
    const existingUser_Phone_Number = await User.findOne({ Phone_Number });

    if (!existingUser_Phone_Number) {
      return res.status(201).json({ message: 'Phone number is not registered' });
    }

    const hashedPassword = await bcrypt.hash(passi.Password, 10);

    await User.findOneAndUpdate({ Phone_Number: existingUser_Phone_Number.Phone_Number }, { Password: hashedPassword });

    res.status(201).json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Error during password_update:', error);
    res.status(500).json({ message: 'Error updating password', error: error });
  }
});
//................................................................
//Booking Appointment API for User................................
//.................................................................
function generateBookingID() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Define the alphabet
  // Select two random alphabet characters
  const randomCharacter1 = alphabet[Math.floor(Math.random() * alphabet.length)];
  const randomCharacter2 = alphabet[Math.floor(Math.random() * alphabet.length)];

  const numericPart = Math.floor(1000 + Math.random() * 9999); // Generate a random 4-digit number

  const bookingID = randomCharacter1 + randomCharacter2 + numericPart;

  return bookingID;
}

app.post('/user_appointment', async (req, res) => {
  // Generate a booking ID
  const bookingID = generateBookingID();
  const appoint_data = req.body
  appoint_data.booking_Id = bookingID;
  const new_user_appointment = new user_appointment(appoint_data);
  await new_user_appointment.save();
  res.status(201).json({ message: 'your appoientment is book!!', Booking_Id:(bookingID) });
  

});
//....................................................................
// booking status update API for User.................................
//....................................................................
app.post('/user_appointment_status', async (req, res) => {
  const resBody = req.body;
  try { 
    const newupdate = String(resBody.booking_Id);
    const final_status = String(resBody.status);
    let resData = await user_appointment.findOneAndUpdate({ booking_Id: newupdate }, { $set: { Status: final_status } }, { new: true });
    if (resData) {
      return res.status(201).json({ res: resData, message: 'your booking is canceled !!' });
    } else {
      return res.status(200).json({ message: 'your booking id is not generated ' });
    }
  } catch (error) {
    console.error('Error during booking_update:', error);
    res.status(500).json({ message: 'Error updating status', error: error });
  }
});
//............................................................................
//See all Boking histroy For USER API.........................................
//............................................................................
app.post('/appointment_history', async (req, res) => {
  const filters = req.body;
  // Define your filter query as an object
  const filter = {
    $or: [
      { Register_phone: filters.Register_phone },
      { booking_Id: filters.booking_Id }
    ]
  };
  // Find documents that match the filter
  const result = await user_appointment.find(filter);
  res.json(result);
});
//........................................................booking_Id:filters.booking_Id............................................................................
//....................................................................................................................................
// API Copmlete with USER ...Register...Login....Forget-Password....Book_Apponintment_....Cancle_Appointment....Booking_history.......
//....................................................................................................................................
//....................................................................................................................................
//............................................................................................................
//........................ALL API FOR Doctor..................................................................
//............................................................................................................
//......................................................
// Registration API For Doctor..........................
//.......................................................
app.post('/register-doc', async (req, res) => {
  const { Phone_Number, Password } = req.body;

  try {
    // Check if the doctor already exists in the database
    const existingUser = await Doctor.findOne({ Phone_Number });

    if (existingUser) {
      return res.status(201).json({ message: 'Doctor already exists' });
    }
    // Create a new userdoctor document
    const newdoc = new Doctor(req.body);
    // Save the doctor to the database
    await newdoc.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});
//......................................................
// Login API For Doctor.................................
//.......................................................
app.post('/login-doc', async (req, res) => {

  const { Phone_Number, Password } = req.body;
  try {

    const user = await Doctor.findOne({ Phone_Number });

    if (!user) {
      return res.status(200).json('Worng_Phone_no!!');
    }

    const passwordMatch = await bcrypt.compare(Password, user.Password);

    if (!passwordMatch) {
      return res.status(200).json('Worng_password!!');
    }

    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

    res.status(200).json({ message: "success", name: `${user.Doctor_name}`, user_details: `${Doctor._id}`, phone: `${Phone_Number}` });
  } catch (error) {
    console.error('Error during login', error);
    res.status(500).json({ error: 'Login failed' });
  }
});
//........................................................
// Forget_Password-Link API For Doctor....................
//.........................................................
app.post('/forgot-password-doc', async (req, res) => {
  const { email } = req.body;

  try {
    const Existingmail = await Doctor.findOne({ email });

    if (!Existingmail) {
      return res.status(200).json({ message: 'Email address is not Register Please Register First.' });
    }
    // Generate a unique token for this user
    const token = generateToken();

    // Store the token (you should use a database in production)
    passwordResetTokens.set(email, token);

    // Send a password reset email to the user
    const mailOptions = {
      from: 'bookmyappointment.io@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Click the following link to reset your password: http://localhost:${port}/reset-password/${token}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send password reset email.' });
      } else {
        res.json({ message: 'Password reset email sent.' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Please Try after some time' });

  }
});
//......................................................
// Forget_Password API For Doctor.......................
//.......................................................
app.post('/forget_pass_doc', async (req, res) => {
  const { Phone_Number } = req.body;
  const passi = req.body;

  try {
    const existingUser_Phone_Number = await Doctor.findOne({ Phone_Number });

    if (!existingUser_Phone_Number) {
      return res.status(201).json({ message: 'Phone number is not registered' });
    }

    const hashedPassword = await bcrypt.hash(passi.Password, 10);

    await Doctor.findOneAndUpdate({ Phone_Number: existingUser_Phone_Number.Phone_Number }, { Password: hashedPassword });

    res.status(201).json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Error during password_update:', error);
    res.status(500).json({ message: 'Error updating password', error: error });
  }
});
//......................................................
// Profile API For Doctor...............................
//.......................................................
app.post('/doctor-profile', async (req, res) => {
  const newdoc_profile = new Doctor_profiles(req.body);
  await newdoc_profile.save();
  res.status(201).json({ message: 'Profile_successfully_save!!' });
});
//......................................................
// Availbiliti API For Doctor...........................
//.......................................................
app.post('/doctor_avale/:id', async (req, res) => {
  const update_data = req.body;

  try {
    // const doc = await Doctor_profiles.findById(req.query.uid);
    const doc_update_data = await Doctor_profiles.findById(update_data._id);
    if (!doc_update_data) {
      return res.status(404).json({ message: 'doctor not found' });
    }
    res.status(201).json({ message: 'avalibility updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//......................................................
//Filtering API For Doctor..............................
//.......................................................
app.post('/filter_all_doctor', async (req, res) => {
  const filters = req.body;
  // Define your filter query as an object
  const filter = { Department: filters.Department };
  // Find documents that match the filter
  const result = await Doctor_profiles.find(filter);
  res.json(result);
});
//......................................................
// Profile API For Doctor...............................
//.......................................................
// Define a route to fetch a single Doctore by phone no
app.post('/doctor_profile', async (req, res) => {
  const filters = req.body;
  // Define your filter query as an object
  const filter = { Doctor_phone_no: filters.Doctor_phone_no };
  // Find documents that match the filter
  const result = await Doctor_profiles.find(filter);
  res.json(result);
  // Access the data inside the result array
for (const doctor of result) {
  console.log('Doctor Name:', doctor.Doctor_name);
  console.log('First_half_time:', doctor.First_half_time[1]);
  // Access other properties as needed
}
  
});


//....................................................
//time_slot_API For Doctor............................
//....................................................
app.post('/time_slot_doctor', async (req, res) => {
  const time_1_to = req.body;
  const Doc_phone_no = time_1_to.Doctor_phone_no;
  const days = time_1_to.doctor_available_days_week;


  //Time_slot first half time function For Doctor.................
  const firstTime = `${time_1_to.firstTime_to}`;
  const secondTime = `${time_1_to.firstTime_from}`;
  const firstTimeParts = firstTime.split(':').map(Number);
  const secondTimeParts = secondTime.split(':').map(Number);
  const firstHours = firstTimeParts[0];
  const firstminuts = firstTimeParts[1];
  const secondHours = secondTimeParts[0];
  // const secondminuts = secondTimeParts[1];
  //Time_slot first half time function For Doctor.................
  const firstTime_1 = `${time_1_to.secondtime_to}`;
  const secondTime_1 = `${time_1_to.secondtime_to_from}`;
  const firstTimeParts_1 = firstTime_1.split(':').map(Number);
  const secondTimeParts_1 = secondTime_1.split(':').map(Number);
  const firstHours_1 = firstTimeParts_1[0];
  const firstminuts_1 = firstTimeParts_1[1];
  const secondHours_1 = secondTimeParts_1[0];

  const myList = [];
  const myList_1 = [];
  const myList_2 = [];
  myList_2.push(days)


  if (secondHours > firstHours) {
    for (let i = firstHours; i < secondHours; i++) {
      for (let j = firstminuts; j <= 60; j++)
        if (j === firstminuts) {
          const time_save = i + `:${j}`;
          myList.push(time_save)
          // console.log(time_save)
        };
    }
  } else {
    for (let i = firstHours; i < secondHours + 12; i++) {
      for (let j = firstminuts; j <= 60; j++)
        if (j === firstminuts) {
          const time_save = i + `:${j}`;
          myList.push(time_save)
          // console.log(time_save)
        };
    }
  }

  if (secondHours_1 > firstHours_1) {
    for (let i = firstHours_1; i < secondHours_1; i++) {
      for (let j = firstminuts_1; j <= 60; j++)
        if (j === firstminuts_1) {
          const time_save_1 = i + `:${j}`;
          myList_1.push(time_save_1)
          // console.log(time_save)
        };
    }
  } else {
    for (let i = firstHours_1; i < secondHours_1 + 12; i++) {
      for (let j = firstminuts_1; j <= 60; j++)
        if (j === firstminuts_1) {
          const time_save_1 = i + `:${j}`;
          myList_1.push(time_save_1)
          // console.log(time_save)
        };
    }
  }

  try {
    const existingUser_Doctor_phone_no = await Doctor_profiles.findOne({ Doctor_phone_no: Doc_phone_no });

    if (!existingUser_Doctor_phone_no) {
      return res.status(201).json({ message: 'Phone number is not registered' });
    }

    await Doctor_profiles.findOneAndUpdate({ Doctor_phone_no: existingUser_Doctor_phone_no.Doctor_phone_no },
      { First_half_time: myList, Second_half_time: myList_1, doctor_available_days_week: myList_2 });

    res.status(201).json({ message: 'Time and Date slot_ updated successfully' });

  } catch (error) {
    console.error('Error during Time slot updating:', error);
    res.status(500).json({ message: 'Error updating Time slot', error: error });
  }
});
 //Time_slot update in  DoctorDB..........................
 //....................................................
//............................
//....................................................



app.listen(5000, () => {
  console.log('app is runnig is 5000 port')

});