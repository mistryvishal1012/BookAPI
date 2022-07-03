const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const Auth = require('../Model/AuthModel');
const User = require('../Model/UserModel');
const cookieMiddleware = require('../middleware/cookieMiddleware');


router.get('/me', cookieMiddleware,async (req,res)=>{
    const user = await Auth.findById(req.user._id).select({ _id:0, name : 1, email : 1, forgetPasswordAnswer : 1, forgetPasswordQuestion : 1});
    res.status(200).json(user);
});

router.post('/forgotpassword',async (req,res)=>{
    const authUser = await Auth.findOne( { email : req.body.email, name : req.body.name } );
    if(!authUser){
        return res.status(404).json("User Does not Exists");
    }
    const passwordRecoveryToken = await authUser.generatePasswordRecoveryToken();
    res.status(200).json(`${passwordRecoveryToken}`)
});


router.get('/passwordRecovery/:question', async(req,res) => {
    const result = jwt.verify(req.params.question,'PrivateKeyForPassword');
    const authUser =  await Auth.findOne( { email : result.email } );
    if(!authUser){
        return res.status(404).json("User Does not Exists");
    }else{
        return res.status(200).json({ 'email':result.email, 'Question' : authUser.forgetPasswordQuestion, 'Answer' : authUser.forgetPasswordAnswer});
    }
});

router.post('/passwordRecovery/:question', async(req,res) => {
    const result = jwt.verify(req.params.question,'PrivateKeyForPassword');
    const authUser =  await Auth.findOne( { email : result.email } );
    if(authUser && (authUser.forgetPasswordAnswer == req.body.Answer)){
        const salt1 = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.newPassword,salt1);
        const updateUser = await Auth.findByIdAndUpdate({ _id : authUser._id },{
            $set : { 'password' : password }
        })
        res.status(200).json(`Password Changed Successfully for User ${result.email}`);
    }else{
        if(!authUser){
            return res.status(404).json("User Doesn't Exists")
        }   
        if(authUser.forgetPasswordAnswer != req.body.Answer){
            return res.status(404).json("Answer is Invalid")
        }
    }
});

router.post('/changePassword',cookieMiddleware,async(req,res) => {
    const authUser =  await Auth.findById({ _id : req.user._id });
    const result = await bcrypt.compare(req.body.currentPassword,authUser.password);
    if(!result){
        return res.status(404).json("Current Password is Incorrect");
    }
    const salt1 = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.newPassword,salt1);
    const updateUser = await Auth.findByIdAndUpdate({ _id : req.user._id },{
        $set : { 'password' : password }
    })
    res.status(200).json("Password Changed Successfully");
});

router.post('/register', async(req,res)=>{
    const salt1 = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password,salt1);
    const user = await Auth.find({
        'email' : req.body.email
    })
    console.log(user)
    if(user.length > 0){
        console.log("User Already Exists")
        return res.status(401).json({
            'message' : "User Already Exists"
        })
    }
    const authUser = new Auth({
        name : req.body.name,
        email : req.body.email,
        password : password,
        forgetPasswordQuestion : req.body.forgotPasswordQuestion,
        forgetPasswordAnswer : req.body.forgotPasswordAnswer
    });
    console.log(authUser)
    try {
        const result = await authUser.save()
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Credentials',true);                 
        return res.status(200).json(`Registered`);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            'message' : 'Server Error'
        })
    }
});

router.post('/login', async(req,res)=>{
    const authUser = await Auth.findOne({
        email : req.body.email
    });
    const result = await bcrypt.compare(req.body.password,authUser.password);
    if(result){
        const authUserToken = await authUser.generateAuthToken();
        console.log(authUserToken);
        const cookieoptions = {
            expires : new Date(Date.now() + 24*60*60*1000)
        }
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Credentials',true);
        return res.status(200).cookie("x-auth-token",authUserToken,cookieoptions).json("Loggned");
    }else{
        return res.status(200).json("Invalid Password");
    }
});

router.post('/update', cookieMiddleware ,async(req,res)=>{
    const authUserProperty = ['email','name','password','forgetPasswordQuestion','forgetPasswordAnswer'];
    const authUser = await Auth.findById(req.user._id)
    const newAuthUser = new Auth({
        name : (req.body.updateUser.name == "") ? authUser.name : req.body.updateUser.name ,
        email : (req.body.updateUser.email == "") ? authUser.email : req.body.updateUser.email,
        password : authUser.password, 
        forgetPasswordQuestion :(req.body.updateUser.forgetPasswordQuestion == "") ? authUser.forgetPasswordQuestion : req.body.updateUser.forgetPasswordQuestion,
        forgetPasswordAnswer : (req.body.updateUser.forgetPasswordAnswer == "") ? authUser.forgetPasswordAnswer : req.body.updateUser.forgetPasswordAnswer
    });
    let options = {} ;
    authUserProperty.forEach((property) => {
        if( authUserProperty[property] != newAuthUser[property] ){
            options[property] = newAuthUser[property]
        }
    })
    const result = await Auth.updateOne(
        {
            _id : req.user._id
        },
        {
            $set : options
        }
    )
    res.status(200).json(result.acknowledged);
});


module.exports = router;