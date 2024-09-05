require('dotenv').config()
const express=require('express')
const bodyParser = require('body-parser');
const mongoDBConnect = require('./Database/dbConnect')
const app=express()
mongoDBConnect()
const userRoutes=require('./Routes/UserRoutes')

const cors=require('cors')

const port=process.env.PORT || 5000
app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/',(req,resp)=>
{
    resp.send('Hello World')
})

app.post('/webhook', (req, res) => {
    const incomingMsg = req.body.Body;
    const senderNumber = req.body.From;
  
    console.log(`Received message: "${incomingMsg}" from ${senderNumber}`);
  
    // Process the message here
    const responseMsg = `You said: ${incomingMsg}`;
  
    client.messages
      .create({
        body: responseMsg,
        from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
        to: senderNumber
      })
      .then(message => console.log(`Message sent with SID: ${message.sid}`))
      .catch(err => console.error('Error sending message:', err));
  
    res.sendStatus(200);
  });

//---------------------------USER ROUTES------------------------------------------------
app.use("/api/user",userRoutes)

app.listen(port,()=>
{
    console.log("Server Is Running At "+port)
})