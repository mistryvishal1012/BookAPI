const jwt = require("jsonwebtoken");

const cookieMiddleware = (req,res,next) => {

    console.log(req.cookies);

    const token = req.cookies['x-auth-token'];
    if(!token){
        return res.status(404).json("No Token Found");
    }

    try{
        const user = jwt.verify(token,'PrivateKeyBook');
        if(!user){
            return res.status(404).json("Not Valid User");
        }else{
            req.user = user;
            next();
        }
    }catch(err){
        console.log(er);
        res.status(500).json("Server Error");
    }
}

module.exports = cookieMiddleware;