const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

// Kết nối đến MongoDB Atlas
mongoose.connect('mongodb+srv://root:123@cluster0.l8ibr.mongodb.net/dacs?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use('/login', express.static('login'));
app.use('/register', express.static('register'));



// Schema cho người dùng
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
});

const User = mongoose.model('User', UserSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});


// Route hiển thị trang đăng ký
app.get('/register', (req, res) => {
    res.render('register'); // Render trang register.ejs
});

app.post('/register', async (req, res) => {
    const { name, email, password, re_password } = req.body;

    if (password !== re_password) {
        return res.status(400).send('Mật khẩu không khớp!');
    }

    try {
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.redirect('/login'); // Redirect đến trang đăng nhập
    } catch (error) {
        res.status(400).send('Đã có lỗi xảy ra: ' + error.message);
    }
});

// Route hiển thị trang đăng nhập
app.get('/login', (req, res) => {
    res.render('login'); // Render trang login.ejs
});

app.post('/login', async (req, res) => {
    const { email, pass } = req.body;

    const user = await User.findOne({ email, password: pass });
    if (!user) {
        return res.status(400).send('Email hoặc mật khẩu không đúng!');
    }

    req.session.userId = user._id; // Lưu ID người dùng vào phiên làm việc
    res.redirect('/home'); // Redirect đến trang home sau khi đăng nhập thành công
});

app.get('/home', (req, res) => {
    // if (!req.session.userId) {
    //     return res.redirect('/login'); // Nếu không đăng nhập, redirect đến trang đăng nhập
    // }
    res.render('home'); // Render trang home
});

app.get('/test', (req, res) => {
    res.render('test'); // Render trang test
});

app.get('/:room', (req, res) => {
    let addRoomId = req.params.room;
    console.log(addRoomId);
    res.render('room', { roomId: `${addRoomId}` }); // Gửi ID từ thanh địa chỉ đến ejs
});

io.on('connection', socket => {
    // Các sự kiện socket.io của bạn
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Serving port 3000");
});
