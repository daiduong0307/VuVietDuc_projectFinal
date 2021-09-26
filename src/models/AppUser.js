const { Schema, model } = require('mongoose');
// const validator = require('validator');
const bcrypt = require('bcrypt');

const appUserSchema = new Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            trim: true,
            validate(value) {
                if (value.toLowerCase().includes('password')) {
                    throw new Error('Password cannot contain "password"');
                }
            },
        },
        role: {
            type: String,
            enum: ['admin', 'user', 'manager'],
            default: 'user',
        },
    },
    { timestamps: true },
);

// Hash the plain text password before saving
appUserSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

const appUser = model('AppUser', appUserSchema);

module.exports = appUser;
