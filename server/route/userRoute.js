var express = require("express");
var router = express.Router();

var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

var config = require('../../config');
var User = require("../models/user");


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'awcod37@gmail.com', // Your email address
        pass: 'karbonn11' // Your password
    },
    tls: { rejectUnauthorized: false }
});

router.post("/register", (req, res) => {

    if (!req.body.name || !req.body.username || !req.body.email || !req.body.password) {
        res.json({ success: false, message: 'All Fields are required.' });
    } else {
        var activationToken = jwt.sign({ username: req.body.username }, config.secret, { expiresIn: '1h' });

        var user = new User({
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            passwordResetToken: null,
            activationToken: activationToken
        })

        user.save((err) => {
            if (err) {
                if (err.errors) {
                    if (err.errors.name) {
                        res.json({ success: false, message: err.errors.name.message });
                    } else if (err.errors.username) {
                        res.json({ success: false, message: err.errors.username.message })
                    } else if (err.errors.email) {
                        res.json({ success: false, message: err.errors.email.message })
                    } else if (err.errors.password) {
                        res.json({ success: false, message: err.errors.password.message })
                    } else {
                        res.json({ success: false, message: err })
                    }
                } else if (err.code == '11000') {
                    if (err.errmsg[75] == 'u') {
                        res.json({ success: false, message: 'Username not Available.' });
                    } else if (err.errmsg[75] == 'e') {
                        res.json({ success: false, message: 'Email already exists.' });
                    } else {
                        res.json({ success: false, message: err });
                    }
                } else {
                    res.json({ success: false, message: err });
                }
            } else {

                var mail = {
                    from: 'From Angular2+Authentication, <awcod37@gmail.com>',
                    to: user.email,
                    subject: 'Email ID Verification',
                    html: '<div><strong>From Angular2+Authentication,</strong></div><br><strong>Hello, ' + user.name + '</strong><br><br><img src="http://www.thepanelstation.com/htmlfiles/confirmation-template/images/thankyou-for-registration-confirmation-temp-eng.png" /><br><br>. Please click on the link below to verify account:<br><br><a href="http://localhost:3000/activate/' + user.activationToken + '"><strong>VERIFY ACCOUNT</strong></a>'
                }
                transporter.sendMail(mail, (err, info) => {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console
                        console.log('sent to: ' + user.email); // Log e-mail 
                    }
                })

                res.json({ success: true, message: "Account registered Successfully. Check Email ID for Activation Link." });
            }
        })
    }

});

router.post("/checkUsername", (req, res) => {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            res.json({ success: false, message: err });
        } else if (user) {
            res.json({ success: false, message: "Username not Available." });
        } else {
            res.json({ success: true, message: "Username Available." });
        }
    })
})

router.post("/checkEmail", (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            res.json({ success: false, message: err });
        } else if (user) {
            res.json({ success: false, message: "Email Already Exists." });
        } else {
            res.json({ success: true, message: "Valid Email ID." });
        }
    })
})

router.post("/login", (req, res) => {
    if (req.body.username) {
        User.findOne({ username: req.body.username }, (err, user) => {
            if (err) {
                res.json({ success: false, message: err });
            } else if (!user) {
                res.json({ success: false, message: "Username Not Exists." });
            } else if (!req.body.password) {
                res.json({ success: false, message: "Password Required." });
            } else if (!user.validPassword(req.body.password)) {
                res.json({ success: false, message: "Password Incorrect." });
            } else if (!user.accountVerified) {
                res.json({ success: false, message: 'Account is not yet Activated.Check email for Activaton Link.', activationLink: true })
            } else {
                var token = jwt.sign({ 'name': user.name, 'username': user.username, 'email': user.email }, config.secret, { expiresIn: '12h' });
                res.json({ success: true, message: "User Authenticated!!", token: token });
            }
        })
    } else {
        res.json({ success: false, message: "Username Required." });
    }
})

router.post("/sendActivationLink", (req, res) => {
    if (req.body.email) {
        User.findOne({ email: req.body.email }).select('name username email activationToken accountVerified').exec((err, user) => {
            if (err) {
                res.json({ success: false, message: err });
            } else if (!user) {
                res.json({ success: false, message: "Email ID not found." });
            } else if (user.accountVerified) {
                res.json({ success: true, message: "Account is already Activated.Please Log IN." });
            } else {
                user.accountVerified = false;
                user.activationToken = jwt.sign({ username: user.username }, config.secret, { expiresIn: '1h' });

                user.save((err) => {
                    if (err) {
                        res.json({ success: false, message: err });
                    } else {

                        var mail = {
                            from: 'From Angular2+Authentication, <awcod37@gmail.com>',
                            to: user.email,
                            subject: 'Email ID Verification',
                            html: '<div><strong>From Angular2+Authentication,</strong></div><br><strong>Hello, ' + user.name + '</strong><br><br>You recently requested for Activation link. Please click on the link below to verify account:<br><br><a href="http://localhost:3000/activate/' + user.activationToken + '"><strong>VERIFY ACCOUNT</strong></a>'
                        }
                        transporter.sendMail(mail, (err, info) => {
                            if (err) {
                                console.log(err); // If error with sending e-mail, log to console/terminal
                            } else {
                                console.log(info); // Log success message to console
                                console.log('sent to: ' + user.email); // Log e-mail 
                            }
                        })

                        res.json({ success: true, message: "Check Email ID for Activation Link." });
                    }
                })
            }
        })
    } else {
        res.json({ success: false, message: "Please provide Email ID." });
    }
})

