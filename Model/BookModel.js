const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title : {
        type : String,
        required :[true,'Please Enter The Book Name'],
        maxlength : [100,'The Name Of The Book Can No Be More Than 500 Character']
    },
    authors : {
        type : [String],
        required :[true,'Please Enter The Author\'s Name'],
        maxlength : [100,'The Author\'s Name Of The Book Can No Be More Than 500 Character']
    }, 
    shortDescription : {
        type : String,
        //required :[true,'Please Enter The Short Description Of Book'],
        maxlength : [500,'The Description Of The Book Can No Be More Than 500 Character']
    },
    longDescription : {
        type : String,
        //required :[true,'Please Enter The Long Description Of Book'],
        maxlength : [500,'The Description Of The Book Can No Be More Than 500 Character']
    },
    publishedDate:{
        type : Date,
        //required : [true,"Please Enter The Publication Date Of Book"]
    },
    isbn:{
        type:Number,
        required : [true,'Please Enter The ISBN Number Of The Book'],
    },
    pageCount :{
        type : Number,
        required : [true,"PLease Enter The Length Of Book"]
    },
    thumbnailUrl : {
        type : String
    },
    status : {
        type : String,
        default : "PUBLISH"
    },
    categories : {
        type : [String],
        required : [true,"Please Enter The Categories Of The Book"]
    },
    learningStage : {
        type : String,
        enum : ["Not Started","Started","Partially Completed","Fully Completed"],
        default : "Not Started"
    },
    pagesCompleted : {
        type : Number,
        default : 0
    },
    dateAdded : {
        type : Date,
        default : Date.now()
    }
});

const BookModel = mongoose.model('Book',BookSchema);

module.exports = BookModel;