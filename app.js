
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const securityContext = require('./components/securityContext');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.json());

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization, x-auth-token');

    securityContext.discoverToken(req.header('x-auth-token'));
    next();
});



// Setting up Server
const server = app.listen(process.env.PORT || 9002, function () {
    const port = server.address().port;
    console.log('Application now running on Port:', port);
});




module.exports = {
    app
};

// Importing APIs

const users = require('./api/login.api');