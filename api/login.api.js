const app = require('../app').app;
const userService = require('../services/user.service');


/**
 * login
 */
app.post('/api/user/login', (req, res) => {
    userService.login(req.body).then(body => {

        res.send(body);
    }).catch((err) => {
        res.status(400).send(`${err}`);
    });
});

/**
 * Find user by GUID
 */
app.get('/api/user/userData/:id', (req, res) => {

    userService.getUserData(req.params.id).then(body => {

        res.send(body);
    }).catch((err) => {
        res.status(400).send(`${err}`);
    });
});

/**
 * User Register
 */
app.post('/api/user/register', (req, res) => {

    userService.registerUser(req.body).then(body => {

        res.send(body);
    }).catch((err) => {
        res.status(400).send(`${err}`);
    });
});
/**
 * User email confirmed
 */
app.get('/api/user/confirmEmail/:token', (req, res) => {

    userService.confirmEmail(req.params.token).then(body => {

        res.send(body);
    }).catch((err) => {
        res.status(400).send(`${err}`);
    });
});

/**
 * Update user information
 */
app.post('/api/user/update', (req, res) => {
    userService.update(req.body).then(body => {

        res.send(body);
    }).catch((err) => {
        res.status(400).send(`${err}`);
    });
});

/**
 * Reset user password
 */
app.post('/api/user/resetPassword', (req, res) => {
    userService.resetPassword(req.body).then(body => {

        res.send(body);
    }).catch((err) => {
        res.status(400).send(`${err}`);
    });
});

/**
 * deposit to user account
 */
app.post('/api/user/deposit', (req, res) => {
    userService.deposit(req.body).then(body => {

        res.send(body);
    }).catch((err) => {
        res.status(400).send(`${err}`);
    });
});

/**
 * /Withdraw from user account
 */
app.post('/api/user/withdraw', (req, res) => {
    userService.withdraw(req.body).then(body => {

        res.send(body);
    }).catch((err) => {
        res.status(400).send(`${err}`);
    });
});

/**
 * Delete user account
 */
app.post('/api/user/accountDelete', (req, res) => {
    userService.accountDelete(req.body).then(body => {

        res.send(body);
    }).catch((err) => {
        res.status(400).send(`${err}`);
    });
});