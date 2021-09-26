const multer = require('multer');
const util = require('util');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png',
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/uploads/');
    },
    filename: (req, file, cb) => {
        const name = file.originalname.split(' ').join();
        const extension = MIME_TYPES[file.mimetype];
        cb(null, name + '-' + new Date().toISOString().replace(/:/g, '-') + '.' + extension);
    },
});

const upload = multer({ storage }).single('image');
const multerInstance = util.promisify(upload);

module.exports = { multerInstance };
