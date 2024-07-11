const express=require('express')
const { registerUser, authUser,forgetPassword,resetPassword } = require('../Controllers/UserControllers')
const router=express.Router()

router.route('/').post(registerUser)
router.post('/login',authUser)
router.post('/forgetpassword',forgetPassword)
router.post('/resetpassword/:resetToken',resetPassword)

module.exports = router; 