const config = require("../index");

const CONFIG_SCHEMA = [
    {
        name: "mysql",
        source: "sub",
        value: [
            {
                name: "username",
                source: "json",
                value: {
                    file: "mysql.config.json",
                    value: "username"
                },
                required: true
            },
            {
                name: "password",
                source: "env",
                value: "MYSQL_ACCESS_SECRET",
                required: true
            }
        ]
    },
    {
        name: "workers",
        source: "json",
        value: {
            file: "config.json",
            value: "workerCount"
        },
        default: 4
    }
];


console.log(config(CONFIG_SCHEMA));
