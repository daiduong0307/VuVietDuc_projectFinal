const appUserModel = require('../models/AppUser');
const userModel = require('../models/Users');
const blogModel = require('../models/Blogs');
const categoryModel = require('../models/Catagories');
const commentModel = require('../models/comment');
const replyModel = require('../models/ReplyComment');
const managerModel = require('../models/Manager');
const bookmarkModel = require('../models/Bookmarks');
const tagModel = require('../models/BlogTags');
const fs = require('fs');
const nodemailer = require('../middleware/sendingMail');

const limitLatest = 8;
const limitPopular = 3;

// users homepage
exports.homePage = async (req, res) => {
    const title = 'Revive';
    const { msg } = req.query;

    const perPage = 6;
    const page = req.query.p || 1;

    const userInfo = await userModel
        .findOne({ accountId: req.session.userId })
        .populate('accountId');
    const blogs = await blogModel
        .find({ isPublish: 'Approved' })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate('owner')
        .populate('categoryId')
        .sort({ createdAt: -1 });
    const categories = await categoryModel.find({});
    const tags = await tagModel.find({}).limit(12);

    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);
    const popularBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ views: -1 })
        .limit(limitPopular)
        .populate('owner');

    const countBlog = await blogModel.countDocuments({ isPublish: 'Approved' });
    const random = Math.floor(Math.random() * countBlog);

    const slideBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .skip(random)
        .limit(4)
        .populate('owner')
        .populate('categoryId');

    if (!blogs) {
        const msg = 'There is no blog !!!';
        return res.redirect(`/users/home?msg=${msg}`);
    }

    try {
        res.render('userViews/homepage', {
            title,
            err: msg,
            userInfo,
            latestPost,
            popularBlog,
            categories,
            tags,
            slideBlog,
            blogs,

            currentPage: page, // Current Page
            pages: Math.ceil(countBlog / perPage), // Total pages to display

            layout: 'userLayout.hbs',
        });
    } catch (error) {
        res.status(404).send(error.message);
        return res.redirect(`/users/home?msg=${error.message}`);
    }
};

exports.searchBlog = async (req, res) => {
    const title = 'Revive';
    const { search } = req.query;
    const keySearch = req.query.search;
    const perPage = 6;
    const page = req.query.p || 1;

    const regExp = new RegExp(keySearch, 'i');
    const searchBlog = await blogModel
        .find({
            $or: [{ titleName: regExp }, { brief: regExp }],
        })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .sort({ createdAt: -1 });

    const userInfo = await userModel
        .findOne({ accountId: req.session.userId })
        .populate('accountId');

    const countBlog = await blogModel.countDocuments({
        isPublish: 'Approved',
        $or: [{ titleName: regExp }, { brief: regExp }],
    });
    const random = Math.floor(Math.random() * countBlog);

    const categories = await categoryModel.find({});
    const tags = await tagModel.find({}).limit(12);
    const popularBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ views: -1 })
        .limit(limitPopular)
        .populate('owner');
    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);
    const slideBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .skip(random)
        .limit(4)
        .populate('owner')
        .populate('categoryId');

    try {
        res.render('userViews/homepage', {
            title,
            search,
            userInfo,
            blogs: searchBlog,
            categories,
            tags,
            popularBlog,
            latestPost,
            slideBlog,

            currentPage: page, // Current Page
            pages: Math.ceil(countBlog / perPage), // Total pages to display

            layout: 'userLayout.hbs',
        });
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.getUpdateProfile = async (req, res) => {
    const title = 'Update my profile';
    const { infoError, infoSucceed, accError, accSucceed } = req.query;

    const userInfo = await userModel
        .findOne({ accountId: req.session.userId })
        .populate('accountId');
    const userAcc = await appUserModel.findOne({ _id: req.session.userId });

    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);
    const popularBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ views: -1 })
        .limit(limitPopular);
    const categories = await categoryModel.find({});
    const tags = await tagModel.find({}).limit(12);

    try {
        res.render('userViews/updateProfile', {
            title,
            userInfo,
            userAcc,

            infoError,
            accError,
            infoSucceed,
            accSucceed,

            latestPost,
            popularBlog,
            categories,
            tags,
            layout: 'userLayout.hbs',
        });
    } catch (error) {
        res.send(error.message);
    }
};

