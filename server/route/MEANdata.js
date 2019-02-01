var express = require('express');
var router = express.Router();
var path = require("path");

router.get("/registrationData", (req, res)=>{
    res.sendFile(path.join(__dirname, "../../data/registrationData.json"));
})

router.get("/loginData", (req, res)=>{
    res.sendFile(path.join(__dirname, "../../data/loginData.json"));
})

module.exports = router;