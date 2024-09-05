require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser');
const mongoDBConnect = require('./Database/dbConnect')
const app = express()
mongoDBConnect()
const userRoutes = require('./Routes/UserRoutes')
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const cors = require('cors')

const port = process.env.PORT || 5000
app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, resp) => {
    resp.send('Hello World')
})

app.post('/webhook', (req, res) => {
    const incomingMsg = req.body.Body;
    const senderNumber = req.body.From;
    console.log("From: "+senderNumber)
    console.log("Body: "+incomingMsg)
    try {

        console.log(`Received message: "${incomingMsg}" from ${senderNumber}`);
        const responseMsg = `You said: ${incomingMsg}`;

        client.messages
            .create({
                body: responseMsg,
                from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
                to: 'whatsapp:+917017308602'
            })
            .then(message => console.log(`Message sent with SID: ${message.sid}`))
            .catch(err => console.error('Error sending message:', err));

        return res.status(200).send({
            success: true,
            message: "Message send"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            message: error
        })
    }
});

//---------------------------USER ROUTES------------------------------------------------
app.use("/api/user", userRoutes)

app.listen(port, () => {
    console.log("Server Is Running At " + port)
})