exports.updateUserAcc = async (req, res) => {
    const { username, password, _id } = req.body;
    const newValues = {};
    if (username) newValues.username = username;
    if (password) newValues.password = password;

    const userAccExist = await appUserModel.findOne({ username });

    if (userAccExist) {
        const errorUsername = 'Username has already exist !!!';
        return res.redirect(`/users/updateProfile?accError=${errorUsername}`);
    }

    try {
        if (password) {
            if (password.length < 8 || password.includes('password')) {
                const errorPassword =
                    `Password must be at least 8 characters !!!` +
                    `\nPassword cannot contain "password"`;
                return res.redirect(
                    `/users/updateProfile?accError=${errorPassword}`
                );
            }
        } else {
            const updateAcc = await appUserModel.findOneAndUpdate(
                { _id },
                { $set: newValues },
                { new: true }
            );
        }

        const msgSucceed = 'Account changed successfully !!!';
        res.redirect(`/users/updateProfile?accSucceed=${msgSucceed}`);
    } catch (error) {
        res.send(error.message);
    }
};

exports.updateUserInfo = async (req, res) => {
    const { fullName, introduction, DoB, email, _id } = req.body;
    const newValues = {};
    if (req.file) {
        const avatar = req.file.filename;
        newValues.avatar = avatar;
    }
    if (fullName) newValues.fullName = fullName;
    if (introduction) newValues.introduction = introduction;
    if (email) newValues.email = email;
    if (DoB) newValues.DoB = DoB;

    const emailExist = await userModel.findOne({ email });

    if (emailExist) {
        const msg = 'Email already exists !!!';
        return res.redirect(`/users/updateProfile?infoError=${msg}`);
    }

    try {
        if (!fullName || !introduction || !DoB || !email) {
            const updateInfo = await userModel.findOneAndUpdate(
                { _id },
                { $set: newValues },
                { new: true, useFindAndModify: false }
            );
        }

        const msgSucceed = 'Information changed Successfully !!!';
        return res.redirect(`/users/updateProfile?infoSucceed=${msgSucceed}`);
    } catch (error) {
        res.send(error.message);
    }
};

exports.blogByCategory = async (req, res) => {
    const { msg } = req.query;
    const _id = req.params.categoryId;

    const perPage = 6;
    const page = req.query.p || 1;

    const countBlog = await blogModel.countDocuments({
        categoryId: _id,
        isPublish: 'Approved',
    });

    const blogCategory = await categoryModel.findOne({ _id: _id });
    const title = `Blogs by Category: ${blogCategory.name} - Revive`;

    const userInfo = await userModel
        .findOne({ accountId: req.session.userId })
        .populate('accountId');
    const blogs = await blogModel
        .find({ categoryId: _id, isPublish: 'Approved' })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .sort({ createdAt: -1 })
        .populate('owner')
        .populate('categoryId');
    const categories = await categoryModel.find({});
    const tags = await tagModel.find({}).limit(12);

    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);
    const popularBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ views: -1 })
        .limit(limitPopular)
        .populate('owner');

    try {
        res.render('userViews/blogByCategory', {
            title,
            err: msg,
            userInfo,
            blogCategory,
            categories,
            tags,
            latestPost,
            popularBlog,
            blogs,

            currentPage: page, // Current Page
            pages: Math.ceil(countBlog / perPage), // Total pages to display

            layout: 'userLayout.hbs',
        });
    } catch (error) {
        res.status(404).send(error.message);
        return res.redirect(`/users/home?msg=${error.message}`);
    }
};

exports.blogByTag = async (req, res) => {
    const { msg } = req.query;
    const _id = req.params.tagId;

    const perPage = 6;
    const page = req.query.p || 1;

    const countBlog = await blogModel.countDocuments({
        tags: _id,
        isPublish: 'Approved',
    });

    const blogTag = await tagModel.findOne({ _id: _id });
    const title = `Blogs by Tag: ${blogTag.name} - Revive`;

    const userInfo = await userModel
        .findOne({ accountId: req.session.userId })
        .populate('accountId');
    const blogs = await blogModel
        .find({ tags: _id, isPublish: 'Approved' })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .sort({ createdAt: -1 })
        .populate('owner')
        .populate('categoryId');
    const categories = await categoryModel.find({});
    const tags = await tagModel.find({}).limit(12);

    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);
    const popularBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ views: -1 })
        .limit(limitPopular)
        .populate('owner');

    try {
        res.render('userViews/blogByTag', {
            title,
            err: msg,
            userInfo,
            blogTag,
            categories,
            tags,
            latestPost,
            popularBlog,
            blogs,

            currentPage: page, // Current Page
            pages: Math.ceil(countBlog / perPage), // Total pages to display

            layout: 'userLayout.hbs',
        });
    } catch (error) {
        res.status(404).send(error.message);
        return res.redirect(`/users/home?msg=${error.message}`);
    }
};

