const { Schema, model } = require('mongoose');

const blogSchema = new Schema(
    {
        titleName: {
            type: String,
            trim: true,
            require: true,
        },
        brief: {
            type: String,
            trim: true,
            default: 'NULL',
        },
        mainImage: {
            type: String,
        },
        blogContent: {
            type: String,
            default: 'NULL',
        },
        isPublish: {
            type: String,
            enum: ['Submitted', 'Approved', 'Rejected'],
            default: 'Submitted',
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'users',
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'categories',
        },
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'comments',
            },
        ],
        tags: [
            {
                type: Schema.Types.ObjectId,
                ref: 'blogTags',
            },
        ],
        views: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

blogSchema.virtual('user', {
    ref: 'users',
    localField: '_id',
    foreignField: 'posts',
});

blogSchema.virtual('blogCategory', {
    ref: 'categories',
    localField: '_id',
    foreignField: 'posts',
});

const blogs = model('blogs', blogSchema);

module.exports = blogs;
