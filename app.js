require('dotenv').config()
const express=require('express')
const mongoDBConnect = require('./Database/dbConnect')
const app=express()
mongoDBConnect()
const userRoutes=require('./Routes/UserRoutes')

const cors=require('cors')

const port=process.env.PORT || 5000
app.use(cors())
app.use(express.json())

app.get('/',(req,resp)=>
{
    resp.send('Hello World')
})
//---------------------------USER ROUTES------------------------------------------------
app.use("/api/user",userRoutes)

app.listen(port,()=>
{
    console.log("Server Is Running At "+port)
})