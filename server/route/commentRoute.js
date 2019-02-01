var express = require('express');
var router = express.Router();
var Post = require('../models/posts').Post;
var Comment = require('../models/posts').Comment;
var Reply = require('../models/posts').Reply;

router.get('/:title', (req, res) => {

    Post.findOne({ title: req.params.title }, (err, doc) => {
        if (doc) {
            doc.populate('comments', (err, doc) => {
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

router.post('/saveComment/:title', (req, res) => {
    if (req.body.username && req.body.commentBody) {
        var newComment = new Comment({
            createdBy: req.body.username,
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
    if (req.body.editBody) {
        Comment.findOne({_id : req.params.commentID}, (err, comment)=>{
            if(err){
                res.json({ success: false, message: err });
            }else if(comment){
                comment.body = req.body.editBody;
                comment.save((err)=>{
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
    if (req.body.username && req.body.replyBody) {
        var newReply = new Reply({
            repliedBy: req.body.username,
            body: req.body.replyBody,
            createdAt: Date.now()
        })

        Comment.findOne({ _id: req.params.commentID }, (err, doc) => {
            if (err) {
                res.json({ success: false, message: 'Reply not Saved...Something went Wrong.' })
            } else if (!doc) {
                res.json({ success: false, message: 'Reply not Saved...Something went Wrong.' })
            } else {
                newReply.save((err) => {
                    if (err) {
                        res.json({ success: false, message: err });
                    } else {
                        doc.replys.push(newReply);
                        doc.save((err) => {
                            if (err) {
                                res.json({ success: false, message: err });
                            } else {
                                res.json({ success: true, message: 'Reply Saved!!' })
                            }
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