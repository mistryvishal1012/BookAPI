const mongoose = require('mongoose');

const objectID = (req,res,next) => {
    console.log(req.params);
    if(mongoose.Types.ObjectId.isValid(req.params.id)){
        next();
    }else{
        res.status(404).json("ObjectID of Resource is Invalid");
    }
}

module.exports = objectID;