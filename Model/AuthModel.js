const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./UserModel');

const AuthSchema = new mongoose.Schema({
    email : {
        type : String,
        required :[true,'Please Enter The Email'],
        maxlength : [100,'The Email Cannot Be More Than 500 Character'],
        unique : true
    },
    password : {
        type : String,
        required :[true,'Please Enter Password'],
        minlength : [6,"The Password Cannot Be Les Than 6"]
    },
    forgetPasswordQuestion : {
        type : String,
        required : [true,"Please Enter The Question Required For Password Recovery"],
        maxlength :[500,"The Question Length Cannot Be More Than 500"]
    },
    forgetPasswordAnswer : {
        type : String,
        required : [true,"Please Enter The Answer Required For Password Recovery"],
        maxlength :[500,"The Answer Length Cannot Be More Than 500"]
    },
    name : {
        type : String,
        required :[true,'Please Enter The Name'],
        minlength : [6,"The Name Cannot Be Less Than 6"],
        maxlength : [50,'The Name Can Not More Than 500 Character']
    },
    forgotPasswordToken : {
        type : String
    },
    forgotPasswordTokenExpires : {
        type : Date
    }
});

AuthSchema.post('save',async function(){
    const userToInsert = new User({
        id : this._id,
    });
    await userToInsert.save();
    console.log(userToInsert);
});

AuthSchema.methods.generateAuthToken = function(){
    const userToken = jwt.sign({_id : this._id }, 'PrivateKeyBook');
    return userToken;
};

AuthSchema.methods.generatePasswordRecoveryToken = async function(){
    console.log("This",this);
    const passwordRecoveryToken = jwt.sign({ email : this.email },
        'PrivateKeyForPassword'
        ,{expiresIn : '5m'}
    );
    console.log(passwordRecoveryToken);
    const authUser = await AuthModel.findOneAndUpdate({ email : this.email },{
        $set : {
            'forgotPasswordToken' : passwordRecoveryToken,
            'forgotPasswordTokenExpires' : Date.now() + 5*60*1000
        }
    })
    console.log("Generate Password Token");
    console.log(authUser);
    return passwordRecoveryToken;
};

AuthSchema.methods.matchdePasswordToken = function(passwordToken){
    console.log("Match Token");
    console.log(this);
    console.log(passwordToken);
    if(this.forgotPasswordToken == passwordToken){
        const result = jwt.verify(passwordToken,'PrivateKeyForPassword');
        console.log("Match Password Token");
        return { result, Question : this.forgetPasswordQuestion, Answer : this.forgetPasswordAnswer} ;
    }else{
        return false;
    }
};

const AuthModel = mongoose.model('Auth',AuthSchema);

module.exports = AuthModel;