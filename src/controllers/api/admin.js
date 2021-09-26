const appUserModel = require('../../models/AppUser');
const userModel = require('../../models/Users');
const blogModel = require('../../models/Blogs');
const categoryModel = require('../../models/Catagories');
const commentModel = require('../../models/comment');
const managerModel = require('../../models/Manager');
const tagModel = require('../../models/BlogTags');

exports.allCategory = async (req, res) => {
    const categories = await categoryModel.find({}).populate('managedBy');

    res.json(categories);
};

exports.allTag = async (req, res) => {
    const tags = await tagModel.find({});

    res.json(tags);
};

exports.allManager = async (req, res) => {
    const managers = await managerModel
        .find({})
        .populate('accountId')
        .sort({ createdAt: -1 })
        .populate('categoryId');

    res.json(managers);
};

exports.allUser = async (req, res) => {
    const users = await userModel.find({}).sort({ createdAt: -1 }).populate('accountId');

    res.json(users);
};
