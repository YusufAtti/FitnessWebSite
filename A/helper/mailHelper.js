const nodemailer = require('nodemailer');

// E-posta gönderme fonksiyonu
const sendEmail = async (toEmail, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // E-posta sağlayıcınıza göre değiştirin
      auth: {
        user: 'omer.aydn.222@gmail.com', // E-posta adresiniz
        pass: 'sesq ucnp czfa appl' // E-posta şifreniz
      }
    });

    const mailOptions = {
      from: 'omer.aydn.222@gmail.com', // Gönderici e-posta adresi
      to: toEmail, // Alıcı e-posta adresi
      subject: subject, // E-posta konusu
      html: message // E-posta içeriği
    };

    // E-posta gönderme işlemi
    const info = await transporter.sendMail(mailOptions);
    console.log('E-posta gönderildi:', info.response);
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
  }
};

module.exports = { sendEmail};



