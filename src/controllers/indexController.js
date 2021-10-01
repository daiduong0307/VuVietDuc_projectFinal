const blogModel = require('../models/Blogs');
const categoryModel = require('../models/Catagories');
const userModel = require('../models/Users');
const appUserModel = require('../models/AppUser');
const tagModel = require('../models/BlogTags');

const limitLatest = 8;
const limitPopular = 3;

exports.index = async (req, res, next) => {
    const perPage = 6;
    const page = req.query.p || 1;

    const title = 'Revive';
    const { msg } = req.query;

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

    const countBlog = await blogModel.countDocuments({ isPublish: 'Approved' });
    const random = Math.floor(Math.random() * countBlog);

    const slideBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .skip(random)
        .limit(4)
        .populate('owner')
        .populate('categoryId');

    const blogs = await blogModel
        .find({ isPublish: 'Approved' })
        .skip(perPage * page - perPage)
        .sort({ createdAt: -1 })
        .limit(perPage)
        .populate('owner')
        .populate('categoryId');

    try {
        res.render('indexViews/index', {
            title,
            err: msg,
            categories,
            tags,
            popularBlog,
            latestPost,
            slideBlog,
            blogs,
            pagination: {
                page: page, // Current Page
                pageCount: Math.ceil(countBlog / perPage), // Total pages to display
            },

            layout: 'userLayout.hbs',
        });
    } catch (error) {
        res.status(404).send(error.message);
        return res.redirect(`/?msg=${error.message}`);
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
        .sort({ createdAt: -1 }).populate("categoryId");

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
        res.render('indexViews/index', {
            title,
            search,
            blogs: searchBlog,
            categories,
            tags,
            popularBlog,
            latestPost,
            slideBlog,

            pagination: {
                page: page, // Current Page
                pageCount: Math.ceil(countBlog / perPage), // Total pages to display
            },

            layout: 'userLayout.hbs',
        });
    } catch (error) {
        res.status(400).send(error);
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

    const blogs = await blogModel
        .find({ categoryId: _id, isPublish: 'Approved' })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate('owner')
        .populate('categoryId');
    const categories = await categoryModel.find({});
    const tags = await tagModel.find({}).limit(12);

    const popularBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .populate('owner')
        .sort({ views: -1 })
        .limit(limitPopular);
    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);

    try {
        res.render('indexViews/blogByCategory', {
            title,
            err: msg,
            blogCategory,
            categories,
            tags,
            popularBlog,
            latestPost,
            blogs,

            pagination: {
                page: page, // Current Page
                pageCount: Math.ceil(countBlog / perPage), // Total pages to display
            },

            layout: 'userLayout.hbs',
        });
    } catch (error) {
        res.status(404).send(error.message);
        return res.redirect(`/BlogByCategory/${blogCategory._id}?msg=${error.message}`);
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

    const blogs = await blogModel
        .find({ tags: _id, isPublish: 'Approved' })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .sort({ createdAt: -1 })
        .populate('owner')
        .populate('categoryId');
    const categories = await categoryModel.find({});
    const tags = await tagModel.find({}).limit(12);

    const popularBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .populate('owner')
        .sort({ views: -1 })
        .limit(limitPopular);
    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);

    try {
        res.render('indexViews/blogByTag', {
            title,
            err: msg,
            blogTag,
            categories,
            tags,
            popularBlog,
            latestPost,
            blogs,

            pagination: {
                page: page, // Current Page
                pageCount: Math.ceil(countBlog / perPage), // Total pages to display
            },

            layout: 'userLayout.hbs',
        });
    } catch (error) {
        res.status(404).send(error.message);
        return res.redirect(`/BlogByTag/${blogTag._id}?msg=${error.message}`);
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

    const blogs = await blogModel
        .find({ categoryId: _id, isPublish: 'Approved' })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate('owner')
        .populate('categoryId');
    const categories = await categoryModel.find({});
    const tags = await tagModel.find({}).limit(12);

    const popularBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .populate('owner')
        .sort({ views: -1 })
        .limit(limitPopular);
    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);

    try {
        res.render('indexViews/blogByCategory', {
            title,
            err: msg,
            blogCategory,
            categories,
            tags,
            popularBlog,
            latestPost,
            blogs,

            pagination: {
                page: page, // Current Page
                pageCount: Math.ceil(countBlog / perPage), // Total pages to display
            },

            layout: 'userLayout.hbs',
        });
    } catch (error) {
        res.status(404).send(error.message);
        return res.redirect(`/BlogByCategory/${blogCategory._id}?msg=${error.message}`);
    }
};

exports.blogDetails = async (req, res) => {
    const blogId = req.params.id;

    const categories = await categoryModel.find({});
    const tags = await tagModel.find({}).limit(12);
    const popularBlog = await blogModel
        .find({ isPublish: 'Approved' })
        .populate('owner')
        .sort({ views: -1 })
        .limit(limitPopular);
    const latestPost = await blogModel
        .find({ isPublish: 'Approved' })
        .sort({ createdAt: -1 })
        .limit(limitLatest);
    const blog = await blogModel
        .findOne({ _id: blogId })
        .populate({ path: 'owner', populate: { path: 'accountId' } })
        .populate('categoryId')
        .populate('tags')
        .populate({
            path: 'comments',
            populate: [
                { path: 'author' },
                { path: 'postId' },
                { path: 'replies', populate: { path: 'author' } },
            ],
        });
    const title = `${blog.titleName} - Revive`;
    const tagBlog = await tagModel.find({ _id: blog.tags });

    if (!blog) {
        return res.redirect('/');
    }

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
            { new: true, useFindAndModify: false },
        );
        res.render('indexViews/blogDetail', {
            title,
            blog,
            tags: tagBlog,
            popularBlog,
            relatedBlog,
            latestPost,
            categories,
            tags,
            layout: 'userLayout.hbs',
        });
    } catch (error) {
        res.status(404).send(error.message);
    }
};

exports.viewPostAuthor = async (req, res) => {
    const username = req.params.username;
    const perPage = 6;
    const page = req.query.p || 1;

    const userAcc = await appUserModel.findOne({ username });
    console.log(userAcc)
    const userInfo = await userModel.findOne({ accountId: userAcc._id });

    const title = `${userInfo.fullName} - Revive`;
    const categories = await categoryModel.find({});
    const tags = await tagModel.find({}).limit(12);
    const countBlog = await blogModel.countDocuments({
        isPublish: 'Approved',
        owner: userInfo._id,
    });

    const authorPost = await blogModel
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
        .populate('owner')
        .sort({ views: -1 })
        .limit(limitPopular);

    const postData = getPostData(authorPost, ['views']);
    const totalViews = getNumber_Of_Posts(postData);
    // console.log(number_of_posts)

    try {
        res.render('indexViews/postAuthor', {
            title,
            userInfo,
            userAcc,
            categories,
            tags,
            latestPost,
            popularBlog,
            authorLatestPost: authorPost,
            countBlog,
            totalViews,

            pagination: {
                page: page, // Current Page
                pageCount: Math.ceil(countBlog / perPage), // Total pages to display
            },

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
