const jwt = require('jsonwebtoken');
const fs = require('fs');


module.exports = function auth(roles) {

    return async function (req, res, next) {
        
        const token = await req.header('x-auth-token');
        
        if (!token) return res.status(401).send('Access denied. No token provided');

        try {
            const privateKey = fs.readFileSync('config/private.key', 'utf8');
            const decoded = jwt.verify(token, privateKey);

            // const allRoles = await useRepo.getRoles();
            // let activeRole = '';

            // for (let index = 0; index < allRoles.length; index++) {
            //     const element = allRoles[index];
            //     if (element.roleId === decoded.role) {
            //         activeRole = element.roleName;
            //     }
            // }

            let iUSerInRole = false;
            if (roles) {
                roles.forEach(element => {
                    if (element === decoded.role) {
                        iUSerInRole = true;
                    }
                });
            }

            if (iUSerInRole == false) {
                res.status(400).send('Permission not granted.');
            }
        } catch (ex) {
            res.status(400).send('Invalid token.');
        }
        next();
    };

};