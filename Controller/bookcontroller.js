const express = require('express');
const router = express.Router();
const Book = require('../Model/BookModel');
const ObjectIDMiddleWare = require('../middleware/objectIDMidleware');
const cookieMidleware = require('../middleware/cookieMiddleware');
const UserModel = require('../Model/UserModel');
const BookModel = require('../Model/BookModel');

router.get('/home',cookieMidleware,async(req,res)=>{
    const books = await UserModel.find({ id : req.user._id}).select().populate('book');
    const userBooks = books[0].book;
    if(userBooks.length == 0){
        return res.status(200).json("Please Enter The Book")
    }
    const categoriesToSend = {};
    const learningStageToSend = {
        "Not Started" : 0,
        "Started" : 0,
        "Partially Completed" :0,
        "Fully Completed" : 0
    };
    userBooks.forEach((book) => {
        book["categories"].forEach((category) => {
            if(categoriesToSend[category]){
                categoriesToSend[category] = categoriesToSend[category] + 1;
            }else{
                categoriesToSend[category] = 1;
            }
            learningStageToSend[book.learningStage] = learningStageToSend[book.learningStage] + 1;
        })
    })
    const responseToSend = {
        category : categoriesToSend, 
        learningStage : learningStageToSend
    }
    res.status(200).json(responseToSend);
});

router.get('/', cookieMidleware ,async(req,res) => {
    let sortquery = {};
    let selectquery = {};
    let serachquery = '';
    if(req.query.sort){
        const fileds = req.query.sort.split(',');
        const order = req.query.order.split(',');
        fileds.forEach(function(field){
            if(order == 'ASC'){
                sortquery[field] = 1;   
            }else{
                sortquery[field] = -1;   
            }
        });
    }else{
        sortquery['dateAdded']=1;
    }

    

    if(req.query.select){
        const fileds = req.query.select.split(',');
        fileds.forEach(function(field){
            selectquery[field] = 1;   
        });
    }

    if(req.query.search){
        const fileds = req.query.search.split('-');
        fileds.forEach(function(field){
            serachquery = field;
        })
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = 3;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalBooks = await UserModel.findOne({ id : req.user._id});
    let total = totalBooks.totalBook;
    let books;
    if(serachquery != ''){
        let userBooks = await UserModel.find({ id : req.user._id},{ book : 1});
        console.log(userBooks[0].book);
        books = await BookModel.aggregate([
            {
                $match : { 
                    $text : {
                        $search  : serachquery
                    },
                    _id : {
                        $in : userBooks[0].book
                    }  
                }
            }
        ])
        total = books.length
        books = await BookModel.aggregate([
            {
                $match : { 
                    $text : {
                        $search  : serachquery
                    },
                    _id : {
                        $in : userBooks[0].book
                    }  
                }
            }
        ]).skip(startIndex).limit(limit);
    }else{
        books = await UserModel.find({ id : req.user._id },{ id : 0,book:{ $slice : [startIndex,limit] } , _id:0 })
        .populate('book',selectquery,null,{ sort : sortquery});
    }
    

    var pagination = {

    };

    if (endIndex < total) {
        pagination['next'] = {
        page: page + 1,
        limit,
        total
        };
    }

    if (startIndex > 0) {
        pagination['prev'] = {
        page: page - 1,
        limit,
        total
        };
    }


    if(total == 0){
        return res.status(200).json("No Books Found For The Query")
    }else{
        return res.status(200).json({'book' : books, 'pagination' : pagination});
    }
});

router.get('/:id',[cookieMidleware ,ObjectIDMiddleWare],async(req,res) => {
    const book = await Book.findById(req.params.id);
    if(!book){
        res.status(404).json(`Resource With Given ${req.params.id} do not found.`);
    }else{
        res.status(200).json(book);
    }
});


router.post('/',cookieMidleware,async (req,res) => {
   const bookToInsert = new Book({
       title : req.body.title, 
       isbn : req.body.isbn, 
       pageCount : req.body.pageCount, 
       publishedDate : req.body.publishedDate, 
       thumbnailUrl : req.body.thumbnailUrl, 
       shortdescription : req.body.shortdescription,
       longdescription : req.body.longdescription,
       status : req.body.status, 
       authors : req.body.authors,
       categories : req.body.categories
   });
   try{
       const book = bookToInsert.save();
       const user = await UserModel.findByIdAndUpdate(req.user._id,{
           $inc : { 'totalBook' : +1 },
           $push : { 'book' : bookToInsert._id }
       })
       res.status(200).json(bookToInsert);
   }catch(err){
       const bookToDelete = await BookModel.findByIdAndDelete(bookToInsert._id);
       const userToUpdate = await UserModel.findByIdAndUpdate({
        id : req.user._id },{
            $inc : { totalBook : -1 },
            $pull : { 'book' : req.params.id }
        })
       res.status(500).json("Cannot Save The Book");
   }
});

router.delete('/:id',[cookieMidleware ,ObjectIDMiddleWare],async (req,res) => {
    const book = await Book.findById(req.params.id);
    if(!book){
        return res.status(404).json(`Resource With Given ${req.params.id} do not found.`);
    }
    try{
        const bookToDeleteFromUser = await UserModel.updateOne({
            id : req.user._id },{
                $inc : { totalBook : -1 },
                $pull : { 'book' : req.params.id }
            }
        )
        const bookDeleted = await BookModel.findByIdAndDelete(req.params.id);
        res.status(200).json(`Course With Id ${req.params.id} is Deleted`)
    }catch(err){
        const bookToDeleteFromUser = await UserModel.updateOne({
            id : req.user._id },{
                $inc : { totalBook : +1 },
                $pull : { 'book' : book._id }
            }
        )
        const bookDeleted = await book.save();
        res.status(500).json(`Course With Id ${req.params.id} is Not Deleted`)
    }  
});

router.put('/:id',[cookieMidleware ,ObjectIDMiddleWare],async (req,res) => {
    const book = await Book.findById(req.params.id);
    if(!book){
        res.status(404).json(`Resource With Given ${req.params.id} do not found.`);
    }else{
        book.learningCompleted = req.body.Stage;
        res.status(200).json(book);
    }
    try{
        const bookToUpdate = await Book.findByIdAndUpdate(req.params.id,req.body)
        res.status(200).json(`Course With Id ${req.params.id} is Updated`)
    }catch{
        const bookToUpdate = await Book.findByIdAndUpdate(req.params.id,book)
        res.status(500).json(`Course With Id ${req.params.id} is Not Updated`)
    }
    
});

module.exports = router;