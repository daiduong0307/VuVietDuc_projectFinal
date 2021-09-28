const appUserModel = require('../models/AppUser');
const userModel = require('../models/Users');
const bcrypt = require('bcrypt');

exports.signUpAdmin = async (req, res, next) => {
    const user = appUserModel({
        username: 'admin',
        password: 'admin1234',
        role: 'admin',
    });

    try {
        await user.save();
        console.log(user);
        return res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.getSignUpUser = async (req, res, next) => {
    const { errAcc, errPwd } = req.query;
    try {
        res.render('signUp', {
            notify: {
                errAcc,
                errPwd,
            },
            title: 'Sign up an Account',
        });
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.signUpUser = async (req, res) => {
    const { username, email, password, fullName } = req.body;

    const accountExist = await appUserModel.findOne({
        username,
        role: 'user',
    });

    if (accountExist) {
        const errorUsername = 'Username has already exist !!!';
        return res.redirect(`/auth/signup?errAcc=${errorUsername}`);
    } else if (password.length < 8 || password.includes('password')) {
        const errorPassword = `Password must be at least 8 characters !!!
    Password cannot contain "password"`;
        return res.redirect(`/auth/signup?errPwd=${errorPassword}`);
    }

    try {
        const newAccount = new appUserModel({
            username,
            password,
            role: 'user',
        });

        await newAccount.save();

        const userAcc = await appUserModel.findOne({ username });

        const newUser = new userModel({
            fullName,
            email,
            accountId: userAcc._id,
        });

        await newUser.save();
        return res.redirect('/users/home');
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.getLogin = async (req, res, next) => {
    const { msg } = req.query;
    try {
        res.render('login', { err: msg, title: 'Login to your Account' });
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.login = async (req, res, next) => {
    console.log(req.body);
    const { username, password } = req.body;

    const user = await appUserModel.findOne({ username });

    if (!user) {
        const msg = 'User not found !!!';
        return res.redirect(`/auth/login?msg=${msg}`);
    }

    try {
        const same = await bcrypt.compare(password, user.password);

        if (same) {
            req.session.userId = user._id;
            req.session.isAdmin = user.role === 'admin' ? true : false;
            req.session.isUser = user.role === 'user' ? true : false;
            req.session.isManager = user.role === 'manager' ? true : false;

            if (user.role === 'admin') {
                return res.redirect('/admin/home');
            } else if (user.role === 'user') {
                return res.redirect('/users/home');
            } else {
                return res.redirect('/managers/home');
            }
        } else {
            const msg = 'Username or Password is incorrect !!!';
            return res.redirect(`/auth/login?msg=${msg}`);
        }
    } catch (error) {
        console.log(error);
        return res.redirect('/auth/login');
    }
};

exports.logout = (req, res, next) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
};
