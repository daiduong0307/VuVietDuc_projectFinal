const { Schema, model } = require('mongoose');
const validator = require('validator');

const managerSchema = new Schema(
    {
        fullName: {
            type: String,
            require: true,
            lowercase: true,
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
        isResponsible: {
            type: Boolean,
            default: false,
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'categories',
        },
        DoB: {
            type: String,
            trim: true,
            default: 'NULL',
        },

        accountId: {
            type: Schema.Types.ObjectId,
            ref: 'AppUser',
        },
    },
    {
        timestamps: true,
    }
);

managerSchema.pre('remove', function (next) {
    // Remove all the assignment docs that reference the removed person.
    this.model('categorySchema').remove({ managedBy: this._id }, next);
});

const manager = model('managers', managerSchema);

module.exports = manager;
