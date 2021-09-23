const passwordReset = require('../controllers/passwordReset');
const { Router } = require('express');

const resetRouter = Router();

resetRouter.get('/resetPassword', passwordReset.getResetPage);
resetRouter.get('/password-reset/:userId/:token', passwordReset.resetPwd);

resetRouter.post('/sendEmail', passwordReset.getLinkReset);
resetRouter.post('/password-reset/:userId/:token', passwordReset.resetPassword);

module.exports = resetRouter;
