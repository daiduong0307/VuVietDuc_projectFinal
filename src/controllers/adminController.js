const appUserModel = require('../models/AppUser');
const userModel = require('../models/Users');
const managerModel = require('../models/Manager');
const categoryModel = require('../models/Catagories');
const blogModel = require('../models/Blogs');
const commentModel = require('../models/comment');
const tagModel = require('../models/BlogTags');
const bookmarkModel = require('../models/Bookmarks');

// admin homepage
exports.homePage = async (req, res) => {
    const title = 'Admin Homepage';
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    const admin = await appUserModel.findOne({ _id: req.session.userId });

    const categories = await categoryModel.find({});

    const data = await blogModel.aggregate([
        { $match: { createdAt: { $gte: lastYear }, isPublish: 'Approved' } },
        {
            $project: {
                month: { $month: '$createdAt' },
            },
        },
        {
            $group: {
                _id: '$month',
                total: { $sum: 1 },
            },
        },
    ]);

    const postData = getPostData(data, ['_id', 'total']);

    const number_of_posts = getNumber_Of_Posts(postData);
    const post_in_month = getMonth_Of_Posts(postData);

    try {
        res.render('adminViews/homepage', {
            title,
            admin,
            categories,
            datai: JSON.stringify(number_of_posts),
            labeli: JSON.stringify(post_in_month),
        });
    } catch (error) {
        res.status(404).send(error.message);
    }
};

function getPostData(obj1, obj2) {
    return obj1.map(function (row) {
        var result = {};
        obj2.forEach(function (key) {
            result[key] = row[key];
        });
        return result;
    });
}

function getNumber_Of_Posts(postData) {
    var data = [];
    var i = 0;
    postData.forEach(function (content, callback) {
        for (var key in content) {
            //console.log('key: '+key, ', value: '+ content[key]);
            if (key == 'total') {
                data[i] = content[key];
            }
        }
        i++;
    });

    return data;
}

function getMonth_Of_Posts(postData) {
    var data = [];
    var i = 0;
    postData.forEach(function (content, callback) {
        for (var key in content) {
            //console.log('key: '+key, ', value: '+ content[key]);
            if (key == '_id') {
                data[i] = content[key];
            }
        }
        i++;
    });
    return data;
}

