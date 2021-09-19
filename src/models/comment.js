const { Schema, model } = require('mongoose');

const commentSchema = new Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: 'users',
        },
        comment: {
            type: String,
            trim: true,
        },
        postId: {
            type: Schema.Types.ObjectId,
            ref: 'blogs',
        },
        replies: [
            {
                type: Schema.Types.ObjectId,
                ref: 'replies',
            },
        ],
    },
    {
        timestamps: true,
    }
);

commentSchema.virtual('commentBlog', {
    ref: 'blogs',
    localField: '_id',
    foreignField: 'comments',
});

const comment = model('comments', commentSchema);

module.exports = comment;
