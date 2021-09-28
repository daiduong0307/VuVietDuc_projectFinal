const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const CLIENT_ID = '372692425442-12ur3e1st65qoq58ih8ib8a7pp8ftjv3.apps.googleusercontent.com';
const CLIENT_SECRET = '_mkEh-o_OyINdN5XgxFYKqti';
const REDIRECT_URL = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN =
    '1//04cbHlkLVjwxtCgYIARAAGAQSNwF-L9Irj1Z_w0jNkPeJXvr8to_nau7DyVSIlU95cFSX9AdYxOOtg-zTjk4ZA2eKkLPUHxEd0s0';

const oAuth2client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
oAuth2client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(email, subject, author, title) {
    try {
        const ACCESS_TOKEN = await oAuth2client.getAccessToken();
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'cuongndgch18641@fpt.edu.vn',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: ACCESS_TOKEN,
            },
        });

        const html = `
        <h3>Hi Manager, a user post has been created, Please check !</h3>
        <h4>Some information of the article:</h4>
        <p><strong>Author</strong>: ${author}</p>
        <p><strong>Post Title</strong>: ${title}</p>
        `;

        const mailOption = {
            from: 'BLOG MANAGEMENT SYSTEM 🎡 <no-reply@blog.com>',
            to: `${email}`,
            subject,
            html,
        };

        const result = await transport.sendMail(mailOption);
        return result;
    } catch (error) {
        return error;
    }
}

async function sendMailReset(email, subject, text) {
    try {
        const ACCESS_TOKEN = await oAuth2client.getAccessToken();
        // const transport = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         type: 'OAuth2',
        //         user: 'cuongndgch18641@fpt.edu.vn',
        //         clientId: CLIENT_ID,
        //         clientSecret: CLIENT_SECRET,
        //         refreshToken: REFRESH_TOKEN,
        //         accessToken: ACCESS_TOKEN,
        //     },
        // });
        const transport = nodemailer.createTransport({
            host: 'smtp.mailtrap.io',
            port: 2525,
            auth: {
                user: '70094f5b39259d',
                pass: '7df613ccf6e04c',
            },
        });

        const mailOption = {
            from: 'BLOG MANAGEMENT SYSTEM 🎡 <no-reply@blog.com>',
            to: `${email}`,
            subject,
            html: '<h4>Click the link to <a href="' + text + '">Reset Password</a></h4>',
        };

        const result = await transport.sendMail(mailOption);
        return result;
    } catch (error) {
        return error;
    }
}

async function mailApproved(email, subject, author, title) {
    try {
        const ACCESS_TOKEN = await oAuth2client.getAccessToken();
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'cuongndgch18641@fpt.edu.vn',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: ACCESS_TOKEN,
            },
        });

        const html = `
        <h3>Hi User, Your post has been <span style="color: green;">Approved</span>, Please check !</h3>
        <h4>Some information of the article:</h4>
        <p><strong>Author</strong>: ${author}</p>
        <p><strong>Post Title</strong>: ${title}</p>
        `;

        const mailOption = {
            from: 'BLOG MANAGEMENT SYSTEM 🎡 <no-reply@blog.com>',
            to: `${email}`,
            subject,
            html,
        };

        const result = await transport.sendMail(mailOption);
        return result;
    } catch (error) {
        return error;
    }
}

async function mailRejected(email, subject, author, title) {
    try {
        const ACCESS_TOKEN = await oAuth2client.getAccessToken();
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'cuongndgch18641@fpt.edu.vn',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: ACCESS_TOKEN,
            },
        });

        const html = `
        <h3>Hi User, Your post has been <span style="color: red;">Rejected</span>, sorry</h3>
        <h4>Some information of the article:</h4>
        <p><strong>Author</strong>: ${author}</p>
        <p><strong>Post Title</strong>: ${title}</p>
        `;

        const mailOption = {
            from: 'BLOG MANAGEMENT SYSTEM 🎡 <no-reply@blog.com>',
            to: `${email}`,
            subject,
            html,
        };

        const result = await transport.sendMail(mailOption);
        return result;
    } catch (error) {
        return error;
    }
}

module.exports = { sendMail, sendMailReset, mailApproved, mailRejected };
