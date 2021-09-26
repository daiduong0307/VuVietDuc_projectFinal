exports.isAdmin = (req, res, next) => {
    if (req.session && req.session.isAdmin === true && req.session.userId) {
        return next();
    } else {
        const msg = 'You must be logged in with admin permission to view this page.';
        return res.redirect(`/auth/login?msg=${msg}`);
    }
};

exports.isUser = (req, res, next) => {
    if (req.session && req.session.isUser === true && req.session.userId) {
        return next();
    } else {
        const msg = 'You must be logged in with user permission to view this page.';
        return res.redirect(`/auth/login?msg=${msg}`);
    }
};

exports.isManager = (req, res, next) => {
    if (req.session && req.session.isManager === true && req.session.userId) {
        return next();
    } else {
        const msg = 'You must be logged in with Manager permission to view this page.';
        return res.redirect(`/auth/login?msg=${msg}`);
    }
};
