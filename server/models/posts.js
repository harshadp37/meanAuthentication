var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    comments: [{type : mongoose.SchemaTypes.ObjectId, ref:'comment'}],
    updatedAt: { type: Date, required: true }
}, { collection: 'posts' });

var commentSchema = new mongoose.Schema({
    createdBy: { type: String, required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, required: true },
    replys:[{type: mongoose.SchemaTypes.ObjectId, ref:'reply'}]
}, {collection: 'comments'});

var replySchema = new mongoose.Schema({
    repliedBy: { type: String, required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, required: true }
}, {collection: 'replys'});

module.exports = {
    "Post": mongoose.model('post', postSchema),
    "Comment": mongoose.model('comment', commentSchema),
    "Reply": mongoose.model('reply', replySchema)
}