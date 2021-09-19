const { Schema, model } = require('mongoose');
const validator = require('validator');

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            require: true,
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Email is invalid');
                }
            },
        },
        introduction: {
            type: String,
            trim: true,
            default: 'NULL',
        },
        DoB: {
            type: Date,
        },
        avatar: {
            type: String,
            default: 'avtUser/avatar_04.png',
        },
        posts: [
            {
                type: Schema.Types.ObjectId,
                ref: 'blogs',
            },
        ],
        bookmarks: [
            {
                type: Schema.Types.ObjectId,
                ref: 'bookmarks',
            },
        ],
        accountId: {
            type: Schema.Types.ObjectId,
            ref: 'AppUser',
        },
    },
    { timestamps: true }
);

userSchema.pre('save', function (next) {
    // capitalize
    const user = this;
    user.fullName.charAt(0).toUpperCase() +
        user.fullName.slice(1).toLowerCase();
    next();
});

const user = model('users', userSchema);

module.exports = user;
