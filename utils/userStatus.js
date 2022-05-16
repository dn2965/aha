const connection = require('../db/databaseConnection');

exports.USER_TYPE_AHA = 1;
exports.USER_TYPE_GOOGLE = 2;
exports.USER_TYPE_FACEBOOK = 3;

exports.isActiveSessionUser = (req) => req.session.user !== undefined;

exports.isLocalUser = (req) => req.session.user && (req.session.user.userType === this.USER_TYPE_AHA);

exports.findUserByEmailAndUserType = async (email, userType) => {
    const findByEmail = async () => new Promise((resolve, reject) => {
        const findByEmailSql = `SELECT *
                                FROM users
                                where email = "${email}"
                                  AND user_type =
                                      (SELECT id FROM usertype WHERE type = '${userType}')
                                    limit 1;`;
        connection.query(findByEmailSql, (error, results) => {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
    const user = await findByEmail();
    return user;
};

exports.findUserByEmail = async (email) => {
    const findByEmail = async () => new Promise((resolve, reject) => {
        const findByEmailSql = `SELECT *
                                FROM users
                                where email = "${email}"
                                  AND user_type = "${this.USER_TYPE_AHA}" limit 1;`;
        connection.query(findByEmailSql, (error, results) => {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
    const user = await findByEmail();
    return user;
};

exports.findUserByToken = async (token) => {
    const findByToken = async () => new Promise((resolve, reject) => {
        const checkEmailVerifySql = `SELECT *
                                     FROM users
                                     WHERE email = (SELECT email
                                                    FROM verifications
                                                    where token = '${token}'
                                                      and verify = 1)
                                       AND user_type = ${this.USER_TYPE_AHA} limit 1;`;
        connection.query(checkEmailVerifySql, (error, results) => {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
    const user = await findByToken();
    return user;
};

exports.getVerifiedUser = async (email, password) => new Promise((resolve, reject) => {
    const checkUserSql = `SELECT u.name,
                                 u.email,
                                 u.id,
                                 u.user_type,
                                 v.token,
                                 v.verify verify
                          FROM users u
                                   join verifications v on u.email = v.email
                          WHERE u.email = '${email}'
                            AND u.password = '${password}'
                            AND user_type = ${this.USER_TYPE_AHA} limit 1;`;
    connection.query(checkUserSql, (error, results) => {
        if (error) {
            reject(error);
        }
        resolve(results);
    });
});
