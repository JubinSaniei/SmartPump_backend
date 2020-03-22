let dbConfig = {
    server: "40.78.42.82",
    database: "CasDatabase",
    user: "sa",
    password: "Davidovich6160***",
    port: 4433,
    driver: 'tedious',

    options: {
        encrypt: false,
        // tedious options
        //instanceName:''
        appName: '**',
        connectTimeout: 15000,
        requestTimeout: 150000

    },
    pool: {
        max: 20,
        min: 10,
        idleTimeoutMillis: 3000
    }
};

module.exports={
    dbConfig
};
