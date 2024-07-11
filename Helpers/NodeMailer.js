const nodemailer = require('nodemailer');
const smtpUser = process.env.SMTP_USER
const smtpPassword = process.env.SMTP_PASS

const sendMail = ({email,subject,message}) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        host: 'smtp.gmail.com',
        port: '465',
        secure: false,
        requireTLS: true,
        auth: {
            user: smtpUser,
            pass: smtpPassword
        }
    });

    const mailOptions = {
        from: smtpUser,
        to: email,
        subject: subject,
        text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error occurred: ', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = sendMail;
