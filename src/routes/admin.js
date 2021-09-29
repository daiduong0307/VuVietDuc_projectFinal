const { Router } = require('express');
const adminController = require('../controllers/adminController');

const adminRouter = Router();

adminRouter.get('/home', adminController.homePage);

adminRouter.get('/allUserAcc', adminController.allUserAccount);
adminRouter.get('/searchUser', adminController.searchUser);
adminRouter.get('/updateUser/:id', adminController.getUpdateUser);
adminRouter.delete('/deleteUserAcc/:id', adminController.deleteOneUser);
adminRouter.put('/updateUserAcc', adminController.updateOneUser);

adminRouter.get('/allManagerAcc', adminController.allManagerAccount);
adminRouter.get('/searchManager', adminController.searchManager);
adminRouter.get('/addManagerAcc', adminController.getAddManagerAcc);
adminRouter.get('/updateManager/:id', adminController.getUpdateManager);
adminRouter.post('/addManagerAcc', adminController.addOneManager);
adminRouter.delete('/deleteManagerAcc/:id', adminController.deleteOneManger);
adminRouter.put('/updateManagerAcc', adminController.updateOneManager);
adminRouter.patch('/deprivationRights', adminController.deprivationRights);

adminRouter.get('/allCategories', adminController.allCategories);
// adminRouter.get("/addCategory", adminController.getAddCategory);
adminRouter.get('/updateCategory/:id', adminController.getUpdateCategory);
adminRouter.post('/addOneCategory', adminController.addOneCategory);
adminRouter.put('/updateOneCategory', adminController.updateOneCategory);
adminRouter.delete('/deleteOneCategory/:id', adminController.deleteOneCategory);

adminRouter.get('/allTags', adminController.allTags);
adminRouter.post('/addOneTag', adminController.addOneTag);
adminRouter.delete('/deleteOneTag/:id', adminController.deleteOneTag);

module.exports = adminRouter;
