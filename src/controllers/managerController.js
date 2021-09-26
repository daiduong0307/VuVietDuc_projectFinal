const appUserModel = require('../models/AppUser');
const managerModel = require('../models/Manager');
const categoryModel = require('../models/Catagories');
const blogModel = require('../models/Blogs');
const commentModel = require('../models/comment');
const userModel = require('../models/Users');

// manager homepage
exports.homePage = async (req, res) => {
    const title = 'Manager Homepage';

    const managerInfo = await managerModel
        .findOne({ accountId: req.session.userId })
        .populate('categoryId');
    const managerAcc = await appUserModel.findOne({ _id: req.session.userId });

    try {
        res.render('managerViews/homepage', {
            title,
            managerInfo,
            managerAcc,
        });
    } catch (error) {
        res.status(404).send(error.message);
    }
};

exports.getUpdateAccount = async (req, res) => {
    const title = 'Update Account';
    const { infoError, infoSucceed, accError, accSucceed } = req.query;

    const managerInfo = await managerModel.findOne({
        accountId: req.session.userId,
    });
    const managerAcc = await appUserModel.findOne({ _id: req.session.userId });

    try {
        res.render('managerViews/updateAccount', {
            title,

            infoError,
            accError,
            infoSucceed,
            accSucceed,

            managerInfo,
            managerAcc,
        });
    } catch (error) {
        res.status(404).send(error.message);
    }
};

exports.updateAcc = async (req, res) => {
    const { accId, password } = req.body;

    const newValues = {};
    if (password) newValues.password = password;

    try {
        if (password) {
            if (password.length < 8 || password.includes('password')) {
                const errorPassword =
                    `Password must be at least 8 characters !!!` +
                    `\nPassword cannot contain "password"`;
                return res.redirect(`/managers/updateAccount?accError=${errorPassword}`);
            }
        } else {
            const updateAcc = await appUserModel.findOneAndUpdate(
                { _id: accId },
                { $set: newValues },
                { new: true },
            );
        }

        const msgSucceed = 'Account changed successfully !!!';
        res.redirect(`/managers/updateAccount?accSucceed=${msgSucceed}`);
    } catch (error) {
        res.send(error.message);
    }
};

exports.updateInfo = async (req, res) => {
    const { accId, fullName, email, DoB } = req.body;

    const newValues = {};
    if (fullName) newValues.fullName = fullName;
    if (email) newValues.email = email;
    if (DoB) newValues.DoB = DoB;

    const emailExist = await managerModel.findOne({ email });

    if (emailExist) {
        const msg = 'Email already exists !!!';
        return res.redirect(`/managers/updateAccount?infoError=${msg}`);
    }

    try {
        if (!fullName || !introduction || !DoB || !email) {
            const updateInfo = await managerModel.findOneAndUpdate(
                { _id: accId },
                { $set: newValues },
                { new: true, useFindAndModify: false },
            );
        }

        const msgSucceed = 'Information changed Successfully !!!';
        return res.redirect(`/managers/updateAccount?infoSucceed=${msgSucceed}`);
    } catch (error) {
        res.send(error.message);
    }
};

exports.allRequest = async (req, res) => {
    const title = 'All User Request';

    const managerInfo = await managerModel
        .findOne({ accountId: req.session.userId })
        .populate('categoryId');
    const categories = await categoryModel.find({});
    const userAcc = await appUserModel.find({ role: 'user' });

    try {
        if (managerInfo.categoryId) {
            const userBlog = await blogModel
                .find({ categoryId: managerInfo.categoryId })
                .sort({ createdAt: -1 })
                .populate({ path: 'owner', populate: { path: 'accountId' } })
                .populate('categoryId');

            res.render('managerViews/allRequest', {
                title,
                userAcc,
                userBlog,
                managerInfo,
                categories,
            });
        }
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.searchRequest = async (req, res) => {
    const title = 'All User Request';
    const { timeFrom, timeTo, username } = req.query;

    // var regExp = new RegExp(keySearch, "i");

    const managerInfo = await managerModel
        .findOne({ accountId: req.session.userId })
        .populate('categoryId');
    const categories = await categoryModel.find({});
    const userAcc = await appUserModel.find({ role: 'user' });

    try {
        if (managerInfo.categoryId) {
            const searchBlog = await blogModel
                .find({
                    categoryId: managerInfo.categoryId,
                    $or: [
                        {
                            createdAt: {
                                $gte: timeFrom,
                                $lte: timeTo,
                            },
                        },
                        { owner: username },
                    ],
                })
                .sort({ createdAt: -1 })
                .populate({ path: 'owner', populate: { path: 'accountId' } })
                .populate('categoryId');

            res.render('managerViews/allRequest', {
                title,
                userBlog: searchBlog,
                userAcc,
                managerInfo,
                categories,
            });
        }
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.approveBlog = async (req, res) => {
    const { blogId } = req.body;

    const blog = await blogModel.findOne({ _id: blogId });

    const category = await categoryModel.findOne({ _id: blog.categoryId });

    try {
        const approvedBlog = await blogModel.findOneAndUpdate(
            { _id: blogId },
            { $set: { isPublish: 'Approved' } },
            { new: true, useFindAndModify: false },
        );

        await category.posts.push(approvedBlog);
        category.save();

        res.redirect('/managers/allRequest');
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.rejectBlog = async (req, res) => {
    const { blogId } = req.body;

    const blog = await blogModel.findOne({ _id: blogId });

    try {
        const rejectBlog = await blogModel.findOneAndUpdate(
            { _id: blogId },
            { $set: { isPublish: 'Rejected' } },
            { new: true, useFindAndModify: false },
        );

        const category = await categoryModel.findOneAndUpdate(
            { posts: blog._id },
            { $pull: { posts: blog._id } },
            { new: true, useFindAndModify: false },
        );

        res.redirect('/managers/allRequest');
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.blogDetails = async (req, res) => {
    const title = 'User Blog Details';
    const blogId = req.params.id;

    const managerInfo = await managerModel
        .findOne({ accountId: req.session.userId })
        .populate('categoryId');

    const blog = await blogModel.findOne({ _id: blogId }).populate('owner').populate('categoryId');

    try {
        res.render('managerViews/blogDetails', {
            title,
            managerInfo,
            blog,
        });
    } catch (error) {
        res.status(404).send(error);
    }
};