exports.getUploadPage = async (req, res) => {
    const title = 'Upload new blog';

    const user = await userModel
        .findOne({ accountId: req.session.userId })
        .populate('accountId');
    const categories = await categoryModel.find({});
    const tags = await tagModel.find({});

    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);
    const popularBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ views: -1 })
        .limit(limitPopular);

    try {
        res.render('userViews/uploadBlog', {
            title,
            userInfo: user,
            categories,
            tags,
            latestPost,
            popularBlog,
            layout: 'userLayout.hbs',
        });
    } catch (error) {
        res.status(404).send(error.message);
    }
};

exports.uploadBlog = async (req, res) => {
    const { _id, tagId } = req.body;
    const userInfo = await userModel.findOne({ accountId: req.session.userId });
    const obj = {
        titleName: req.body.titleName,
        brief: req.body.brief,
        mainImage: req.file.filename,
        blogContent: req.body.blogContent,
        owner: userInfo._id,
        categoryId: _id,
    };

    try {
        const newBlog = await blogModel.create(obj);
        const savePost = await newBlog.save();

        const pushTag = await blogModel.findOneAndUpdate(
            { _id: savePost._id },
            { $push: { tags: tagId } },
            { new: true, useFindAndModify: false, multi: true }
        );
        await pushTag.save();
        console.log(pushTag);

        await userInfo.posts.push(pushTag);
        userInfo.save();

        const manager = await managerModel.findOne({ categoryId: _id });
        const sentEmail = await nodemailer(manager.email);
        console.log('Email sent...', sentEmail);

        return res.redirect(`/users/manageBlog`);
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message);
        return res.redirect(`/users/home`);
    }
};

exports.blogDetails = async (req, res) => {
    const blogId = req.params.id;
    const demo = {};

    const userInfo = await userModel
        .findOne({ accountId: req.session.userId })
        .populate('accountId');
    const bookmark = await bookmarkModel.findOne({ postId: blogId });

    if (bookmark) {
        const bookmarkExists = await userModel.findOne({
            bookmarks: bookmark._id,
        });

        if (bookmarkExists) {
            demo['bookmarkExists'] = bookmarkExists;
        }
    }

    const blog = await blogModel
        .findOne({ _id: blogId })
        .populate({ path: 'owner', populate: { path: 'accountId' } })
        .populate('categoryId')
        .populate('tags')
        .populate({
            path: 'comments',
            populate: [
                { path: 'author', populate: { path: 'accountId' } },
                { path: 'postId' },
                {
                    path: 'replies',
                    populate: {
                        path: 'author',
                        populate: { path: 'accountId' },
                    },
                },
            ],
        });
    const title = `${blog.titleName} - Revive`;

    const categories = await categoryModel.find({});
    const tags = await tagModel.find({}).limit(12);
    const countComment = await commentModel.countDocuments({
        postId: blog._id,
    });
    const countReplies = await replyModel.countDocuments({
        commentId: blog.comments,
    });
    const totalComment = countComment + countReplies;

    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);
    const popularBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ views: -1 })
        .limit(limitPopular)
        .populate('owner');

    const countBlog = await blogModel.countDocuments();
    const random = Math.floor(Math.random() * countBlog);
    const relatedBlog = await blogModel
        .find({ categoryId: blog.categoryId, isPublish: 'Approved' })
        .skip(random)
        .limit(3)
        .populate('owner')
        .populate('categoryId');

    try {
        const count = blog.views + 1;

        const blogUpdate = await blogModel.findOneAndUpdate(
            { _id: blogId },
            { $set: { views: count } },
            { new: true, useFindAndModify: false }
        );
        res.render('userViews/blogDetail', {
            title,
            blog,
            demo,
            totalComment,
            userInfo,
            latestPost,
            popularBlog,
            relatedBlog,
            categories,
            tags,
            layout: 'userLayout.hbs',
        });
    } catch (error) {
        res.status(404).send(error.message);
    }
};

