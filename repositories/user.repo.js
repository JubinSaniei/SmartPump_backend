const path = require('path');
const low = require('lowdb');
const uuid = require('uuid');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(path.resolve(__dirname, '../data/user.json'));
const db = low(adapter);


const registerUser = async (firstName, lastName, email, password, status, picture) => {
    db.defaults({
            users: [],
        })
        .write();

    const dbSaved = await db.get('users')
        .push({
            '_id': uuid.v4(),
            'guid': uuid.v4(),
            'isActive': status,
            'balance': {
                'deposit': [{
                    'value': null,
                    'date': null
                }],
                'withdraw': [{
                    'value': null,
                    'date': null
                }],
                "totalDeposit": 0,
                "totalWithdraw": 0
            },
            'picture': picture,
            'age': null,
            'eyeColor': null,
            'name': {
                'first': firstName,
                'last': lastName
            },
            'company': null,
            'email': email,
            'salt': '23derd*334',
            'password': password,
            'phone': null,
            'address': null

        })
        .write();

    return Promise.resolve(dbSaved);
};

const findById = async (guid) => {
    const users = await db
        .get('users')
        .find({
            guid: guid
        })
        .value();

    if (users) {
        return Promise.resolve({
            _id: users._id,
            guid: users.guid,
            firstName: users.name.first,
            lastName: users.name.last,
            isActive: users.isActive,
            picture: users.picture,
            age: users.age,
            eyeColor: users.eyeColor,
            company: users.company,
            email: users.email,
            phone: users.phone,
            address: users.address,
            balance: users.balance
        });
    }

};
const findByEmail = async (email) => {

    const users = await db
        .get('users')
        .find({
            email: email
        })
        .value();

    if (users) {
        return Promise.resolve({
            _id: users._id,
            guid: users.guid,
            firstName: users.name.first,
            lastName: users.name.last,
            isActive: users.isActive,
            picture: users.picture,
            age: users.age,
            eyeColor: users.eyeColor,
            company: users.company,
            email: users.email,
            phone: users.phone,
            address: users.address,
            balance: users.balance
        });
    }

};

const confirmPass = async (guid) => {

    const users = await db
        .get('users')
        .find({
            guid: guid
        })
        .value();

    if (users) {
        return Promise.resolve({
            password: users.password
        });
    }

};
const update = async (guid, firstName, lastName, phone, address, age, eyeColor, picture, company) => {

    const dbUpdate = await db.get('users')
        .find({
            guid: guid
        })
        .assign({
            'picture': picture,
            'age': age,
            'eyeColor': eyeColor,
            'name': {
                'first': firstName,
                'last': lastName
            },
            'company': company,
            'phone': phone,
            'address': address

        })
        .write();
    if (dbUpdate) {
        return Promise.resolve({
            _id: dbUpdate._id,
            guid: dbUpdate.guid,
            firstName: dbUpdate.name.first,
            lastName: dbUpdate.name.last,
            isActive: dbUpdate.isActive,
            picture: dbUpdate.picture,
            age: dbUpdate.age,
            eyeColor: dbUpdate.eyeColor,
            company: dbUpdate.company,
            email: dbUpdate.email,
            phone: dbUpdate.phone,
            address: dbUpdate.address
        });
    }
};

const resetPassword = async (guid, password) => {
    const passUpdate = await db.get('users')
        .find({
            guid: guid
        })
        .assign({
            'password': password,
        })
        .write();
    if (passUpdate) {
        return Promise.resolve({
            _id: passUpdate._id,
            guid: passUpdate.guid,
            firstName: passUpdate.name.first,
            lastName: passUpdate.name.last,
            isActive: passUpdate.isActive,
            picture: passUpdate.picture,
            age: passUpdate.age,
            eyeColor: passUpdate.eyeColor,
            company: passUpdate.company,
            email: passUpdate.email,
            phone: passUpdate.phone,
            address: passUpdate.address
        });
    }
};


const deposit = async (guid, newValue) => {

    const currentDate = new Date(Date.now()).toLocaleString();
    let totalDeposit = null;
    const dbUser = await db.get('users')
        .find({
            guid: guid
        })
        .get('balance')
        .get('deposit')
        .push({
            value: newValue,
            date: currentDate,
            method: 0
        })
        .write();

    for (let index = 0; index < dbUser.length; index++) {
        const element = dbUser[index];
        totalDeposit += element.value;
    }

    const balance = await db.get('users')
        .find({
            guid: guid
        })
        .get('balance')
        .assign({
            'totalDeposit': totalDeposit
        })
        .write();

    return Promise.resolve(balance);

};

const withdraw = async (guid, newValue) => {
    const currentDate = new Date(Date.now()).toLocaleString();
    let totalWithdraw = null;
    const dbUser = await db.get('users')
        .find({
            guid: guid
        })
        .get('balance')
        .get('withdraw')
        .push({
            value: newValue,
            date: currentDate,
            method: 1
        })
        .write();

    for (let index = 0; index < dbUser.length; index++) {
        const element = dbUser[index];
        totalWithdraw += element.value;
    }

    const balance = await db.get('users')
        .find({
            guid: guid
        })
        .get('balance')
        .assign({
            'totalWithdraw': totalWithdraw
        })
        .write();

    return Promise.resolve(balance);
};

const accountDelete = async (id) => {

    const userAccount = await db.get('users')

    .remove(a => a._id === id).write();

    if (userAccount) {
        return Promise.resolve(userAccount);
    }
};

module.exports = {

    registerUser,
    findById,
    confirmPass,
    findByEmail,
    update,
    resetPassword,
    deposit,
    withdraw,
    accountDelete
};