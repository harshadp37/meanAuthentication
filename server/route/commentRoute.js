var express = require('express');
var router = express.Router();
var Post = require('../models/posts').Post;
var Comment = require('../models/posts').Comment;
var Reply = require('../models/posts').Reply;
var Notification = require('../models/notifications').Notification;
var User = require("../models/user");

var jwt = require('jsonwebtoken');
var config = require('../../config');

var Fawn = require("fawn");

router.get('/:title', (req, res) => {

    Post.findOne({ title: req.params.title }, (err, doc) => {
        if (doc) {
            doc.populate('comments', {}, null, { sort: { 'createdAt': -1 } }, (err, doc) => {
                if (doc) {
                    doc.populate('comments.replys', (err, doc) => {
                        if (doc) {
                            res.json({ success: true, comments: doc.comments })
                        } else {
                            res.json({ success: true, comments: doc.comments })
                        }
                    })
                } else {
                    res.json({ success: false, message: "No Comments!!" })
                }
            })
        } else {
            res.json({ success: false, message: "No Comments!!" })
        }
    })
})

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

router.post('/saveComment/:title', (req, res) => {
    if (req.decoded && req.body.commentBody) {
        var newComment = new Comment({
            post: req.params.title,
            createdBy: req.decoded.username,
            body: req.body.commentBody,
            createdAt: Date.now()
        })

        newComment.save((err) => {
            if (err) {
                res.json({ success: false, message: err });
            } else {
                Post.findOne({ title: req.params.title }, (err, doc) => {
                    if (err) {
                        res.json({ success: false, message: err })
                    } else {
                        if (doc) {
                            doc.comments.push(newComment);
                            doc.updatedAt = Date.now();
                            doc.save((err) => {
                                if (err) {
                                    res.json({ success: false, message: err });
                                } else {
                                    res.json({ success: true, message: 'Comment Saved!!' })
                                }
                            })
                        } else {
                            var newPost = new Post({
                                title: req.params.title,
                                comments: [newComment],
                                updatedAt: Date.now()
                            })

                            newPost.save((err) => {
                                if (err) {
                                    res.json({ success: false, message: err });
                                } else {
                                    res.json({ success: true, message: 'Comment Saved!!' })
                                }
                            })
                        }
                    }
                })
            }
        })
    } else {
        res.json({ success: false, message: 'Please provide proper data.' })
    }
})

router.post('/saveEditedComment/:commentID', (req, res) => {
    if (req.decoded && req.body.editBody) {
        Comment.findOne({ _id: req.params.commentID }, (err, comment) => {
            if (err) {
                res.json({ success: false, message: err });
            } else if (comment) {
                comment.body = req.body.editBody;
                comment.save((err) => {
                    if (err) {
                        res.json({ success: false, message: err });
                    } else {
                        res.json({ success: true, message: 'Comment Edited!!' })
                    }
                })
            }
        })
    } else {
        res.json({ success: false, message: 'Please provide proper data.' })
    }
})

router.post('/saveReply/:commentID', (req, res) => {
    if (req.decoded && req.body.replyBody) {

        var task = Fawn.Task();

        Comment.findOne({ _id: req.params.commentID }, (err, doc) => {
            if (err) {
                res.json({ success: false, message: 'Reply not Saved...Something went Wrong.' })
            } else if (!doc) {
                res.json({ success: false, message: 'Reply not Saved...Something went Wrong.' })
            } else {
                User.findOne({ username: doc.createdBy }, { notificationList: 1 }, (err, user) => {
                    if (err) {
                        res.json({ success: false, message: err });
                    } else if (!user) {
                        res.json({ success: false, message: "Reply not Saved...Something went Wrong." });
                    } else {
                        var newReply = new Reply({
                            repliedBy: req.decoded.username,
                            body: req.body.replyBody,
                            createdAt: Date.now()
                        })

                        task.save(newReply)
                        task.update(doc, { $push: { replys: newReply } })
                        var newNotification = Notification({
                            user: doc.createdBy,
                            body: req.decoded.username + " replied on your comment",
                            target: {
                                post: doc.post,
                                commentID: doc,
                                replyID: newReply
                            },
                            notificationDate : Date.now()
                        })
                        task.save(newNotification);
                        task.update(user, { $push: { notificationList: newNotification } })
                        task.run({ useMongoose: true })
                            .then((results) => {
                                res.json({ success: true, message: "Reply Saved!!" })
                            })
                            .catch((err) => {
                                res.json({ success: false, message: err })
                            })
                    }
                })
            }
        })
    } else {
        res.json({ success: false, message: 'Please provide proper data.' })
    }
})

module.exports = router;