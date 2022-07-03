const mongoose = require('mongoose');
const UserModel = require('../Model/UserModel');

const bookId = async (req,res,next) => {
    console.log(req.params);
    const userBooks = await UserModel.findOne({
        id : req.user._id
    });
    if(mongoose.Types.ObjectId.isValid(req.params.id) && userBooks.book.includes(req.params.id)){
       next();
    }else{
        res.status(404).json("ObjectID of Resource is Invalid");
    }
}

module.exports = bookId;