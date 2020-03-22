const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/user.repo');
const tok = require('../components/securityContext');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const hashPassword = require('../components/hashPassword');
const encrDecr = require('crypto-js');
const app = require('../app').app;
const request = require('request');

const getUserData = async (id) => {

    if (!id) {
        return Promise.reject('Invalid request');
    }

    const result = await userRepo.findById(id);

    // encripting data before pass it to api
    const ecripting = encrDecr.AES.encrypt(JSON.stringify(result), 'secret key 123').toString();


    return Promise.resolve(ecripting);
};

const login = async (data) => {

    // Create Schema
    const schema = Joi.object().keys({
        userName: Joi.string().email().required().lowercase().trim(),
        password: Joi.string().alphanum().min(3).max(30).trim()
    });

    // validating the schema
    const {
        error,
        value
    } = schema.validate(data);

    // error in validation, return the error
    if (error) {
        return Promise.reject(error);
    }

    // find the username(email)
    const resultUser = await userRepo.findByEmail(value.userName);

    // if user is not registered
    if (!resultUser) {

        return Promise.reject('Error: Username or Password is not registered. Please register first.');
    }

    // Check user permission
    if (resultUser.isActive === false) {
        return Promise.reject('Access Denied! Please check your email address and confrim your email');
    }

    // get the password
    const confPass = await userRepo.confirmPass(resultUser.guid);

    // compare hash password
    // const resultPassword = await bcrypt.compare(value.password, confPass.password);
    const resultPassword = await hashPassword.deCrypt(value.password, confPass.password);

    if (resultPassword === false) {

        // check if password is wrong teminate the process and promt to user
        return Promise.reject('Invalid username or password');

    } else if (resultPassword === true) {

        // check if password is correct
        const routePath = (`${path.resolve()}/config/`);
        // Best place to privateKey is in the enviroment Variable, stored this on the file for this projcet.
        const privateKey = await fs.readFileSync(`${routePath}private.key`, 'UTF8');

        // Generate Token
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 600),
            id: resultUser._id,
            guid: resultUser.guid,
            firstName: resultUser.firstName,
            lastName: resultUser.lastName,
            isActive: resultUser.isActive,
            picture: resultUser.picture,
            company: resultUser.company,
            email: resultUser.email

        }, privateKey, {
            algorithm: 'HS512'
        });
        return Promise.resolve(token);

    } else {

        // if any other error happened terminate the process
        return Promise.reject('Invalid request or bad data.');
    }
};


const registerUser = async (data) => {
    const schema = Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required().lowercase().trim(),
        password: Joi.string().min(3).max(30).required().trim(),
        rePassword: Joi.string().min(3).max(30).required().trim()
    });

    // validating the schema
    const {
        error,
        value
    } = schema.validate(data);

    if (error) {
        return Promise.reject(error.message);
    }
    if (value.password != value.rePassword) {
        return Promise.reject('Password is not match');
    }

    // Hash password
    const HashedPassword = await hashPassword.encrypt(value.password);
    if (!HashedPassword) {
        return Promise.reject('Invalud Request. Try again');
    }

    // check for douplicat email address
    const checkEmail = await userRepo.findByEmail(value.email);
    if (checkEmail) {
        return Promise.reject('User already exist.');
    }

    const picture = 'http://placehold.it/32x32';
    const status = false;
    const result = await userRepo.registerUser(value.firstName, value.lastName, value.email, HashedPassword, status, picture);

    if (!result) {
        return Promise.reject('System error. please try again');
    }
    const email = await sendEmailConfirm(result.guid, result.email);

    return Promise.resolve(`${value.firstName} ${value.lastName} successfully created. Email validation sent to your email address, please confirm your email`);
};

sendEmailConfirm = async (userId, email) => {
    console.log(userId, email);
    // check if password is correct
    const routePath = (`${path.resolve()}/config/`);
    // Best place to privateKey is in the enviroment Variable, stored this on the file for this projcet.
    const privateKey = await fs.readFileSync(`${routePath}private.key`, 'UTF8');

    // Generate Token
    const token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 600),
        guid: userId

    }, privateKey, {
        algorithm: 'HS512'
    });

    // Sending request to mail service API
    let response = await request.post('http://jmail.jubinsaniei.com/api/email/emailConfirm', {
        json: {
            emailTo: email,
            Subject: 'Please confirm your email',
            Message: `<p> To confirm your email please </p> <a href="http://smartpump.jubinsaniei.com/api/user/confirmEmail/${token}">Click Here</a>`
        }
    }, (error, res, body) => {
        if (error) {
            console.log(error);
            return error;
        }
    });


};

