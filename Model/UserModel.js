const mongoose = require('mongoose');


const UserSchema =  new mongoose.Schema({
    id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Auth'
    },
    book : {
        type : [mongoose.Schema.Types.ObjectId],
        ref : 'Book'
    },
    totalBook : {
        type : Number,
        default : 0
    }
});

const UserModel = mongoose.model('User',UserSchema);


module.exports = UserModel;