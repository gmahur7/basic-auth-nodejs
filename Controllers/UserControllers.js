const asyncHandler = require("express-async-handler")
const bcrypt = require('bcryptjs')
const User = require('../Models/UserModel')
const generateToken = require('../Helpers/JWT_Auth')
const sendMail = require("../Helpers/NodeMailer")
const domain = process.env.DOMAIN || `http://localhost:${process.env.PORT}`
const crypto = require('crypto');

const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const registerUser = asyncHandler(async (req, resp) => {
    const { username, email, password,phoneNumber } = req.body
    if (!username || !email || !password) {
        resp.sendStatus(400).json({
            success: false,
            message: "All fields are required"
        })
        throw new Error("Please Enter All The Fields")
    }

    const userExits = await User.findOne({ email })
    if (userExits) {
        resp.send(400).json({
            success: false,
            message: "Email Already Exists"
        })
        throw new Error("Email Already Exists")
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({ phoneNumber,username, email, password: hashedPassword })
    if (user) {

        let opt=123909
        const message = await client.messages.create({
            body: `Your verification code is: ${otp}`,
            from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
            to: `whatsapp:+91${phoneNumber}`  // User's WhatsApp number
        });
        console.log(message)

        resp.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id)
        })
    }
    else {
        resp.status(400).json({
            success: false,
            message: "Failed To Register the user"
        })
        throw new Error("Failed To Register the user")
    }
})

const authUser = asyncHandler(async (req, resp) => {
    const { username, password } = req.body
    const user = await User.findOne({ username })

    if (user) {

        const comaprePassword = await bcrypt.compare(password, user.password)

        if (comaprePassword) {
            resp.status(200).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            })
        }
        else {
            resp.status(400).json({
                success: false,
                message: "Invalid Credentials"
            })
            throw new Error("Invalid Credentials")
        }
    }

    else {
        resp.status(400).json({
            success: false,
            message: "Invalid Id or Password"
        })
        throw new Error("Invalid Id or Password")
    }
})

const forgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({
            success: false,
            message: "Please provide an email address"
        });
        throw new Error("Please provide an email address");
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404).json({
            success: false,
            message: "User not found"
        });;
        throw new Error("User not found");
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl = `${domain}/api/user/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
        await sendMail({
            email: user.email,
            subject: 'Password reset token',
            message
        });

        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(500).json({
            success: false,
            error: 'Email could not be sent'
        });
        throw new Error('Email could not be sent');
    }
});

const resetPassword = asyncHandler(async (req, res) => {

    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        res.status(400).json({
            success: false,
            message: "Invalid or expired reset token"
        });
        throw new Error("Invalid or expired reset token");
    }

    const { newPassword } = req.body;

    if (!newPassword) {
        res.status(400).json({
            success: false,
            message: "Please provide a new password"
        });
        throw new Error("Please provide a new password");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password reset successful"
    });
});

const whatsappResponse = asyncHandler(async (req, res) => {
    const twiml = new twilio.twiml.MessagingResponse();
    const incomingMessage = req.body.Body.toLowerCase();  // Convert message to lowercase
    const fromNumber = req.body.From;

    console.log(`Received message from ${fromNumber}: ${incomingMessage}`);

    // Respond based on the incoming message
    if (incomingMessage.includes('hello')) {
        twiml.message('Hello! How can I assist you today?');
    } else if (incomingMessage.includes('help')) {
        twiml.message('Sure! What do you need help with?');
    } else {
        twiml.message('Thank you for reaching out. We will get back to you soon.');
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
})

module.exports = {
    registerUser,
    authUser,
    forgetPassword,
    resetPassword,
    whatsappResponse
}