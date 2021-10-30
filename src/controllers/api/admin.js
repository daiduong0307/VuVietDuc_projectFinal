const appUserModel = require('../../models/AppUser');
const userModel = require('../../models/Users');
const blogModel = require('../../models/Blogs');
const categoryModel = require('../../models/Catagories');
const commentModel = require('../../models/comment');
const managerModel = require('../../models/Manager');
const tagModel = require('../../models/BlogTags');

exports.allCategory = async (req, res) => {
    const perPage = 5;
    const page = req.query.p || 1;

    const categories = await categoryModel
        .find({})
        .sort({ createdAt: -1 })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate('managedBy');

    res.json(categories);
};

exports.allTag = async (req, res) => {
    const perPage = 5;
    const page = req.query.p || 1;

    const tags = await tagModel
        .find({})
        .skip(perPage * page - perPage)
        .sort({ createdAt: -1 })
        .limit(perPage);

    res.json(tags);
};

exports.allManager = async (req, res) => {
    const perPage = 5;
    const page = req.query.p || 1;

    const managers = await managerModel
        .find({})
        .populate('accountId')
        .sort({ createdAt: -1 })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate('categoryId');

    res.json(managers);
};

exports.allUser = async (req, res) => {
    const perPage = 5;
    const page = req.query.p || 1;

    const users = await userModel
        .find({})
        .sort({ createdAt: -1 })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate('accountId');

    res.json(users);
};
