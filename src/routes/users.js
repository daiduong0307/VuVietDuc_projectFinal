const { Router } = require('express');
const userController = require('../controllers/userController');
const upload = require('../middleware/uploadImage');

const userRouter = Router();

userRouter.get('/home', userController.homePage);
userRouter.get('/searchBlog', userController.searchBlog);
userRouter.get('/u/:username', userController.viewPostAuthor);

userRouter.get('/uploadBlog', userController.getUploadPage);
userRouter.post('/uploadOneBlog', upload.multerInstance, userController.uploadBlog);
userRouter.delete('/deleteBlog', userController.deleteOneBlog);

userRouter.get('/blogDetail/:id', userController.blogDetails);
userRouter.get('/blogByCategory/:categoryId', userController.blogByCategory);
userRouter.get('/blogByTag/:tagId', userController.blogByTag);

userRouter.get('/manageBlog', userController.manageBlog);
userRouter.get('/searchMyBlog', userController.searchMyBlog);
userRouter.get('/updateBlog/:id', userController.getUpdateBlog);
userRouter.post('/updateOneBlog', upload.multerInstance, userController.updateOneBlog);
userRouter.delete('/deleteOneBlog/:id', userController.deleteOneBlog);
userRouter.delete('/deleteTagBlog/:id', userController.deleteBlogTag);

userRouter.get('/myProfile', userController.profile);
userRouter.get('/updateProfile', userController.getUpdateProfile);
userRouter.put('/updateAccount', userController.updateUserAcc);
userRouter.post('/updateInformation', upload.multerInstance, userController.updateUserInfo);

userRouter.post('/doComment', userController.doComment);
userRouter.post('/doReply', userController.deReply);
userRouter.delete('/deleteComment/:id', userController.deleteComment);
userRouter.delete('/deleteReply/:id', userController.deleteReply);

userRouter.get('/myBookmark', userController.getAllBookmark);
userRouter.get('/searchBookmark', userController.searchBookmark);
userRouter.put('/setBookmark/:id', userController.setBookmark);
userRouter.put('/unBookmark/:id', userController.unBookmark);

module.exports = userRouter;
