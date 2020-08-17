
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.mail.ee",
  port: 587,
  auth: {
      user: 'felipegabriel@mail.ee',
      pass: '1EiVsuC2Z!'
  },
  tls: { 
    rejectUnauthorized: false 
}
});
module.exports = transporter;
