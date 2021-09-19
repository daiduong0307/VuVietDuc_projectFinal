const { Router } = require('express');
const auth = require('../controllers/Auth');

const authRouter = Router();

/* GET login page. */
authRouter.get('/login', auth.getLogin);
/* GET signUpUser page. */
authRouter.get('/signup', auth.getSignUpUser);

//  login / logout request
authRouter.post('/login', auth.login);
authRouter.post('/signup', auth.signUpUser);
authRouter.get('/logout', auth.logout);
authRouter.get('/signupAdmin', auth.signUpAdmin);

module.exports = authRouter;
