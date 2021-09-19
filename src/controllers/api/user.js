const appUserModel = require('../../models/AppUser');
const userModel = require('../../models/Users');
const blogModel = require('../../models/Blogs');
const categoryModel = require('../../models/Catagories');
const commentModel = require('../../models/comment');
const bookmarkModel = require('../../models/Bookmarks');
const tagModel = require('../../models/BlogTags');

exports.getBlogData = async (req, res) => {
    const title = 'Blog Details';
    const blogId = req.params.id;
    const userInfo = await userModel
        .findOne({ accountId: req.session.userId })
        .populate('accountId');

    const categories = await categoryModel.find({});
    const blog = await blogModel
        .findOne({ _id: blogId })
        .populate('owner')
        .populate('categoryId')
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

    res.json(blog);
};

exports.allBlog = async (req, res) => {
    const userInfo = await userModel.findOne({ accountId: req.session.userId });
    const blog = await blogModel
        .find({ owner: userInfo._id })
        .populate('categoryId')
        .sort({ createdAt: -1 });

    res.json(blog);
};

exports.listTag = async (req, res) => {
    const blogId = req.params.id;

    const blog = await blogModel
        .findOne({ _id: blogId })
        .populate('categoryId')
        .populate('tags');
    const findPostTag = await tagModel.find({ _id: blog.tags });

    res.json(findPostTag);
};

exports.allBookmark = async (req, res) => {
    const userInfo = await userModel
        .findOne({ accountId: req.session.userId })
        .populate('accountId');

    const bookmarks = await bookmarkModel
        .find({ author: userInfo._id })
        .populate({
            path: 'postId',
            populate: [{ path: 'owner' }, { path: 'categoryId' }],
        });

    return res.json(bookmarks);
};

exports.blogDetail = async (req, res) => {
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
        .populate({
            path: 'owner',
            populate: [{ path: 'bookmarks' }],
        })
        .populate('categoryId')
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

    return res.json({
        demo,
        blog,
    });
};
