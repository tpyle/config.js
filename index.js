const path = require("path");
const fs = require("fs");

const dotenv = require("dotenv");


FILE_CACHE = {};
function loadFile(fileName, fileroot) {
    let _fname = path.join(fileroot, fileName)
    if (!FILE_CACHE.hasOwnProperty(_fname)) {
        try {
            let rawdata = fs.readFileSync(_fname, { ebncoding: "utf-8" });
            FILE_CACHE[_fname] = JSON.parse(rawdata);
        } catch (err) {
            FILE_CACHE[_fname] = {};
        }
    }
    return FILE_CACHE[_fname];
}



function prettySource(schema) {
    switch (schema.source) {
        case "env":
            return `environment variable '${schema.value}' or in a .env file`;
        case "json":
            return `json file '${schema.value.file}' with the key '${schema.value.value}'`;
        default:
            throw new Error(`Unsupported source type ${schema.source} for prettySource`);
    }
}


const DEFAULT_TYPE_MAP = {
    "json": (x)=>x,
    "env": String,
    "sub": Object
}


function loadConfig(configSchema, fileroot) {
    if (!Array.isArray(configSchema)) {
        throw new Error("Received incorrect schema. Schema should be an array of objects.");
    }
    return configSchema
        .map(cschema=>{
            if (typeof(cschema) !== "object") {
                throw new Error(`Improperly formatted config item ${JSON.stringify(cschema)}. All config items should be objects`);
            }
            if (!["name", "value", "source"].map(v=>cschema.hasOwnProperty(v)).reduce((ac,v)=>ac && v)) {
                throw new Error(`Improperly formatted config item ${JSON.stringify(cschema)}. All config items need 'name', 'value', and 'source' properties.`);
            }
            let value = null;
            switch (cschema.source) {
                case "sub":
                    value = loadConfig(cschema.value, fileroot);
                    break;
                case "env":
                    value = process.env[cschema.value] || null;
                    break;
                case "json":
                    data = loadFile(cschema.value.file, fileroot);
                    value = data[cschema.value.value];
                    break;
                default:
                    throw new Error(`Unrecognized config source '${cschema.type}'`);
            }
            if (value == null) {
                if (cschema.required) {
                    throw new Error(`Missing required config item '${cschema.name}'. Should be set in ${prettySource(cschema)}`);
                } else if (cschema.hasOwnProperty("default")) {
                    value = cschema.default;
                }
            } else {
                value = (cschema.type || DEFAULT_TYPE_MAP[cschema.source])(value);
            }
            return [cschema.name, value]
        })
        .reduce((ac, [k,v])=>{
            ac[k] = v;
            return ac;
        }, {});
}


function __loadConfig(schema, 
        {   envfile=path.join(process.cwd(), ".env"), 
            fileroot=path.join(process.cwd()) }={}) {
    dotenv.config({ path: envfile });
    return loadConfig(schema, fileroot);
}


module.exports = __loadConfig;
