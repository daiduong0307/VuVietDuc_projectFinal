const userModel = require('../models/Users');
const appUserModel = require('../models/AppUser');
const tokenModel = require('../models/token');
const crypto = require('crypto');
const Joi = require('joi');
const { sendMailReset } = require('../middleware/sendingMail');

exports.getResetPage = async (req, res) => {
    const title = 'Reset your password';

    try {
        res.render('forgotPassword', { title: title });
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.getLinkReset = async (req, res) => {
    try {
        const schema = Joi.object({ email: Joi.string().email().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            const msg = {
                err: "user with given email doesn't exist",
            };
            return res.status(400).json(msg);
        }
        const userAcc = await appUserModel.findOne({ _id: user.accountId });

        let token = await tokenModel.findOne({ userId: userAcc._id });
        if (!token) {
            token = await new tokenModel({
                userId: userAcc._id,
                token: crypto.randomBytes(32).toString('hex'),
            }).save();
        }

        const link = `${process.env.BASE_URL}/password-reset/${userAcc._id}/${token.token}`;
        const sendMail = await sendMailReset(user.email, 'Password reset', link);
        console.log(sendMail);

        const msg = {
            success: 'password reset link sent to your email account',
        };
        res.json(msg);
    } catch (error) {
        res.send('An error occurred');
        console.log(error);
    }
};

exports.resetPwd = async (req, res) => {
    const title = 'Reset Password';
    const { userId, token } = req.params;
    try {
        res.render('resetPassword', {
            title: title,
            userId,
            token,
        });
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.resetPassword = async (req, res) => {
    const password = req.body.password;
    let msg;
    try {
        const schema = Joi.object({ password: Joi.string().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const userAcc = await appUserModel.findById(req.params.userId);
        const user = await userModel.findOne({ accountId: userAcc._id });
        if (!user) return res.status(400).send('invalid link or expired');

        const token = await tokenModel.findOne({
            userId: userAcc._id,
            token: req.params.token,
        });

        msg = {
            err: 'Invalid link or expired',
        };
        if (!token) return res.status(400).json(msg);

        if (password) {
            if (password.length < 8 || password.includes('password')) {
                const errorPassword = {
                    err: `Password must be at least 8 characters !!! Password cannot contain "password"`,
                };
                return res.status(400).json(errorPassword);
            }
        }
        userAcc.password = password;
        await userAcc.save();
        await token.delete();

        msg = {
            success: 'password reset successfully',
        };
        res.json(msg);
    } catch (error) {
        res.send('An error occurred');
        console.log(error);
    }
};
