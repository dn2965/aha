const validator = require('validator');
const shortid = require('shortid');
const userHelper = require('../utils/userStatus');
const emailUtil = require('../utils/email');
const dataValidUtil = require('../utils/dataValid');
const connection = require('../db/databaseConnection');

async function logUserDataAndSaveHistory(req, userData) {
    const user = {
        id: userData.id,
        name: userData.name,
        userType: userData.user_type,
        email: userData.email
    };
    const logUserHistory = async () => new Promise((resolve, reject) => {
        connection.query('INSERT INTO userloginhistory SET ?', { user_id: userData.id }, (error, results) => {
            if (error) reject(error);
            resolve(results);
        });
    });
    await logUserHistory();
    req.session.user = user;
}

exports.login = async (req, res) => {
    // #swagger.tags = ['users']
    if (!userHelper.isActiveSessionUser(req)) {
        const { email } = req.body;
        const { password } = req.body;
        const allValid = validator.isEmail(email) && !validator.isEmpty(password);
        if (allValid) {
            const checkUserResult = await userHelper.getVerifiedUser(email, password);
            if (checkUserResult.length > 0) {
                const checkUser = checkUserResult[0];
                if (checkUser.verify === 0) {
                    res.status(200).send({
                        success: true,
                        resendEmail: true,
                        msg: 'Resend Email Verification',
                        email: checkUser.email,
                        token: checkUser.token
                    });
                } else {
                    await logUserDataAndSaveHistory(req, checkUser);
                    req.session.save();
                    res.status(200).send({ success: true });
                }
            } else {
                res.status(200).send({ success: false, msg: 'account or pwd is incorrect.' });
            }
        } else { // Display errors to user
            res.status(200).send({ success: false, msg: 'account or pwd is empty.' });
        }
    } else {
        res.status(200).send({ success: true, msg: 'account is login.' });
    }
};

exports.doLogout = (req, res) => {
    // #swagger.tags = ['users']
    if (userHelper.isActiveSessionUser(req)) {
        if (!userHelper.isLocalUser(req, res)) {
            req.logout();
        }
        req.session.destroy();
    }
    res.render('signIn');
};

exports.signUp = (req, res) => {
    // #swagger.tags = ['users']
    if (userHelper.isActiveSessionUser(req)) {
        res.redirect('/dashboard');
    } else {
        res.render('signUp');
    }
};

exports.signIn = (req, res) => {
    // #swagger.tags = ['users']
    if (userHelper.isActiveSessionUser(req)) {
        res.redirect('/dashboard');
    } else {
        res.render('signIn');
    }
};

exports.profile = (req, res) => {
    // #swagger.tags = ['users']
    if (userHelper.isActiveSessionUser(req)) {
        const { user } = req.session;
        res.render('profile', { name: user.name, email: user.email });
    } else {
        res.render('signIn');
    }
};

exports.updateProfile = (req, res) => {
    // #swagger.tags = ['users']
    const newUserName = req.body.name;
    const allValid = !validator.isEmpty(newUserName);
    if (userHelper.isActiveSessionUser(req) && allValid === true) {
        const { user } = req.session;
        connection.query(`UPDATE users SET name = "${newUserName}" WHERE id = "${user.id}" LIMIT 1;`, async (err) => {
            if (err == null) {
                req.session.user.name = newUserName;
                res.status(200).send({ success: true });
            } else {
                res.status(200).send({ success: false, msg: 'profile has been updated.' });
            }
        });
    } else {
        res.status(200).send({ success: false, msg: 'can not update profile.' });
    }
};

exports.resetPassword = (req, res) => {
    // #swagger.tags = ['users']
    if (userHelper.isActiveSessionUser(req)) {
        if (!userHelper.isLocalUser(req)) {
            res.redirect('/dashboard');
        } else {
            res.render('resetPassword');
        }
    } else {
        res.render('signIn');
    }
};

