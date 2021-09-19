const { Router } = require('express');
const indexController = require('../controllers/indexController');

const indexRouter = Router();
/* GET home page. */
indexRouter.get('/', indexController.index);

indexRouter.get('/searchBlog', indexController.searchBlog);
indexRouter.get('/:username', indexController.viewPostAuthor);

indexRouter.get('/blogByCategory/:categoryId', indexController.blogByCategory);
indexRouter.get('/blogDetail/:id', indexController.blogDetails);
indexRouter.get('/blogByTag/:tagId', indexController.blogByTag);

module.exports = indexRouter;
