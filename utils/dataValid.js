const validator = require('validator');
const PasswordValidator = require('password-validator');

const ahaSchema = new PasswordValidator();
ahaSchema
.has().lowercase()
.has().uppercase()
.has().digits(1)
.has(/(?=.*[!@#$&*])/)
.is().min(8)
.is().max(100)
;

exports.isValidPassword = (pwd) => ahaSchema.validate(pwd) === true;

exports.isNewUserFormValid = (data) => {
    return ahaSchema.validate(data.password)
        && validator.isEmail(data.email)
        && !validator.isEmpty(data.name)
        && data.password === data.reenteredPassword
        ;
};