exports.updatePassword = (req, res) => {
    // #swagger.tags = ['users']
    if (userHelper.isActiveSessionUser(req) && userHelper.isLocalUser(req)) {
        const {originalPassword} = req.body;
        const {password} = req.body;
        const {reenteredPassword} = req.body;
        const allValid = !validator.isEmpty(originalPassword)
            && dataValidUtil.isValidPassword(password) && password
            === reenteredPassword && !validator.isEmpty(reenteredPassword);
        if (allValid) {
            const {user} = req.session;
            connection.query(`UPDATE users SET password = "${password}" WHERE password ='${originalPassword}' && id = '${user.id}' LIMIT 1;`, async (err, result) => {
                if (err || result.affectedRows === 0) {
                    res.status(200).send({ success: false, msg: 'can not update password.' });
                } else {
                    res.status(200).send({ success: true, msg: 'password has been updated.' });
                }
            });
        } else {
            res.status(200).send({ success: false, msg: 'passwords are not matched.' });
        }
    } else {
        res.render('signIn');
    }
};

exports.registerNew = async (req, res) => {
    // #swagger.tags = ['users']
    const {name, email, password, reenteredPassword} = req.body;
    if (dataValidUtil.isNewUserFormValid({ name, email, password, reenteredPassword }) === true) {
        const user = {
            name: validator.trim(name),
            email: validator.trim(email),
            password: validator.trim(password),
            user_type: userHelper.USER_TYPE_AHA
        };

        const isUserExisting = (await userHelper.findUserByEmail(email)).length > 0;
        if (isUserExisting) {
            res.status(200).send({success: false, msg: 'user existing.'});
        } else {
            connection.query('INSERT INTO users SET ?', user, async (err) => {
                if (err) {
                    res.status(200).send({ success: false, msg: 'user existing or can not create the user.' });
                } else {
                    const sendMailResult = await emailUtil.sendEmail2User(email);
                    if (sendMailResult.success !== true) {
                        res.status(200).send(sendMailResult);
                    } else {
                        res.status(200).send({
                            success: true,
                            msg: `verification mail has been send to ${email}`
                        });
                    }
                }
            });
        }
    } else {
        res.status(200).send({ success: false, msg: 'form is invalid.' });
    }
};

exports.oauthUser = async (req, res) => {
    // #swagger.tags = ['users']
    if (req.session.passport && req.session.passport.user) {
        const oauthUser = req.session.passport.user;
        const userData = {
            name: oauthUser.displayName,
            email: oauthUser.emails[0].value,
            password: shortid.generate()
        };
        const getCheckedOAuthUserQuerySql = `SELECT *
                                             FROM users
                                             WHERE email = '${userData.email}'
                                               AND user_type = (SELECT id FROM usertype WHERE type = '${req.params.provider}') limit 1;`;
        const getCheckedOAuthUserQuery = async () => new Promise(
            (resolve, reject) => {
                connection.query(getCheckedOAuthUserQuerySql, (error, results) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(results);
                });
            }
        );

        const checkedOAuthUser = await getCheckedOAuthUserQuery();
        if (checkedOAuthUser.length === 0) {
            const addUser = async () => new Promise((resolve, reject) => {
                connection.query(
                    `INSERT INTO users (name, email, password, user_type)
                     VALUES ('${userData.name}', '${userData.email}',
                             '${userData.password}',
                             (SELECT id FROM usertype WHERE type = '${req.params.provider}'))`,
                    (error) => {
                        if (error) {
                            reject(error);
                        }
                        resolve(true);
                    }
                );
            });
            await addUser();
            const newUser = (await userHelper.findUserByEmailAndUserType(userData.email, req.params.provider))[0];
            userData.id = newUser.id;
            await logUserDataAndSaveHistory(req, userData);
        } else {
            await logUserDataAndSaveHistory(req, checkedOAuthUser[0]);
        }
        res.redirect('/dashboard');
    } else {
        res.redirect('/');
    }
};

exports.resend = async (req, res) => {
    // #swagger.tags = ['users']
    const {email} = req.query;
    const {token} = req.query;
    await emailUtil.resend(email, token);
    res.redirect('/');
};

exports.verifyEmail = async (req, res) => {
    // #swagger.tags = ['users']
    const {token} = req.query;
    const verifyResult = await emailUtil.verifyEmail(token);
    if (verifyResult.success === true) {
        await logUserDataAndSaveHistory(req, (await userHelper.findUserByToken(token))[0]);
        res.redirect('/dashboard');
    } else {
        res.redirect('/');
    }
};
