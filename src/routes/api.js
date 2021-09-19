const { Router } = require('express');
const apiUserController = require('../controllers/api/user');
const apiAdController = require('../controllers/api/admin');

const apiUserRouter = Router();
apiUserRouter.get('/getBlogData/:id', apiUserController.getBlogData);
apiUserRouter.get('/allBlog', apiUserController.allBlog);
apiUserRouter.get('/allBookmark', apiUserController.allBookmark);
apiUserRouter.get('/blogDetail/:id', apiUserController.blogDetail);
apiUserRouter.get('/listTag/:id', apiUserController.listTag);

const apiAdRouter = Router();
apiAdRouter.get('/allCategory', apiAdController.allCategory);
apiAdRouter.get('/allManager', apiAdController.allManager);
apiAdRouter.get('/allUser', apiAdController.allUser);
apiAdRouter.get('/allTag', apiAdController.allTag);

const baseRouter = Router();
baseRouter.use('/users', apiUserRouter);
baseRouter.use('/admin', apiAdRouter);

module.exports = baseRouter;
