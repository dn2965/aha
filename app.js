const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const doashboardRouter = require('./routes/dashboard');

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser('ahaaha'));
app.use(session({
    secret: 'ahaaha',
    name: 'ahaTestCookie',
    cookie: { maxAge: 600000 } // 10 min
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dashboard', doashboardRouter);
app.use((req, res) => {
    res.end('not routed, check path.');
});

app.listen(8000, () => {

});