// List all user accounts
exports.allUserAccount = async (req, res) => {
    const title = 'List of User Accounts';
    const perPage = 5;
    const page = req.query.p || 1;

    const users = await userModel
        .find({})
        .sort({ createdAt: -1 })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate('accountId');
    const countUser = await userModel.countDocuments();

    const userAcc = await appUserModel.find({ role: 'user' });
    const admin = await appUserModel.findOne({ _id: req.session.userId });

    try {
        res.render('adminViews/listAllUserAcc', {
            users,
            userAcc,
            title,
            admin,
            pagination: {
                page: page, // Current Page
                pageCount: Math.ceil(countUser / perPage), // Total pages to display
            },
        });
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
};

exports.searchUser = async (req, res) => {
    const title = 'List of User Accounts';
    const { timeFrom, timeTo, username } = req.query;
    const perPage = 5;
    const page = req.query.p || 1;

    const admin = await appUserModel.findOne({ _id: req.session.userId });
    const userAcc = await appUserModel.find({ role: 'user' });
    const countUser = await userModel.countDocuments();

    // const usersFindEmail = await userModel.find({}).or([{ email: regExpEmail },]).sort({ "createdAt": -1 }).populate("accountId");
    // const users = await userModel.find({ createdAt: { $gte: timeFrom, $lte: timeTo } }).sort({ "createdAt": -1 }).populate("accountId");
    const users = await userModel
        .find({
            $or: [{ accountId: username }, { createdAt: { $gte: timeFrom, $lte: timeTo } }],
        })
        .sort({ createdAt: -1 })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate('accountId');

    try {
        res.render('adminViews/listAllUserAcc', {
            users,
            timeFrom,
            timeTo,
            username,
            userAcc,
            title,
            admin,
            pagination: {
                page: page, // Current Page
                pageCount: Math.ceil(countUser / perPage), // Total pages to display
            },
        });
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
};

// get update user page
exports.getUpdateUser = async (req, res) => {
    const title = 'Update User Account';
    const userId = req.params.id;
    const { error, success } = req.query;

    const admin = await appUserModel.findOne({ _id: req.session.userId });
    const userInfo = await userModel.findOne({ _id: userId });

    try {
        res.render('adminViews/updateUserAcc', {
            title,
            notify: {
                error,
                success,
            },
            admin,
            data: {
                _id: userInfo._id,
                userInfo,
            },
        });
    } catch (error) {
        console.log(error);
        res.redirect('/admin/allUserAcc');
    }
};

// Update one user account
exports.updateOneUser = async (req, res) => {
    const { fullName, email, DoB, _id } = req.body;
    const newValues = {};
    if (fullName) newValues.fullName = fullName;
    if (email) newValues.email = email;
    if (DoB) newValues.DoB = DoB;

    const emailExist = await userModel.findOne({ email });

    if (emailExist) {
        // res.status(400).send();
        const msg = "Sorry, that email's taken. Try another?";
        return res.redirect(`/admin/updateUser/${_id}?error=${msg}`);
    }
    const updatedUser = await userModel.findOneAndUpdate(
        { _id },
        { $set: newValues },
        { new: true },
    );
    try {
        console.log(updatedUser);
        const msg = 'Update Successfully!!!';
        return res.redirect(`/admin/updateUser/${_id}?success=${msg}`);
    } catch (error) {
        console.log(error);
        return res.render('adminViews/updateUserAcc');
    }
};

// Delete one user
exports.deleteOneUser = async (req, res) => {
    const accountId = req.params.id;

    try {
        const userAcc = await appUserModel.findOne({ _id: accountId });
        const userInfo = await userModel.findOne({ accountId });
        const userBlog = await blogModel.findOne({ _id: userInfo.posts });

        if (!userAcc) {
            return res.status(400).send('User Account is not exist');
        }

        if (userBlog) {
            const pullCate = await categoryModel.findOneAndUpdate(
                { posts: userBlog },
                { $pull: { posts: userBlog } },
                { new: true, useFindAndModify: false, multi: true },
            );
            const deleteUserBlog = await blogModel.deleteMany({
                _id: userInfo.posts,
            });
            const deleteBookmark = await bookmarkModel.deleteMany({ postId: userBlog._id });
            const deleteBlogComment = await commentModel.deleteMany({
                _id: userBlog.comments,
            });
        }

        const deleteUser = await userModel.findOneAndDelete({
            accountId: userAcc._id,
        });
        const deleteUserAcc = await appUserModel.findOneAndDelete({
            _id: accountId,
        });

        const obj = {
            msg: 'Delete Success',
        };

        res.json(obj);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// List all manager account
exports.allManagerAccount = async (req, res) => {
    const title = 'List of Manager Accounts';
    const perPage = 5;
    const page = req.query.p || 1;

    const countManager = await managerModel.countDocuments();
    const admin = await appUserModel.findOne({ _id: req.session.userId });
    const managers = await managerModel
        .find({})
        .populate('accountId')
        .sort({ createdAt: -1 })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate('categoryId');

    try {
        res.render('adminViews/listAllManagerAcc', {
            managers,
            admin,
            title,
            pagination: {
                page: page, // Current Page
                pageCount: Math.ceil(countManager / perPage), // Total pages to display
            },
        });
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
};

exports.searchManager = async (req, res) => {
    const title = 'List of Manager Accounts';
    const { timeFrom, timeTo, email } = req.query;
    const perPage = 5;
    const page = req.query.p || 1;

    let regExpEmail = '';
    if (!email) {
        regExpEmail = null;
    } else {
        regExpEmail = new RegExp(email, 'i');
    }

    const admin = await appUserModel.findOne({ _id: req.session.userId });
    const countManager = await managerModel.countDocuments();
    const managers = await managerModel
        .find({
            $or: [{ email: regExpEmail }, { createdAt: { $gte: timeFrom, $lte: timeTo } }],
        })
        .sort({ createdAt: -1 })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate('accountId')
        .populate('categoryId');

    try {
        res.render('adminViews/listAllManagerAcc', {
            managers,
            timeFrom,
            timeTo,
            email,
            admin,
            title,
            pagination: {
                page: page, // Current Page
                pageCount: Math.ceil(countManager / perPage), // Total pages to display
            },
        });
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
};

// get add managerAcc page
exports.getAddManagerAcc = async (req, res) => {
    const title = 'Adding new manager Account';
    const { errAcc, errPwd, errEmail } = req.query;

    const admin = await appUserModel.findOne({ _id: req.session.userId });
    const categories = await categoryModel.find({ isManaged: false });

    try {
        res.render('adminViews/addManager', {
            notify: {
                errAcc,
                errPwd,
                errEmail,
            },
            title,
            categories,
            admin,
        });
    } catch (error) {
        console.log(error);
    }
};

// add new manager account
exports.addOneManager = async (req, res) => {
    const { username, email, password, fullName, DoB, categoryId } = req.body;

    const accountExist = await appUserModel.findOne({
        username,
        role: 'manager',
    });
    const emailExist = await managerModel.findOne({ email });

    if (accountExist) {
        const errorUsername = "Sorry, that username's taken. Try another?";
        return res.redirect(`/admin/addManagerAcc?errAcc=${errorUsername}`);
    } else if (password.length < 8 || password.includes('password')) {
        const errorPassword = `Password must be at least 8 characters !!! Password cannot contain "password"`;
        return res.redirect(`/admin/addManagerAcc?errPwd=${errorPassword}`);
    } else if (emailExist) {
        const errorEmail = "Sorry, that email's taken. Try another?";
        return res.redirect(`/admin/addManagerAcc?errEmail=${errorEmail}`);
    }

    try {
        const newAccount = new appUserModel({
            username,
            password,
            role: 'manager',
        });

        await newAccount.save();

        const userAcc = await appUserModel.findOne({ username });

        const newUser = new managerModel({
            fullName,
            email,
            DoB,
            accountId: userAcc._id,
            categoryId,
        });

        const saveManager = await newUser.save();

        if (categoryId) {
            const updateCategory = await categoryModel.findOneAndUpdate(
                { _id: categoryId },
                { $set: { isManaged: true, managedBy: saveManager._id } },
                { new: true, useFindAndModify: false },
            );

            const updateManager = await managerModel.findOneAndUpdate(
                { _id: newUser._id },
                { $set: { isResponsible: true } },
                { new: true, useFindAndModify: false },
            );
        }

        return res.redirect('/admin/allManagerAcc');
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// get update manager page
exports.getUpdateManager = async (req, res) => {
    const title = 'Update Manager Account';
    const userId = req.params.id;
    const { error, success } = req.query;

    const admin = await appUserModel.findOne({ _id: req.session.userId });
    const managerInfo = await managerModel.findOne({ _id: userId }).populate('categoryId');
    const category = await categoryModel.find({ isManaged: false });

    try {
        res.render('adminViews/updateManagerAcc', {
            title,
            notify: {
                error,
                success,
            },
            admin,
            data: {
                _id: managerInfo._id,
                category,
                managerInfo,
            },
        });
    } catch (error) {
        console.log(error);
        res.redirect('/admin/allManagerAcc');
    }
};

// Update one manager account
exports.updateOneManager = async (req, res) => {
    const { fullName, email, DoB, categoryId, _id } = req.body;
    const newValues = {};
    if (fullName) newValues.fullName = fullName;
    if (email) newValues.email = email;
    if (DoB) newValues.DoB = DoB;
    if (categoryId) newValues.categoryId = categoryId;

    const emailExist = await managerModel.findOne({ email });
    const manager = await managerModel.findOne({ _id });

    try {
        if (emailExist) {
            // res.status(400).send();
            const msg = "Sorry, that email's taken. Try another?";
            return res.redirect(`/admin/updateManager/${_id}?error=${msg}`);
        }
        const updatedManager = await managerModel.findOneAndUpdate(
            { _id },
            { $set: newValues },
            { new: true, useFindAndModify: false },
        );

        await categoryModel.findOneAndUpdate(
            { _id: categoryId },
            { $set: { managedBy: _id } },
            { new: true, useFindAndModify: false },
        );

        const updateOldCate = await categoryModel.findOneAndUpdate(
            { _id: manager.categoryId },
            { $set: { isManaged: false } },
            { new: true, useFindAndModify: false },
        );

        if (categoryId) {
            const updateNewCate = await categoryModel.findOneAndUpdate(
                { _id: categoryId },
                { $set: { managedBy: _id, isManaged: true } },
                { new: true, useFindAndModify: false },
            );
            const updateNewResponsible = await managerModel.findOneAndUpdate(
                { _id },
                { $set: { isResponsible: true } },
                { new: true, useFindAndModify: false },
            );
        }

        // console.log(updatedManager);
        const success = 'Update Successfully';
        return res.redirect(`/admin/updateManager/${updatedManager._id}?success=${success}`);
    } catch (error) {
        console.log(error);
        return res.render('adminViews/updateManagerAcc');
    }
};

// Assign category to manager
exports.deprivationRights = async (req, res) => {
    const { categoryId, _id } = req.body;
    try {
        const updatedManager = await managerModel.findOneAndUpdate(
            { _id: _id },
            { $set: { categoryId: null, isResponsible: false } },
            { new: true, useFindAndModify: false },
        );

        await categoryModel.findOneAndUpdate(
            { _id: categoryId },
            { $set: { isManaged: false, managedBy: null } },
            { new: true, useFindAndModify: false },
        );

        const success = 'Update Successfully';
        return res.redirect(`/admin/updateManager/${updatedManager._id}?success=${success}`);
    } catch (error) {
        console.log(error);
        return res.render('adminViews/updateManagerAcc');
    }
};

// Delete one manager
exports.deleteOneManger = async (req, res) => {
    const accountId = req.params.id;

    const userAcc = await appUserModel.findOne({ _id: accountId });
    const managerInfo = await managerModel.findOne({ accountId });

    try {
        if (!userAcc) {
            return res.status(400).send('User Account is not exist');
        }
        const deleteManagerAcc = await appUserModel.findOneAndDelete({
            _id: accountId,
        });

        const deleteManager = await managerModel.findOneAndDelete({
            accountId: userAcc._id,
        });

        if (managerInfo.categoryId) {
            await categoryModel.findOneAndUpdate(
                { managedBy: managerInfo._id },
                { $set: { isManaged: false, managedBy: null } },
                { new: true, useFindAndModify: false },
            );
        }

        const obj = {
            msg: 'Delete Success',
        };

        res.json(obj);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// all categories
exports.allCategories = async (req, res) => {
    const title = 'List of categories';
    const perPage = 5;
    const page = req.query.p || 1;

    const countCat = await categoryModel.countDocuments();
    const admin = await appUserModel.findOne({ _id: req.session.userId });
    const categories = await categoryModel
        .find({})
        .sort({ createdAt: -1 })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate('managedBy');
    const managers = await managerModel.find({ isResponsible: false });

    try {
        res.render('adminViews/listAllCategories', {
            title,
            admin,
            categories,
            managers: managers,
            pagination: {
                page: page, // Current Page
                pageCount: Math.ceil(countCat / perPage), // Total pages to display
            },
        });
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
};

// // get adding category page
// exports.getAddCategory = async (req, res) => {
//     const title = "Adding new Blog Category";
//     const { msg } = req.query;

//     const admin = await appUserModel.findOne({ _id: req.session.userId });
//     const managers = await managerModel.find({ isResponsible: false });

//     try {
//         res.render("adminViews/addCategory", {
//             err: msg,
//             title: title,
//             admin: admin,
//             managers: managers,
//         });
//     } catch (error) {
//         console.log(error)
//     }
// }

// adding new category
exports.addOneCategory = async (req, res) => {
    const { name, describe, managerId } = req.body;

    const categoryExist = await categoryModel.findOne({ name });
    const manager = await managerModel.findOne({ _id: managerId });

    if (categoryExist) {
        const msg = "Please choose another tag name";
        return res.redirect(`/admin/addCategory?msg=${msg}`);
    }

    try {
        const newCategory = new categoryModel({
            name,
            describe,
            managedBy: managerId,
        });

        const saveCate = await newCategory.save();

        if (managerId) {
            const updateCate = await categoryModel.findOneAndUpdate(
                { _id: saveCate._id },
                { $set: { isManaged: true } },
                { new: true, useFindAndModify: false },
            );

            const updateManager = await managerModel.findOneAndUpdate(
                { _id: managerId },
                { $set: { isResponsible: true, categoryId: saveCate._id } },
                { new: true, useFindAndModify: false },
            );
        }

        return res.redirect('/admin/allCategories');
    } catch (error) {
        console.log(error);
    }
};

// get update category page
exports.getUpdateCategory = async (req, res) => {
    const title = 'Update Category Account';
    const _id = req.params.id;
    const { error, success } = req.query;

    const admin = await appUserModel.findOne({ _id: req.session.userId });
    const category = await categoryModel.findOne({ _id });

    try {
        res.render('adminViews/updateCategory', {
            title,
            notify: {
                error,
                success,
            },
            data: {
                _id: category._id,
                admin,
                category,
            },
        });
    } catch (error) {
        console.log(error);
        res.redirect('/admin/allCategories');
    }
};

// update one category
exports.updateOneCategory = async (req, res) => {
    const { name, describe, _id } = req.body;
    const newValues = {};
    if (name) newValues.name = name;
    if (describe) newValues.describe = describe;

    const nameExist = await categoryModel.findOne({ name });

    if (nameExist) {
        // res.status(400).send();
        const msg = "Please choose another tag name";
        return res.redirect(`/admin/updateCategory/${_id}?error=${msg}`);
    }

    try {
        const updatedCategory = await categoryModel.findOneAndUpdate(
            { _id },
            { $set: newValues },
            { new: true },
        );

        const success = 'Update Successfully!!!';
        return res.redirect(`/admin/updateCategory/${updatedCategory._id}?success=${success}`);
    } catch (error) {
        console.log(error);
        return res.render('admin/updateCategory');
    }
};

// Delete one category
exports.deleteOneCategory = async (req, res) => {
    const categoryId = req.params.id;

    const category = await categoryModel.findOne({ _id: categoryId });
    const blog = await blogModel.findOne({ categoryId: category._id });

    try {
        await categoryModel.findOneAndDelete({ _id: categoryId });

        if (blog) {
            await blogModel.deleteMany({ categoryId });
            await commentModel.deleteMany({ _id: blog.comments });
            await userModel.findOneAndUpdate(
                { posts: blog._id },
                { $pull: { posts: blog._id } },
                { new: true, useFindAndModify: false, multi: true },
            );
        }

        await managerModel.findOneAndUpdate(
            { categoryId },
            { $set: { isResponsible: false } },
            { new: true, useFindAndModify: false },
        );

        const obj = {
            msg: 'Delete Success',
        };

        res.json(obj);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.allTags = async (req, res) => {
    const title = 'List of tags';
    const { success, errTag } = req.query;
    const perPage = 5;
    const page = req.query.p || 1;

    const countTag = await tagModel.countDocuments();
    const admin = await appUserModel.findOne({ _id: req.session.userId });
    const tags = await tagModel
        .find({})
        .skip(perPage * page - perPage)
        .sort({ createdAt: -1 })
        .limit(perPage);

    try {
        res.render('adminViews/listAllTags', {
            title,
            admin,
            tags,
            notify: {
                success,
                errTag,
            },
            pagination: {
                page: page, // Current Page
                pageCount: Math.ceil(countTag / perPage), // Total pages to display
            },
        });
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
};

exports.addOneTag = async (req, res) => {
    const { tagName, tagDesc } = req.body;

    const duplicateTag = await tagModel.findOne({ name: tagName });

    if (duplicateTag) {
        const errTag = "that's tag arealdy taken";
        return res.redirect(`/admin/allTags?errTag=${errTag}`);
    }

    try {
        const newTag = new tagModel({
            name: tagName,
            describe: tagDesc,
        });

        await newTag.save();

        const success = 'Adding Successfully';
        return res.redirect(`/admin/allTags?success=${success}`);
    } catch (error) {
        res.status(404).send(error.message);
    }
};

exports.deleteOneTag = async (req, res) => {
    const tagId = req.params.id;

    const tag = await tagModel.findOne({ _id: tagId });
    const category = await categoryModel.findOne({ _id: tag.categoryId });

    try {
        const deleteTag = await tagModel.findOneAndDelete({ _id: tagId });
        if (tag) {
            const pullTag = await categoryModel.findOneAndUpdate(
                { tags: tagId },
                { $pull: { tags: tagId } },
                { new: true, useFindAndModify: false, multi: true },
            );
        }

        const obj = {
            msg: 'Delete Success',
        };

        res.json(obj);
    } catch (error) {
        res.status(400).send(error.message);
    }
};
