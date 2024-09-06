require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser');
const mongoDBConnect = require('./Database/dbConnect')
const app = express()
mongoDBConnect()
const userRoutes = require('./Routes/UserRoutes')
const twilio = require('twilio');
const {twilioWebhook} = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse
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

app.post('/webhook', async (req, res) => {
    const incomingMsg = req.body.Body;
    const senderNumber = req.body.From;
    console.log("From: " + senderNumber);
    console.log("Body: " + incomingMsg);

    // Create a new TwiML MessagingResponse object
    const twiml = new MessagingResponse();
    
    try {
        console.log(`Received message: "${incomingMsg}" from ${senderNumber}`);

        let responseMsg;

        // Custom response logic based on incoming message
        if (incomingMsg.toLowerCase().includes('hello')) {
            responseMsg = 'Hello! How can I assist you today?';
        } else if (incomingMsg.toLowerCase().includes('help')) {
            responseMsg = 'Here are some options:\n1. Ask about our services.\n2. Get customer support.';
        } else {
            responseMsg = `You said: ${incomingMsg}`;
        }

        // Add the message to the TwiML response
        twiml.message(responseMsg);
        
        // Set response header to 'text/xml' for TwiML
        res.writeHead(200, { 'Content-Type': 'text/xml' });

        // Send the TwiML response
        res.end(twiml.toString());

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Failed to process the message',
            error: error.message
        });
    }
});



//---------------------------USER ROUTES------------------------------------------------
app.use("/api/user", userRoutes)

app.listen(port, () => {
    console.log("Server Is Running At " + port)
})