const jwt = require('jsonwebtoken');
const fs = require('fs');

const _token = null;

// VERIFY TOKEN
const discoverToken = async (token) => {

    if (!token) {

        return;
    }
    const privateKey = fs.readFileSync('config/private.key');

    return  jwt.verify(token, privateKey);
    
};

// THIS WILL RETURN CURRENT USER BASED ON THE ACTIVE TOKEN
const getCurrentUser = async () => {
    console.log(this._token);
    if (!this._token) {

        return null;
    }

    return this._token.id;
};
const getUserRole = async () => {
    if (!this._token) {
        return null;
    }

    return this._token.role;
};
const getAll = async () => {
    if (!this._token) {
        return null;
    }

    return this._token;
};


module.exports = {
    discoverToken,
    getCurrentUser,
    getUserRole,
    getAll
};