const { Schema, model } = require('mongoose');

const replySchema = new Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: 'users',
        },
        comment: {
            type: String,
            trim: true,
        },
        commentId: {
            type: Schema.Types.ObjectId,
            ref: 'comments',
        },
    },
    {
        timestamps: true,
    },
);

replySchema.virtual('commentBlog', {
    ref: 'comments',
    localField: '_id',
    foreignField: 'replies',
    count: true,
});

const reply = model('replies', replySchema);

module.exports = reply;
