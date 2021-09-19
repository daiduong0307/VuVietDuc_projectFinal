const { Router } = require('express');
const managerController = require('../controllers/managerController');

const managerRouter = Router();

managerRouter.get('/home', managerController.homePage);
managerRouter.get('/searchRequest', managerController.searchRequest);

managerRouter.get('/updateAccount', managerController.getUpdateAccount);
managerRouter.put('/updateAcc', managerController.updateAcc);
managerRouter.put('/updateInfo', managerController.updateInfo);

managerRouter.get('/allRequest', managerController.allRequest);
managerRouter.get('/blogDetails/:id', managerController.blogDetails);
managerRouter.patch('/approveBlog', managerController.approveBlog);
managerRouter.patch('/rejectBlog', managerController.rejectBlog);

module.exports = managerRouter;
