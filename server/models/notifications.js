var mongoose = require('mongoose');

var notificationSchema = mongoose.Schema({
    user: { type: String, required: true },
    from : {type: String},
    body: { type: String, required: true },
    target: {
        post: { type: String, required: true },
        commentID: { type: mongoose.SchemaTypes.ObjectId, required: true, ref:'comments' },
        replyID: { type: mongoose.SchemaTypes.ObjectId, ref:'replys' }
    },
    seen: { type: Boolean, required: true, default: false },
    notificationDate : {type:Date, required:true}
}, {collection: 'notifications'})

module.exports = {
    "Notification" : mongoose.model('notifications', notificationSchema)
};