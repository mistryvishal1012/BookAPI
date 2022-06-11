const res = require("express/lib/response");

module.exports = (err) =>{
    console.group("Error",err);
    res.status(500).json("Server Error");
}