router.put("/activate/:token", (req, res) => {
    if (req.params.token) {
        jwt.verify(req.params.token, config.secret, (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    res.json({ success: false, message: 'has expired.' });
                } else {
                    res.json({ success: false, message: "is Invalid." })
                }
            } else {
                User.findOne({ activationToken: req.params.token }).select('name username email activationToken accountVerified').exec((err, user) => {
                    if (err) {
                        res.json({ success: false, message: "is Invalid." })
                    } else if (!user) {
                        res.json({ success: false, message: "is already used." })
                    } else if (decoded.username && (decoded.username == user.username)) {
                        user.activationToken = false;
                        user.accountVerified = true;

                        user.save((err) => {
                            if (err) {
                                res.json({ success: false, message: err })
                            } else {
                                res.json({ success: true, message: "Account Activated." });
                            }
                        })
                    } else {
                        res.json({ success: false, message: "is Invalid." })
                    }
                })
            }
        })
    } else {
        res.json({ success: false, message: "does not have token." })
    }
})

router.post("/forgotPassword", (req, res) => {
    if (req.body.email) {
        User.findOne({ email: req.body.email }).select('name username email passwordResetToken accountVerified').exec((err, user) => {
            if (err) {
                res.json({ success: false, message: err });
            } else if (!user) {
                res.json({ success: false, message: "Email ID not found." });
            } else if (!user.accountVerified) {
                res.json({ success: false, message: 'Account is not yet Activated.Check email for Activaton Link.', activationLink: true })
            } else {
                var passwordResetToken = jwt.sign({ userID: user._id }, config.secret, { expiresIn: "10m" })

                user.passwordResetToken = passwordResetToken;

                user.save((err) => {
                    if (err) {
                        res.json({ success: false, message: err });
                    } else {
                        var mail = {
                            from: 'From Angular2+Authentication, <awcod37@gmail.com>',
                            to: user.email,
                            subject: 'Reset Password Request',
                            html: '<div><strong>From Angular2+Authentication,</strong></div><br><strong>Hello, ' + user.name + '</strong><br>You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://localhost:3000/resetPassword/' + user.passwordResetToken + '"><strong>RESET PASSWORD</strong></a>'
                        }
                        transporter.sendMail(mail, (err, info) => {
                            if (err) {
                                console.log(err); // If error with sending e-mail, log to console/terminal
                            } else {
                                console.log(info); // Log success message to console
                                console.log('sent to: ' + user.email); // Log e-mail 
                            }
                        })
                        res.json({ success: true, message: "Password Link has been sent to your Email ID which is valid only for 10m." });
                    }
                })
            }
        })
    } else {
        res.json({ success: false, message: "Please Provide an Email ID." })
    }
})

router.get('/resetPassword/:token', (req, res) => {
    if (req.params.token) {
        jwt.verify(req.params.token, config.secret, (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    res.json({ success: false, message: 'has expired.' });
                } else {
                    res.json({ success: false, message: "is Invalid." })
                }
            } else {
                User.findOne({ passwordResetToken: req.params.token }, (err, user) => {
                    if (err) {
                        res.json({ success: false, message: "is Invalid." })
                    } else if (!user) {
                        res.json({ success: false, message: "is already used OR token not found" })
                    } else if (decoded.userID && (decoded.userID == user._id)) {
                        res.json({ success: true, userID: decoded.userID });
                    } else {
                        res.json({ success: false, message: "is Invalid." })
                    }
                })
            }
        })
    } else {
        res.json({ success: false, message: "does not have token." })
    }
})

router.put('/resetPassword', (req, res) => {
    if (req.body.userID && req.body.password) {
        User.findOne({ _id: req.body.userID }, (err, user) => {
            if (err) {
                res.json({ success: false, message: err })
            } else if (!user) {
                res.json({ success: false, message: "User not Found." })
            } else {
                user.passwordResetToken = null;
                user.password = req.body.password;

                user.save((err) => {
                    if (err) {
                        res.json({ success: false, message: err })
                    } else {
                        res.json({ success: true, message: "Password is changed Successfully." })
                    }
                })
            }
        })
    } else {
        res.json({ success: false, message: "Please provide Password." })
    }
});

router.use((req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers.token;

    if (token) {
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                req.decoded = null;
                res.json({ success: false, message: 'Token Invalid.' });
            } else {
                req.decoded = decoded;
                next();
            }
        })
    } else {
        req.decoded = null;
        res.json({ success: false, message: 'Token Not Provided.' });
    }
})

router.get('/me', (req, res) => {
    res.json({ success: true, message: req.decoded });
});

router.get('/profilePic', (req, res)=>{
    if(req.decoded){
        User.findOne({username: req.decoded.username}, {profilePic: 1}, (err, user)=>{
            if(err){
                res.json({success: false, message: err})
            }else if(!user){
                res.json({success: false, message: 'User not found'})
            }else{
                res.json({success: true, profilePic: user.profilePic.toString('base64')});
            }
        })
    }else{
        res.json({success: false, message: 'Something went wrong.'});
    }
})

module.exports = router;