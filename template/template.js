const sql = require("mssql");
const uuid = require('uuid');
const dbConfig = require("../config/dbconfig").dbConfig;



const getAll = async () => {
    let pool = new sql.ConnectionPool(dbConfig);
    pool.on('err', err => {
        return Promise.reject(err);
    });
    try {
        await pool.connect();
        const request = pool.request();
        const stringQuery = ``;
        const result = await request.query(stringQuery);
        return Promise.resolve(result);

    } catch (error) {
        return Promise.reject(`DB Error: ${error}`);

    } finally {
        pool.close();
    }

};
const findByName = async () => {
    let pool = new sql.ConnectionPool(dbConfig);
    pool.on('err', err => {
        return Promise.reject(err);
    });
    try {
        await pool.connect();
        const request = pool.request();
        const stringQuery = `select * from EntityCategories where entCategoryName = @entCategoryName`;
        request.input('entCategoryName', sql.NVarChar, entCategoryName);
        const result = await request.query(stringQuery);
        return Promise.resolve(result);


    } catch (error) {
        return Promise.reject(`DB Error: ${error}`);

    } finally {
        pool.close();
    }

};
const save = async () => {
    let pool = new sql.ConnectionPool(dbConfig);
    pool.on('err', err => {
        return Promise.reject(err);
    });
    try {
        await pool.connect();
        const request = pool.request();
        const stringQuery = ``;


    } catch (error) {
        return Promise.reject(`DB Error: ${error}`);

    } finally {
        pool.close();
    }

};
const update = async () => {
    let pool = new sql.ConnectionPool(dbConfig);
    pool.on('err', err => {
        return Promise.reject(err);
    });
    try {
        await pool.connect();
        const request = pool.request();
        const stringQuery = ``;


    } catch (error) {
        return Promise.reject(`DB Error: ${error}`);

    } finally {
        pool.close();
    }

};
const deleteOne = async () => {
    let pool = new sql.ConnectionPool(dbConfig);
    pool.on('err', err => {
        return Promise.reject(err);
    });
    try {
        await pool.connect();
        const request = pool.request();
        const stringQuery = `delete from EntityCategories where entCategoryId = @entCategoryId`;
        request.input('entCategoryId', sql.UniqueIdentifier, entCategoryId);
        const result = await request.query(stringQuery);
        return Promise.resolve(result);


    } catch (error) {
        return Promise.reject(`DB Error: ${error}`);

    } finally {
        pool.close();
    }

};


module.exports = {
    getAll,
    findByName,
    save,
    update,
    deleteOne
};

// -------------------------------------------------------------------------------------
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const outletDetailRepo = require('../repositories/outletDetail.repository');
const tok = require('../components/securityContext');
const fs = require('fs');
const path = require('path');

const getAll = async () => {
    const result = await entCategoryRepo.getAll();
    return Promise.resolve(result.recordset);
};
const save = async (data) => {
    const schema = Joi.object({

    });
    return Joi.validate(data, schema, async (err, value) => {
        if (err) {
            throw err.message.bold();
        }
        const result = await entCategoryRepo.save(value.entCategoryName, value.userProfileId);
        return Promise.resolve(`${value.entCategoryName} is saved successfully.`);
    });
};
const update = async (data) => {
    const schema = Joi.object({

    });
    return Joi.validate(data, schema, async (err, value) => {
        if (err) {
            throw err.message.bold();
        }
        const result = await entCategoryRepo.update(value.entCategoryName, value.userProfileId);
        return Promise.resolve(`${value.entCategoryName} is saved successfully.`);
    });
};
const deleteOne = async (data) => {
    if (!data) {
        return Promise.reject('Service Error: Invalid request or bad data.');
    }
    const result = await pannelDetailRepo.deleteOne(data);
    if (result.rowsAffected[0] === 0) {
        return Promise.reject('Service Error: Record not found or already deleted.');
    }
    return Promise.resolve('Record deleted successfully.');
};

module.exports = {
    getAll,
    save,
    update,
    deleteOne
};

// ---------------------------------------------------------------------------------------
const app = require('../app').app;
const outletDetailService = require('../services/outletDetail.service');
const auth = require('../components/userAuth');

app.get('/api/equipments/outletDetails/getall', auth(['admin', 'user']), (req, res) => {

    outletDetailService.getAll().then(body => {
        res.send(body);
    }).catch((err) => {
        res.status(400).send(`${err}`);
    });
});

app.post('/api/equipments/outletDetails/save', auth(['admin', 'user']), (req, res) => {
    outletDetailService.save(req.body).then(body => {
        res.send(body);
    }).catch((err) => {
        res.status(400).send(`${err}`);
    });
});
app.post('/api/equipments/outletDetails/update', auth(['admin', 'user']), (req, res) => {
    outletDetailService.update(req.body).then(body => {
        res.send(body);
    }).catch((err) => {
        res.status(400).send(`${err}`);
    });
});
app.post('/api/equipments/outletDetails/deleteOne/:id', auth(['admin', 'user']), (req, res) => {
    outletDetailService.deleteOne(req.params.id).then(body => {
        res.send(body);
    }).catch((err) => {
        res.status(400).send(`${err}`);
    });
});