var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

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

router.delete('/deleteComment/:commentID', (req, res) => {
    if (req.decoded) {
        Comment.findOne({ $and: [{ _id: req.params.commentID }, { createdBy: req.decoded.username }] }, (err, comment) => {
            if (err) {
                res.json({ success: false, message: err })
            } else if (!comment) {
                res.json({ success: false, message: 'Comment to be deleted not found' })
            } else {
                if (comment.replys.length > 0) {
                    comment.post = null
                    comment.createdBy = null
                    comment.body = null
                    comment.deletedComment = true;
                    comment.save((err) => {
                        if (err) {
                            res.json({ success: false, message: err })
                        } else {
                            res.json({ success: true, message: 'Comment Deleted' })
                        }
                    })
                } else {
                    Post.findOneAndUpdate({ title: comment.post }, { $pull: { comments: comment._id }, updatedAt: Date.now() }, (err, post) => {
                        if (err) {
                            res.json({ success: false, message: err })
                        } else if (!post) {
                            res.json({ success: false, message: 'Something west wrong.' })
                        } else {
                            comment.remove((err) => {
                                if (err) {
                                    res.json({ success: false, message: err })
                                } else {
                                    res.json({ success: true, message: 'Comment Deleted' })
                                }
                            })
                        }
                    })
                }
            }
        })
    } else {
        res.json({ success: false, message: 'Something Wrong with token.' })
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
                task.save(newReply);
                task.update(doc, { $push: { replys: newReply } })
                task.run({ useMongoose: true })
                    .then((results) => {
                        res.json({ success: true, message: "Reply Saved!!" })
                    })
                    .catch((err) => {
                        res.json({ success: false, message: err })
                    })
                if (req.decoded.username !== doc.createdBy) {
                    User.findOne({ username: doc.createdBy }, { notificationList: 1 }, (err, commentUser) => {
                        if (err) {
                            res.json({ success: false, message: err });
                        } else if (!commentUser) {
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
                            newNotification.save();
                            commentUser.notificationList.push(newNotification);
                            commentUser.save();
                            sendOtherNotification(req, doc, newReply)
                        }
                    })
                }else{
                    sendOtherNotification(req, doc, newReply);
                }
            }
        })
    } else {
        res.json({ success: false, message: 'Please provide proper data.' })
    }
})

function sendOtherNotification(req, doc, newReply){
    if (doc.replys.length != 0) {
        Reply.find({ _id: doc.replys }, (err, replys) => {
            if (err) {
                console.log(err);
            } else if (!replys) {
                console.log('Replys not found');
            } else {
                let replysUsername = [];
                for (let i = 0; i < replys.length; i++) {
                    if (req.decoded.username !== replys[i].repliedBy && doc.createdBy !== replys[i].repliedBy) {
                        replysUsername.indexOf(replys[i].repliedBy) === -1 ? replysUsername.push(replys[i].repliedBy) : '';
                    }
                }
                for (let j = 0; j < replysUsername.length; j++) {
                    User.findOne({ username: replysUsername[j] }, { notificationList: 1 }, (err, replyUser) => {
                        if (err) {
                            console.log(err);
                        } else if (!replyUser) {
                            console.log('ReplyUser not found');
                        } else {
                            var newNotification = Notification({
                                user: replysUsername[j],
                                from: req.decoded.username,
                                body: "also replied on " + (req.decoded.username === doc.createdBy ? 'his' : doc.createdBy + "'s") + " comment.",
                                target: {
                                    post: doc.post,
                                    commentID: doc,
                                    replyID: newReply
                                },
                                notificationDate: Date.now()
                            })
                            newNotification.save();
                            replyUser.notificationList.push(newNotification)
                            replyUser.save();
                        }
                    })
                }
            }
        })
    }
}

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

router.delete('/deleteReply/:replyID', (req, res) => {
    if (req.decoded) {
        Reply.findOne({ $and: [{ _id: req.params.replyID }, { repliedBy: req.decoded.username }] }, (err, reply) => {
            if (err) {
                res.json({ success: false, message: err })
            } else if (!reply) {
                res.json({ success: false, message: 'Reply to be deleted not found.' })
            } else {
                Comment.findOne({ replys: reply._id }, (err, comment) => {
                    if (err) {
                        res.json({ success: false, message: err })
                    } else if (!comment) {
                        res.json({ success: false, message: 'Something went wrong.' })
                    } else {
                        if (comment.replys.length === 1 && comment.deletedComment) {
                            Post.findOneAndUpdate({ comments: comment._id }, { $pull: { comments: comment._id }, updatedAt: Date.now() }, (err, post) => {
                                if (err) {
                                    res.json({ success: false, message: err })
                                } else if (!post) {
                                    res.json({ success: false, message: 'Something west wrong.' })
                                } else {
                                    comment.remove((err) => {
                                        if (err) {
                                            res.json({ success: false, message: err })
                                        } else {
                                            reply.remove((err) => {
                                                if (err) {
                                                    res.json({ success: false, message: err })
                                                } else {
                                                    res.json({ success: true, message: 'Reply Deleted' })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        } else {
                            comment.replys.splice(comment.replys.indexOf(reply._id), 1);
                            comment.save((err) => {
                                if (err) {
                                    res.json({ success: false, message: err })
                                } else {
                                    reply.remove((err) => {
                                        if (err) {
                                            res.json({ success: false, message: err })
                                        } else {
                                            res.json({ success: true, message: 'Reply Deleted' })
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            }
        })
    } else {
        res.json({ success: false, message: 'Something wrong with token.' })
    }
})

module.exports = router;