const transporter = require('../configs/nodeMailer');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');

const readHtmlFile = (path, cb) => {
  fs.readFile(path, { encoding: 'utf-8' }, (err, html) => {
    err ? cb(err) : cb(null, html);
  });
};

module.exports = sendVerificationEmail = async (email, token, cb) => {
  readHtmlFile(path.join(__dirname, '../public/verificationMail.html'), (err, html) => {
    err && cb(err);
    const template = handlebars.compile(html);
    const data = {
      token: token,
      email: email,
      link: `http://minigames.tranceformasiindonesia.com/verification/?token=${token}`,
      linkRequest: `http://minigames.tranceformasiindonesia.com/verification/?token=${token}&request=true`,
    };
    const htmlToSend = template(data);
    const mailOptions = {
      from: `"Minigames Infiniteroom" <minigames@tranceformasiindonesia.com>`,
      to: email,
      subject: 'Account Verification',
      html: htmlToSend,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      err ? cb(err) : cb(null, info);
    });
  });
};
