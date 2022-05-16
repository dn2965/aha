const express = require('express');
const connection = require('../db/databaseConnection');

const router = express.Router();

const AHA_DATE_FORMAT = '%Y-%m-%d %H:%i:%s';

router.get('/', async (req, res) => {
    if (req.session.user) {
        const dashboardStatisticsResult = async () => new Promise((resolve, reject) => {
            const dashboardStatisticsSql = `
                select (SELECT COUNT(*) FROM users u LEFT JOIN verifications v ON u.email = v.email
                        WHERE (v.verify = 1 OR u.user_type > 0)) totalActiveUsers,

                       (SELECT COUNT(distinct (u.id)) FROM users u LEFT JOIN userloginhistory h ON u.id = h.user_id
                        WHERE DATE (last_login) = CURDATE()) totalActiveUserToday,

                    (select COUNT (*) / 7 FROM (SELECT h.id FROM users u JOIN userloginhistory h ON u.id = h.user_id
                    WHERE h.last_login > (now() - INTERVAL 7 DAY) GROUP BY u.id, DATE (last_login)) allRows) avgUsersIn7Days
                ;
            `;
            connection.query(dashboardStatisticsSql, (error, results) => {
                if (error) reject(error);
                const record = results.length > 0 ? results[0] : {};
                resolve({
                    totalActiveUsers: record.totalActiveUsers || 0,
                    totalActiveUserToday: record.totalActiveUserToday || 0,
                    avgUsersIn7Days: record.avgUsersIn7Days || 0
                });
            });
        });

        const dashboardResult = async () => new Promise((resolve, reject) => {
            const dashboardSql = `
                SELECT u.name,
                       u.email,
                       date_format((SELECT updated_at FROM verifications where email = u.email AND verify = 1 LIMIT 1), '${AHA_DATE_FORMAT}') signUpDate,
                       date_format(u.created_at, '${AHA_DATE_FORMAT}') signUpDateForOAuthUser,
                       (SELECT COUNT(*) FROM userloginhistory h WHERE h.user_id = u.id) timesLoggedIn,
                       (SELECT date_format(h.last_login, '${AHA_DATE_FORMAT}') FROM userloginhistory h WHERE h.user_id = u.id ORDER BY id DESC LIMIT 1) lastLoginAt
                FROM users u LEFT JOIN verifications v ON u.email = v.email;
            `;
            connection.query(dashboardSql, (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results.map((record) => ({
                    name: record.name,
                    email: record.email,
                    updated_at: (record.signUpDate || record.signUpDateForOAuthUser),
                    timesLoggedIn: record.timesLoggedIn,
                    lastLoginAt: record.lastLoginAt
                })));
            });
        });

        res.render('simpleDashboard', {
            userData: await dashboardResult(),
            dashboardStatistics: await dashboardStatisticsResult()
        });
    } else {
        res.render('signIn');
    }
});

module.exports = router;
