var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    comments: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'comments' }],
    updatedAt: { type: Date, required: true }
}, { collection: 'posts' });

var commentSchema = new mongoose.Schema({
    post: { type: String },
    createdBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
    body: { type: String },
    createdAt: { type: Date },
    replys: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'replys' }],
    deletedComment: { type: Boolean }
}, { collection: 'comments' });

var replySchema = new mongoose.Schema({
    repliedBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
    body: { type: String, required: true },
    createdAt: { type: Date, required: true }
}, { collection: 'replys' });

module.exports = {
    "Post": mongoose.model('posts', postSchema),
    "Comment": mongoose.model('comments', commentSchema),
    "Reply": mongoose.model('replys', replySchema)
}