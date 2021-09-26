const createError = require('http-errors');
const express = require('express');
const path = require('path');
const Handlebars = require('handlebars');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const fs = require('fs');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

const auth = require('./middleware/checkLogin');
const passwordReset = require('./routes/passwordReset');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const userRouter = require('./routes/users');
const managerRouter = require('./routes/manager');
const apiRouter = require('./routes/api');

require('dotenv').config();
require('./utils/db');

const app = express();

// using Session to verify User Login.
app.use(
    session({
        secret: 'mySecretSession',
        resave: true,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
    }),
);
app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

Handlebars.registerHelper('equals', function (a, b, options) {
    if (a == b) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
Handlebars.registerHelper('ifCond', function (a, b, options) {
    if (a > b) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('pagination', function (currentPage, totalPage, size, options) {
    let startPage, endPage, context;

    if (arguments.length === 3) {
        options = size;
        size = 5;
    }

    startPage = currentPage - Math.floor(size / 2);
    endPage = currentPage + Math.floor(size / 2);

    if (startPage <= 0) {
        endPage -= startPage - 1;
        startPage = 1;
    }

    if (endPage > totalPage) {
        endPage = totalPage;
        if (endPage - size + 1 > 0) {
            startPage = endPage - size + 1;
        } else {
            startPage = 1;
        }
    }

    context = {
        startFromFirstPage: false,
        pages: [],
        endAtLastPage: false,
        endPage,
    };
    if (startPage === 1) {
        context.startFromFirstPage = true;
    }
    for (let i = startPage; i <= endPage; i++) {
        context.pages.push({
            page: i,
            isCurrent: i == currentPage,
        });
    }
    if (endPage === totalPage) {
        context.endAtLastPage = true;
    }

    return options.fn(context);
});

app.engine(
    'hbs',
    exphbs({
        defaultLayout: 'layout',
        layoutsDir: path.join(__dirname, 'views/layouts'),
        partialsDir: path.join(__dirname, 'views/partials'),
        handlebars: allowInsecurePrototypeAccess(Handlebars),
        extname: '.hbs',
        helpers: require('handlebars-helpers')(),
    }),
);
app.set('view engine', 'hbs');

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    methodOverride((req, res) => {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            const method = req.body._method;
            delete req.body._method;
            return method;
        }
    }),
);

app.post('/upload', multipartMiddleware, (req, res) => {
    try {
        fs.readFile(req.files.upload.path, function (err, data) {
            const newPath = __dirname + '/public/images/' + req.files.upload.name;
            fs.writeFile(newPath, data, function (err) {
                if (err) console.log({ err });
                else {
                    console.log(req.files.upload.originalFilename);
                    const fileName = req.files.upload.name;
                    const url = '/images/' + fileName;
                    const msg = 'Upload successfully';
                    const funcNum = req.query.CKEditorFuncNum;
                    console.log({ url, msg, funcNum });

                    res.status(201).send(
                        "<script>window.parent.CKEDITOR.tools.callFunction('" +
                            funcNum +
                            "','" +
                            url +
                            "','" +
                            msg +
                            "');</script>",
                    );
                }
            });
        });
    } catch (error) {
        console.log(error.message);
    }
});

// Add APIs
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/u', passwordReset);
app.use('/admin', adminRouter);
app.use('/users', auth.isUser, userRouter);
app.use('/managers', auth.isManager, managerRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (req, res, err, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