exports.profile = async (req, res) => {
    const title = 'My Profile';
    const perPage = 6;
    const page = req.query.p || 1;

    const userInfo = await userModel
        .findOne({ accountId: req.session.userId })
        .populate('accountId');

    const categories = await categoryModel.find({});
    const tags = await tagModel.find({}).limit(12);
    const countBlog = await blogModel.countDocuments({
        isPublish: 'Approved',
        owner: userInfo._id,
    });

    const myLatestPost = await blogModel
        .find({ isPublish: 'Approved', owner: userInfo._id })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .sort({ createdAt: -1 })
        .populate('owner')
        .populate('categoryId');
    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);
    const popularBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ views: -1 })
        .limit(limitPopular);

    try {
        res.render('userViews/myProfile', {
            title,
            userInfo,
            categories,
            tags,
            latestPost,
            popularBlog,
            myLatestPost,

            currentPage: page, // Current Page
            pages: Math.ceil(countBlog / perPage), // Total pages to display

            layout: 'userLayout.hbs',
        });
    } catch (error) {
        res.status(404).send(error.message);
    }
};

exports.doComment = async (req, res) => {
    const { comment, blogId } = req.body;

    const user = await userModel.findOne({ accountId: req.session.userId });
    const blog = await blogModel.findOne({ _id: blogId });

    try {
        const obj = {
            author: user._id,
            comment,
            postId: blog._id,
        };

        const newComment = await commentModel.create(obj);
        const saveComment = await newComment.save();

        // console.log(saveComment);

        await blog.comments.push(saveComment);
        await blog.save();

        // res.redirect(`/users/blogDetail/${blog._id}`);
        res.json(saveComment);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
};

exports.deleteComment = async (req, res) => {
    const commentId = req.params.id;

    try {
        const deleteCmt = await commentModel.findOneAndDelete({
            _id: commentId,
        });

        const pullComment = await blogModel.findOneAndUpdate(
            { comments: commentId },
            { $pull: { comments: commentId } },
            { new: true, useFindAndModify: false }
        );

        const deleteReplies = await replyModel.deleteMany({
            commentId,
        });

        const obj = {
            msg: 'Delete Success',
        };

        res.json(obj);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
};

exports.deReply = async (req, res) => {
    const { reply, commentId, blogId } = req.body;

    const user = await userModel.findOne({ accountId: req.session.userId });
    const comment = await commentModel.findOne({ _id: commentId });
    const blog = await blogModel.findOne({ _id: blogId });

    try {
        const obj = {
            author: user._id,
            comment: reply,
            commentId,
        };

        const newReply = await replyModel.create(obj);
        const saveReply = await newReply.save();

        await comment.replies.push(saveReply);
        await comment.save();

        res.json(saveReply);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
};

exports.deleteReply = async (req, res) => {
    const replyId = req.params.id;

    try {
        const deleteReply = await replyModel.findOneAndDelete({ _id: replyId });

        const pullReply = await commentModel.findOneAndUpdate(
            { replies: replyId },
            { $pull: { replies: replyId } },
            { new: true, useFindAndModify: false }
        );

        const obj = {
            msg: 'Delete Success',
        };

        res.json(obj);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
};

exports.manageBlog = async (req, res) => {
    const title = 'Blogs Management';
    const { categoryId } = req.query;
    const query = {};
    if (categoryId) {
        query.categoryId = categoryId;
    }

    const userInfo = await userModel
        .findOne({ accountId: req.session.userId })
        .populate('accountId');
    const categories = await categoryModel.find({});
    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);
    const myBlog = await blogModel
        .find({ owner: userInfo._id, ...query })
        .sort({ createdAt: -1 })
        .populate('owner')
        .populate('categoryId');

    try {
        res.render('userViews/manageBlog', {
            title,
            userInfo,
            categories,
            blogs: myBlog,
            latestPost,
            layout: 'userLayout.hbs',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

exports.searchMyBlog = async (req, res) => {
    const title = 'Blogs Management';
    const { timeFrom, timeTo, titleName, categoryId } = req.query;

    let regExp = '';
    if (!titleName) {
        regExp = null;
    } else {
        regExp = new RegExp(titleName, 'i');
    }

    const userInfo = await userModel
        .findOne({ accountId: req.session.userId })
        .populate('accountId');
    const categories = await categoryModel.find({});
    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);
    const myBlog = await blogModel
        .find({ owner: userInfo._id })
        .or([
            { titleName: regExp },
            {
                createdAt: { $gte: timeFrom, $lte: timeTo },
            },
            { categoryId },
        ])
        .sort({ createdAt: -1 })
        .populate('owner')
        .populate('categoryId');

    try {
        res.render('userViews/manageBlog', {
            title,
            userInfo,
            categories,
            blogs: myBlog,
            latestPost,
            layout: 'userLayout.hbs',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

exports.getUpdateBlog = async (req, res) => {
    const title = 'Update Blog Information';
    const blogId = req.params.id;
    const { msg } = req.query;

    const userInfo = await userModel
        .findOne({ accountId: req.session.userId })
        .populate('accountId');

    const blog = await blogModel
        .findOne({ _id: blogId })
        .populate('categoryId')
        .populate('tags');

    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);
    const popularBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .populate('owner')
        .sort({ views: -1 })
        .limit(limitPopular);
    const categories = await categoryModel.find({});
    const tags = await tagModel.find({});
    const findPostTag = await tagModel.find({ _id: blog.tags });

    try {
        res.render('userViews/updateBlog', {
            title,
            blog,
            msg,
            userInfo,
            latestPost,
            popularBlog,
            categories,
            tags,
            findPostTag,
            layout: 'userLayout.hbs',
        });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
};

exports.updateOneBlog = async (req, res) => {
    const { titleName, brief, blogContent, categoryId, _id, tagId } = req.body;
    const newValues = {};

    if (req.file) {
        const mainImage = req.file.filename;
        newValues.mainImage = mainImage;
    }

    if (titleName) newValues.titleName = titleName;
    if (brief) newValues.brief = brief;
    if (categoryId) newValues.categoryId = categoryId;
    if (blogContent) newValues.blogContent = blogContent;
    if (categoryId) newValues.categoryId = categoryId;

    const category = await categoryModel.findOne({ _id: categoryId });

    try {
        const updateBlog = await blogModel.findOneAndUpdate(
            { _id },
            { $set: newValues },
            { new: true, useFindAndModify: false }
        );

        if (categoryId) {
            const updateCategory = await categoryModel.findOneAndUpdate(
                { posts: _id },
                { $pull: { posts: _id } },
                { new: true, useFindAndModify: false }
            );
            await category.posts.push(updateBlog);
            await category.save();
        }

        // if (tagId) {
        //     const pushTag = await blogModel.findOneAndUpdate(
        //         { tags: tagId },
        //         { $pull: { tags: tagId } },
        //         { new: true, useFindAndModify: false, multi: true }
        //     )
        //     await pushTag.save();
        // }
        const pushTag = await blogModel.findOneAndUpdate(
            { _id },
            { $push: { tags: tagId } },
            { new: true, useFindAndModify: false, multi: true }
        );

        const msg = 'Update Successfully !!!';
        return res.redirect(`/users/updateBlog/${_id}?msg=${msg}`);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
};

exports.deleteBlogTag = async (req, res) => {
    const tagId = req.params.id;

    try {
        if (tagId) {
            const pushTag = await blogModel.findOneAndUpdate(
                { tags: tagId },
                { $pull: { tags: tagId } },
                { new: true, useFindAndModify: false, multi: true }
            );
            await pushTag.save();
        }

        const obj = {
            msg: 'Tag has been delete Success',
        };

        res.json(obj);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.deleteOneBlog = async (req, res) => {
    const blogId = req.params.id;

    const blog = await blogModel.findOne({ _id: blogId });
    const blogComment = await commentModel.findOne({ _id: blog.comments });

    try {
        const deleteBlog = await blogModel.findOneAndDelete({ _id: blogId });
        if (blog) {
            const pullCate = await categoryModel.findOneAndUpdate(
                { posts: blog._id },
                { $pull: { posts: blog._id } },
                { new: true, useFindAndModify: false }
            );
            const pullUser = await userModel.findOneAndUpdate(
                { posts: blog._id },
                { $pull: { posts: blog._id } },
                { new: true, useFindAndModify: false }
            );
            const deleteComment = await commentModel.deleteMany({
                _id: blog.comments,
            });
        }
        if (blogComment) {
            const deleteReply = await replyModel.deleteMany({
                _id: blogComment.replies,
            });
        }

        const obj = {
            msg: 'Delete Success',
        };

        res.json(obj);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
};

exports.getAllBookmark = async (req, res) => {
    const title = 'List All Bookmarks';

    const userInfo = await userModel
        .findOne({ accountId: req.session.userId })
        .populate('accountId');

    const bookmarks = await bookmarkModel
        .find({ author: userInfo._id })
        .populate({
            path: 'postId',
            populate: [{ path: 'owner' }, { path: 'categoryId' }],
        });

    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);
    const popularBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ views: -1 })
        .limit(limitPopular);
    const categories = await categoryModel.find({});

    try {
        res.render('userViews/myBookmark', {
            title,
            bookmarks,
            userInfo,
            latestPost,
            popularBlog,
            categories,
            layout: 'userLayout.hbs',
        });
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
};

exports.searchBookmark = async (req, res) => {
    const title = 'List All Bookmarks';
    const { timeFrom, timeTo, titleName, categoryId } = req.query;

    let regExp = '';
    if (!titleName) {
        regExp = null;
    } else {
        regExp = new RegExp(titleName, 'i');
    }

    const userInfo = await userModel
        .findOne({ accountId: req.session.userId })
        .populate('accountId');

    const bookmarks = await bookmarkModel
        .find({
            author: userInfo._id,
            $or: [
                {
                    createdAt: {
                        $gte: timeFrom,
                        $lte: timeTo,
                    },
                },
            ],
        })
        .populate({
            path: 'postId',
            populate: [{ path: 'owner' }, { path: 'categoryId' }],
        });

    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);
    const popularBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ views: -1 })
        .limit(limitPopular);
    const categories = await categoryModel.find({});

    try {
        res.render('userViews/myBookmark', {
            title,
            userInfo,
            bookmarks,
            latestPost,
            popularBlog,
            categories,
            layout: 'userLayout.hbs',
        });
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
};

exports.setBookmark = async (req, res) => {
    const blogId = req.params.id;

    const user = await userModel.findOne({ accountId: req.session.userId });

    try {
        const obj = {
            author: user._id,
            postId: blogId,
        };

        const newBookmark = await bookmarkModel.create(obj);
        const saveBookmark = await newBookmark.save();

        await user.bookmarks.push(saveBookmark);
        await user.save();

        res.json('You have bookmark a blog');
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
};

exports.unBookmark = async (req, res) => {
    const blogId = req.params.id;
    const user = await userModel.findOne({ accountId: req.session.userId });
    const bookmark = await bookmarkModel.findOne({ postId: blogId });

    try {
        const delUserBookmark = await bookmarkModel.findOneAndDelete({
            postId: blogId,
        });

        const updateBlog = await userModel.findOneAndUpdate(
            { bookmarks: bookmark._id },
            { $pull: { bookmarks: bookmark._id } },
            { new: true, useFindAndModify: false }
        );

        const obj = {
            msg: 'unBookmark Success',
        };

        res.json(obj);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
};

exports.viewPostAuthor = async (req, res) => {
    const username = req.params.username;
    const perPage = 6;
    const page = req.query.p || 1;

    const userInfo = await userModel
        .findOne({ accountId: req.session.userId })
        .populate('accountId');

    const authorAcc = await appUserModel.findOne({ username });
    const authorInfo = await userModel.findOne({ accountId: authorAcc._id });

    const title = `${authorInfo.fullName} - Revive`;
    const categories = await categoryModel.find({});
    const tags = await tagModel.find({}).limit(12);
    const countBlog = await blogModel.countDocuments({
        isPublish: 'Approved',
        owner: authorInfo._id,
    });

    const authorPost = await blogModel
        .find({ isPublish: 'Approved', owner: authorInfo._id })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .sort({ createdAt: -1 })
        .populate('owner')
        .populate('categoryId');
    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);
    const popularBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .populate('owner')
        .sort({ views: -1 })
        .limit(limitPopular);

    const postData = getPostData(authorPost, ['views']);
    const totalViews = getNumber_Of_Posts(postData);
    // console.log(number_of_posts)

    try {
        res.render('userViews/postAuthor', {
            title,
            userInfo,
            authorInfo,
            authorAcc,
            categories,
            tags,
            latestPost,
            popularBlog,
            authorLatestPost: authorPost,
            countBlog,
            totalViews,

            currentPage: page, // Current Page
            pages: Math.ceil(countBlog / perPage), // Total pages to display

            layout: 'userLayout.hbs',
        });
    } catch (error) {
        res.status(404).send(error.message);
    }
};

function getPostData(obj1, obj2) {
    return obj1.map(function (row) {
        const result = {};
        obj2.forEach(function (key) {
            result[key] = row[key];
        });
        return result;
    });
}

function getNumber_Of_Posts(postData) {
    var data = [];
    let i = 0;
    let sum = 0;
    postData.forEach(function (content, callback) {
        for (const key in content) {
            //console.log('key: '+key, ', value: '+ content[key]);
            if (key == 'views') {
                data[i] = content[key];
            }
            sum += data[i];
        }
        i++;
    });

    return sum;
}
