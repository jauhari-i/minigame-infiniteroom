const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.GMAIL, // generated ethereal user
    pass: process.env.GMAIL_PASS, // generated ethereal password
  },
});

module.exports = transporter;
