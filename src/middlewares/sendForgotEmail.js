const transporter = require('../configs/nodeMailer');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');

const readHtmlFile = (path, cb) => {
  fs.readFile(path, { encoding: 'utf-8' }, (err, html) => {
    err ? cb(err) : cb(null, html);
  });
};

module.exports = sendVerificationEmail = async (email, version, token, cb) => {
  readHtmlFile(path.join(__dirname, '../public/forgotPasswordMail.html'), (err, html) => {
    err && cb(err);
    const template = handlebars.compile(html);
    const data = {
      token: token,
      email: email,
      link: 'https://minigame-infiniteroom.herokuapp.com/api/' + version + '/verify/user/' + token,
      linkRequest:
        'https://minigame-infiniteroom.herokuapp.com/api/' + version + '/verify/request/' + token,
    };
    const localData = {
      token: token,
      email: email,
      link: 'http://localhost:8000/api/' + version + '/verify/user/' + token,
      linkRequest: 'http://localhost:8000/api/' + version + '/verify/request' + token,
    };
    const htmlToSend = template(process.env.MODE === 'dev' ? localData : data);
    const mailOptions = {
      from: `"Minigames Infiniteroom" <minigames@tranceformasiindonesia.com>`,
      to: email,
      subject: 'Forgot Password',
      html: htmlToSend,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      err ? cb(err) : cb(null, info);
    });
  });
};
