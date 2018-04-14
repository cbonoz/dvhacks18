/**
 * Created by cbuonocore on 4/13/18.
 */
const axios = require('axios');
const routable = require('../routable');
const fs = require('fs');

const content = fs.readFileSync("demo/nodes.json", "utf8");
const locations = JSON.parse(content);
