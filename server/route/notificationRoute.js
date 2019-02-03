var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var config = require('../../config');

var User = require("../models/user");
var Notification = require('../models/notifications').Notification;

router.use((req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers.token;

    if (token) {
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                req.decoded = null;
                next();
            } else {
                req.decoded = decoded;
                next();
            }
        })
    } else {
        req.decoded = null;
        next();
    }
})

router.get('/all', (req, res)=>{
    if(req.decoded){
        User.findOne({username: req.decoded.username}, {notificationList:1}, (err, user)=>{
            if(user){
                user.populate('notificationList', {}, null, {sort : {notificationDate : -1}}, (err, doc)=>{
                    res.json({success:true, notifications: doc.notificationList})
                })
            }else{
                res.json({success: false, message: 'Something Wrong with Token'})
            }
        })
    }else{
        res.json({success: false, message: 'Something Wrong with Token'})
    }
})

module.exports = router;