# Config.js

Config.js is used to pull config from a variety of source (currently limited to a json file, an environment variable, or a .env file).

## Usage

The below example shows the usage of this tool:

Provided you have a `mysql.config.json` with a `username` property and the `MYSQL_ACCESS_SECRET` environment variables set, it should function as shown.

```javascript
const loadConfig = require("config.js");

const schema = [
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
]


loadConfig(schema);
/*
{ mysql: 
   { username: 'notarealusername',
     password: 'supersecretpassword' },
  workers: 4 }
*/
```
