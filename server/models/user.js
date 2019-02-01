var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var titlize = require("mongoose-title-case");
var validate = require("mongoose-validator");

var nameValidator = [
    validate({
        validator: "isLength",
        arguments: [3, 30],
        message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
    }),
    validate({
        validator: 'matches',
        arguments: /^([a-zA-Z]{3,15})\s([a-zA-Z]{3,15})$/,
        message: 'Name Should be FirstName And SurName with Space between them',
    })
]

var usernameValidator = [
    validate({
        validator: "isLength",
        arguments: [3, 15],
        message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
    }),
    validate({
        validator: 'isAlphanumeric',
        message: 'Username should contain Letters and Numbers only',
    })
]

var emailValidator = [
    validate({
        validator: 'isEmail',
        message: 'Provide valid Email ID',
    })
]

var passwordValidator = [
    validate({
        validator: "isLength",
        arguments: [4, 15],
        message: 'Passowrd should be between {ARGS[0]} and {ARGS[1]} characters'
    }),
    validate({
        validator: 'matches',
        arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).{1,}$/,
        message: 'Password must contain at least one uppercase, lowercase & numeric character'
    })
]

var userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate: nameValidator,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        validate: usernameValidator
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase : true,
        validate: emailValidator
    },
    password: {
        type: String,
        required: true,
        validate: passwordValidator
    },
    passwordResetToken : {
        type: String,
        required: false
    },
    activationToken : {
        type : String,
        required: true
    },
    accountVerified: {
        type : Boolean,
        required : true,
        default : false
    }
}, { collection: "users" });

userSchema.plugin(titlize, {
    paths : ['name']
})

userSchema.pre('save', function (next) {
    var user = this;

    if(!user.isModified('password')) return next();

    bcrypt.hash(user.password, 5, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
});

userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
}   

module.exports = mongoose.model("user", userSchema);