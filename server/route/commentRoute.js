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

router.put('/updateComment/:commentID', (req, res) => {
    if (req.decoded && req.body.editBody) {
        Comment.findOneAndUpdate({ $and: [{ _id: req.params.commentID }, { createdBy: req.decoded.username }] }, { body: req.body.editBody }, (err, comment) => {
            if (err) {
                res.json({ success: false, message: err });
            } else if (!comment) {
                res.json({ success: false, message: 'Comment to be updated not found' });
            } else {
                res.json({ success: true, message: 'Comment Edited!!' })
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
                var newReply = new Reply({
                    repliedBy: req.decoded.username,
                    body: req.body.replyBody,
                    createdAt: Date.now()
                })

                task.save(newReply)
                task.update(doc, { $push: { replys: newReply } })
                if (req.decoded.username !== doc.createdBy) {
                    User.findOne({ username: doc.createdBy }, { notificationList: 1 }, (err, user) => {
                        if (err) {
                            res.json({ success: false, message: err });
                        } else if (!user) {
                            res.json({ success: false, message: "Reply not Saved...Something went Wrong." });
                        } else {
                            var newNotification = Notification({
                                user: doc.createdBy,
                                from: req.decoded.username,
                                body: "replied on your comment.",
                                target: {
                                    post: doc.post,
                                    commentID: doc,
                                    replyID: newReply
                                },
                                notificationDate: Date.now()
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
                } else {
                    task.run({ useMongoose: true })
                        .then((results) => {
                            res.json({ success: true, message: "Reply Saved!!" })
                        })
                        .catch((err) => {
                            res.json({ success: false, message: err })
                        })
                }

            }
        })
    } else {
        res.json({ success: false, message: 'Please provide proper data.' })
    }
})

router.put('/updateReply/:replyID', (req, res) => {
    if (req.decoded && req.body.editReplyBody) {
        Reply.findOneAndUpdate({ $and: [{ _id: req.params.replyID }, { repliedBy: req.decoded.username }] }, { body: req.body.editReplyBody }, (err, reply) => {
            if (err) {
                res.json({ success: false, message: err });
            } else if (!reply) {
                res.json({ success: false, message: 'Reply to be updated not found' });
            } else {
                res.json({ success: true, message: 'Reply Edited!!' })
            }
        })
    } else {
        res.json({ success: false, message: 'Please provide proper data.' })
    }
})

module.exports = router;