const { Schema, model } = require('mongoose');

const categorySchema = new Schema(
    {
        name: {
            type: String,
            require: true,
            unique: true,
            trim: true,
        },
        describe: {
            type: String,
            trim: true,
            default: 'NULL',
        },
        isManaged: {
            type: Boolean,
            default: false,
        },
        posts: [
            {
                type: Schema.Types.ObjectId,
                ref: 'blogs',
            },
        ],
        managedBy: {
            type: Schema.Types.ObjectId,
            ref: 'managers',
        },
    },
    { timestamps: true },
);

categorySchema.pre('save', function (next) {
    // capitalize
    this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
    next();
});

const category = model('categories', categorySchema);

module.exports = category;
