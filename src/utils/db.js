const mongoose = require('mongoose');

mongoose
    .connect("mongodb+srv://admin:admin@finalproject.ydqzwpc.mongodb.net/?retryWrites=true&w=majority", {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => {
        console.log('Connected to Database');
    })
    .catch(error => {
        console.log('Fail to connect to Database: ', error);
    });
