const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // You can set the path according to your requirments but keep in mind that uploaded files should be in 
        // src folder of the react app so that react has access to the uploaded files.
        const spath = `E:/Interview/VCL/frontend/src/uploads/${req.userData.email}`;
        fs.mkdirSync(spath, { recursive: true });
        cb(null, spath);
    },
    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '.' + Date.now() + path.extname(file.originalname));
    }
});

exports.upload = multer({ storage: storage });