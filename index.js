const express = require('express');
const cors = require('cors');
const mongodbuser = require('./Database/database');
const booksRouter = require('./Controller/bookcontroller');
const userRouter = require('./Controller/userController');
const cookieparser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
const jwt = require("jsonwebtoken");

const app = express();
const server = app.listen(8000,console.log("Listening On Port 8000"));

app.use(cors({
    origin : ["http://localhost:3000"],
    methods : ["GET","POST","PUT","DELETE"],
    credentials : true
    }));
        
app.use(express.json());
app.use(cookieparser());
app.use('/api/books',booksRouter);
app.use('/api/users',userRouter);
app.use(errorHandler);
