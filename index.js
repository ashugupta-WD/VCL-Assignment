const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
mongoose.set('strictQuery', false);
const router = express.Router();
const port = 5000;
const connectToMongo = require('./db');
connectToMongo();
const app = express();
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(
    express.urlencoded({
        extended: false,
    })
);
app.use(express.json());
const User = require('./models/User');
const Student = require('./models/Student');
const { upload } = require('./middleware/upload')

// Dummy Users for login page, idiolly dummy data would come from a JSON file and we would read its contents using 
// readFile module but for convenience purposes I am using this method.
const dummyUsers = [
    { type: 'Student', enroll: 'student221201', password: '12345678' },
    { type: 'Student', enroll: 'student221202', password: '12345678' },
    { type: 'Student', enroll: 'student221203', password: '12345678' },
    { type: 'Staff', enroll: 'staff221201', password: '12345678' },
    { type: 'Staff', enroll: 'staff221202', password: '12345678' },
    { type: 'Staff', enroll: 'staff221203', password: '12345678' }];

async function addDummyData(arr) {
    const num = await User.find({});
    if (num.length === 0) {
        for (let i = 0; i < arr.length; i++) {
            await (new User(arr[i]).save());
        }
    }
}

addDummyData(dummyUsers);


router.post('/login', async (req, res) => {
    try {
        let result = await User.find({ enroll: req.body.enroll, password: req.body.password }, { password: 0 });
        if (result.length === 1) {
            res.status(200).send({ type: result[0].type, isAllowed: true });
        } else {
            res.status(200).send({ type: 'Error', isAllowed: false });
        }
    } catch (error) {
        console.log(error);
        res.status(404).send({ type: 'Bad Request' });
    }
});

router.post('/uploadtext', async (req, res) => {
    try {
        await (new Student(req.body).save());
        const expDate = 1000 * 60 * 60 * 24 * 14;
        res.cookie('AuthEmail', req.body.email, { maxAge: expDate, path: '/', sameSite: 'lax' });
        res.header('Content-Type', 'application/json;charset=UTF-8')
        res.header('Access-Control-Allow-Credentials', true);
        res.header(
          'Access-Control-Allow-Headers',
          'Origin, X-Requested-With, Content-Type, Accept'
        )
        res.status(200).send({ process: true });
    } catch (error) {
        console.log(error);
        res.status(404).send({ process: false });
    }
});


function changePath(originalPath) {
    originalPath = originalPath.replace(/\\/g, '/');
    let arr = originalPath.split('/');
    let index = arr.indexOf('uploads');
    arr = arr.splice(index);
    newStr = arr.join('/');
    return newStr
}

router.post('/uploadfile', (req, res, next)=>{
    try {
        const token = req.cookies['AuthEmail'];
        req.userData = {email: token};
        next();
    } catch (error) {
        res.status(404).send({process: false});
    }
}, upload.fields([{ name: 'resume', maxCount: 1 }]), async (req, res) => {
    try {
        await Student.updateOne({email: req.userData.email}, {resume: changePath(req.files.resume[0].path)});
        res.status(200).send({ msg: "Success" });
    } catch (error) {
        console.log(error);
        res.status(404).send({ type: 'Bad Request' });
    }
});

router.get('/fetchdata', async (req, res) => {
    try {
        let result = await Student.find({},{_id: 0});
        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(404).send({ process: false });
    }
});

app.use('/', router);
app.listen(port, () => {
    console.log(`VCL app listening on port ${port}`);
});