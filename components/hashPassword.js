const bcrypt = require('bcrypt');



const encrypt = async (password) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
   
    return hashedPassword;
};
const deCrypt = async (password, hash) => {
    const resultPassword = await bcrypt.compare(password, hash);
   
    return resultPassword;
};


module.exports = {
    encrypt,
    deCrypt
};