// Get request from HTTP header
const confirmEmail = async (emailToken) => {

    // validate token
    const verifyToken = await tok.discoverToken(emailToken);
    if (!verifyToken) {
        return;
    }
    // Find user information
    const findUser = await userRepo.findById(verifyToken.guid);
    if (!findUser) {
        return;
    }

    // Activate user
    const activation = await userRepo.activateUser(findUser.guid);
    return Promise.resolve('Account is activated.');

};

const update = async (data) => {

    const schema = Joi.object().keys({
        guid: Joi.string().required(),
        firstName: Joi.string().required().trim(),
        lastName: Joi.string().required().trim(),
        phone: Joi.number().allow(null),
        address: Joi.string().allow('', null).max(150).trim(),
        age: Joi.number().allow(null),
        eyeColor: Joi.string().allow('', null).trim(),
        company: Joi.string().allow('', null).max(150).trim(),
        picture: Joi.string().optional().allow('', null)
    });

    // validating the schema
    const {
        error,
        value
    } = schema.validate(data);

    if (error) {
        return Promise.reject(error);
    }

    // check if there is no picture
    if (!value.picture) {
        value.picture = 'http://placehold.it/32x32'
    }
    // find guid
    const findUser = await userRepo.findById(value.guid);

    if (!findUser) {
        return Promise.reject('Record not found.');
    }

    // update the record
    const result = await userRepo.update(findUser.guid, value.firstName, value.lastName, value.phone, value.address, value.age, value.eyeColor, value.picture, value.company);

    if (!result) {
        return Promise.reject('Record is not updated.');
    }
    return Promise.resolve(result);
};

const resetPassword = async (data) => {
    const schema = Joi.object().keys({
        guid: Joi.string().required(),
        oldPassword: Joi.string().min(3).max(30).required().trim(),
        newPassword: Joi.string().min(3).max(30).required().trim(),
        confirmPassword: Joi.string().min(3).max(30).required().trim(),
    });

    // validating the schema
    const {
        error,
        value
    } = schema.validate(data);

    if (error) {
        return Promise.reject(error);
    }

    // compare password and confirmPassword
    if (value.newPassword != value.confirmPassword) {
        return Promise.reject('Confirm password is not match');
    }

    // check password is correct
    const passCheck = await userRepo.confirmPass(value.guid);
    if (!passCheck) {
        return Promise.reject('Error: Invalid request or bad data');
    }


    const resultPassword = await hashPassword.deCrypt(value.oldPassword, passCheck.password);

    if (resultPassword) {

        // find guid
        const findUser = await userRepo.findById(value.guid);

        if (!findUser) {
            return Promise.reject('Record not found.');

        } else {

            // update password
            const newPass = await hashPassword.encrypt(value.newPassword);
            const result = await userRepo.resetPassword(findUser.guid, newPass);
            return Promise.resolve('Password successfully updated.');
        }
    } else {
        return Promise.reject('Current Password is not correct');
    }

};

const deposit = async (data) => {
    const schema = Joi.object().keys({
        guid: Joi.string().required(),
        newValue: Joi.number().required(),

    });

    // validating the schema
    const {
        error,
        value
    } = schema.validate(data);

    if (error) {
        return Promise.reject(error);
    }

    const result = await userRepo.deposit(value.guid, value.newValue);

    return Promise.resolve(result);

};
const withdraw = async (data) => {
    const schema = Joi.object().keys({
        guid: Joi.string().required(),
        newValue: Joi.number().required(),

    });

    // validating the schema
    const {
        error,
        value
    } = schema.validate(data);

    if (error) {
        return Promise.reject(error);
    }

    // check to avoid overdraft
    const findUser = await userRepo.findById(value.guid);

    if (findUser.balance.totalDeposit < (value.newValue + findUser.balance.totalWithdraw)) {
        return Promise.reject('Total amount requested is bigger than your balance.');
    }

    // save the transaction
    const result = await userRepo.withdraw(value.guid, value.newValue);

    return Promise.resolve(result);

};

const accountDelete = async (data) => {
    const schema = Joi.object().keys({
        guid: Joi.string().required(),
        password: Joi.string().required(),

    });

    // validating the schema
    const {
        error,
        value
    } = schema.validate(data);

    if (error) {
        return Promise.reject(error);
    }

    // get user data from repository
    const userData = await userRepo.findById(value.guid);

    // check password is correct
    const passCheck = await userRepo.confirmPass(value.guid);
    if (!passCheck) {
        return Promise.reject('Error: Invalid request or bad data');
    }

    // validatin the password
    const resultPassword = await hashPassword.deCrypt(value.password, passCheck.password);

    if (!resultPassword) {
        return Promise.reject('Password is not correct');
    } else {

        // send request to repository
        const result = await userRepo.accountDelete(userData._id);

    }

};

module.exports = {
    login,
    getUserData,
    registerUser,
    update,
    resetPassword,
    deposit,
    withdraw,
    accountDelete,
    confirmEmail
};