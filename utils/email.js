const nodemailer = require('nodemailer');
const validator = require('validator');
const randtoken = require('rand-token');
const connection = require('../db/databaseConnection');

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
        html: `You requested for email verification, kindly use this <a href='http://localhost:8000/users/verify-email?token=${token}' target="_blank">${msg}</a>`
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

exports.sendEmail2User = async (email) => {
    await this.isVerificationSent().then(async (result) => {
        const token = randtoken.generate(20);
        if (result.isSent) {
            return { success: true, msg: 'verification had been sent.' };
        }
        return this.sendEmail(email, token).then(() => {
            connection.query('INSERT INTO verifications SET ?', { email, token });
            return { success: true };
        }, () => ({
            success: false,
            msg: 'send verification mail to user failed.'
        }));
    }, (rej) => ({ success: false, msg: rej }));
};

exports.verifyEmail = async (token) => {
    const checkEmailVerify = async () => new Promise((resolve, reject) => {
        const checkEmailVerifySql = `SELECT * FROM verifications WHERE token = "${token}"`;
        connection.query(checkEmailVerifySql, (error, results) => {
            if (error) reject(error);
            resolve(results);
        });
    });

    const checkEmailVerifyResult = await checkEmailVerify();

    if (checkEmailVerifyResult.length > 0 && checkEmailVerifyResult[0].verify === 0) {
        const updateVerify = async () => new Promise((resolve, reject) => {
            const updateVerifySql = `UPDATE verifications SET ? WHERE email = "${checkEmailVerifyResult[0].email}"`;
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
        return { success: true, msg: 'verified' };
    }
    return { success: false, msg: 'token is not existing.' };
};
