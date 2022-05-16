const nodemailer = require('nodemailer');
const validator = require('validator');
const randtoken = require('rand-token');
const connection = require('../db/databaseConnection');


const RAND_TOKEN_SIZE = 20;

exports.sendEmail = async (email, token, msg = 'Verify Email Verification') => {
    const mail = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'aha29652965@gmail.com',
            pass: '_ahaaha_'
        }
    });

    const mailOptions = {
        from: 'aha29652965@gmail.com',
        to: email,
        subject: 'Email verification - by testing Aha exam',
        html: `You requested for email verification, kindly use this <a href='https://aha-dn2965.herokuapp.com/users/verify-email?token=${token}' target="_blank">${msg}</a>`
    };

    await mail.sendMail(mailOptions, (error) => {
        if (error) {
            return 1;
        }
        return 0;
    });
};

exports.resend = async (email, token) => {
    const allValid = validator.isEmail(email) && !validator.isEmpty(token);
    if (allValid) {
        await this.sendEmail(email, token, 'Resend Email Verification');
        return true;
    }
    return false;
};

exports.isVerificationSent = async (email) => new Promise((resolve, reject) => {
    const VerificationSentSql = `SELECT * FROM verifications WHERE email ="${email}"`;
    connection.query(VerificationSentSql, (error, results) => {
        if (error) reject(error);
        resolve({ isSent: results.length > 0 });
    });
});

exports.isLinkValid = async (token) => new Promise((resolve, reject) => {
    const VerificationSentSql = `SELECT * FROM verifications WHERE verify = 0 AND token ="${token}"`;
    connection.query(VerificationSentSql, (error, results) => {
        if (error) reject(error);
        resolve(results.length > 0);
    });
});


exports.sendEmail2User = async (email) => {
    const checkVerificationSent = await this.isVerificationSent();
    if (checkVerificationSent.isSent === true) {
        return {success: true, msg: 'verification had been sent.'};
    } else {
        const token = randtoken.generate(RAND_TOKEN_SIZE);
        return this.sendEmail(email, token).then(() => {
            connection.query('INSERT INTO verifications SET ?', {email, token});
            return {success: true};
        }, () => ({
            success: false,
            msg: 'send verification mail to user failed.'
        }));
    }
};

exports.verifyEmail = async (token) => {
    const isLinkValid = await this.isLinkValid(token);
    if (isLinkValid === true) {
        const updateVerify = async () => new Promise((resolve, reject) => {
            const updateVerifySql = `UPDATE verifications SET ? WHERE token = "${token}"`;
            const data = {
                verify: 1,
                updated_at: new Date()
            };
            connection.query(updateVerifySql, data, (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });

        await updateVerify();
        return {success: true, msg: 'verified'};
    }
    return {success: false, msg: 'token is invalid.'};
};
