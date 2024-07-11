const secretKey=process.env.JWT_KEY
const JWT = require('jsonwebtoken')

const generateToken=(id)=>
{
    return JWT.sign({id},secretKey,{expiresIn:'1h'},)
}

module.exports=generateToken;
