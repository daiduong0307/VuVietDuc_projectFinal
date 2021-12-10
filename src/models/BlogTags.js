const { Schema, model } = require('mongoose');

const tagSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        describe: {
            type: String,
            trim: true,
            default: 'No description',
        },
    },
    {
        timestamps: true,
    },
);

tagSchema.virtual('tagBlog', {
    ref: 'blogs',
    localField: '_id',
    foreignField: 'tags',
});

tagSchema.pre('save', function (next) {
    // capitalize
    this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
    next();
});

const tag = model('blogTags', tagSchema);

module.exports = tag;
