const mongoose = require('mongoose');

mongoose
    .connect(process.env.DATABASE_URL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => {
        console.log('Connected to Database');
    })
    .catch(error => {
        console.log('Fail to connect to Database: ', error);
    });
