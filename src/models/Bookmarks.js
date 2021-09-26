const { Schema, model } = require('mongoose');

const bookmarkSchema = new Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: 'users',
        },
        postId: {
            type: Schema.Types.ObjectId,
            ref: 'blogs',
        },
    },
    {
        timestamps: true,
    },
);

bookmarkSchema.virtual('bookmark_Blog', {
    ref: 'users',
    localField: '_id',
    foreignField: 'bookmarks',
});

const bookmark = model('bookmarks', bookmarkSchema);

module.exports = bookmark;
