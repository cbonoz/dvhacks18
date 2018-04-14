/**
 * Created by cbuonocore on 4/13/18.
 */
const axios = require('axios');
const routable = require('../routable');
const fs = require('fs');

const content = fs.readFileSync("demo/nodes.json", "utf8");
let ports = JSON.parse(content);
ports = ports.map((p, i) => {
    p.lat = p.latitude;
    p.lng = p.longitude;
    delete p.latitude;
    delete p.longitude;
    p.name = `port${i}`;
    return p;
});
console.log(ports);
const BASE_URL = "localhost:9001";

const portUrl = `${BASE_URL}/api/ports/add`;
axios.post(portUrl, {
    ports: ports
}).then(response => {
    const portData = response.data;
    console.log('portData', portData);
    const jobs = [];

    const jobUrl = `${BASE_URL}/api/jobs/add`;
    axios.post(jobUrl, {
        jobs: jobs
    }).then(response => {
        const jobData = response.data;
        console.log('jobData', jobData);
    });
});


