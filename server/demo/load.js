/**
 * Created by cbuonocore on 4/13/18.
 */
const axios = require('axios');
const routable = require('../routable');
const fs = require('fs');

const NUM_JOBS = 5;
const BASE_URL = "http://localhost:9001";

const content = fs.readFileSync("./nodes.json", "utf8");
let ports = JSON.parse(content);

ports = ports.map((p, i) => {
    p.lat = p.latitude;
    p.lng = p.longitude;
    delete p.latitude;
    delete p.longitude;
    p.name = `port${i}`;
    return p;
});

const portUrl = `${BASE_URL}/api/ports/add`;
axios.post(portUrl, {
    ports: ports
}).then(response => {
    return response.data;
}).then((addedPorts) => {
    axios.get(`${BASE_URL}/api/ports`)
        .then(response => {
            return response.data;
        }).then((portData) => {
        ports = portData;
        console.log('ports', portData);

        const jobDate = routable.getToday();

        const jobs = [];
        for (let i = 0; i < NUM_JOBS; i++) {
            const p1 = ports[i];
            const p2 = ports[i + NUM_JOBS];
            jobs.push({
                jobDate: jobDate,
                pickupId: p1.id,
                deliveryId: p2.id
            });
        }
        console.log('jobs', jobs);

        const jobUrl = `${BASE_URL}/api/jobs/add`;
        axios.post(jobUrl, {
            jobs: jobs
        }).then(response => {
        }).then((jobData) => {
            console.log('jobData', jobData);
        }).catch((err2) => {
            console.error('error creating jobs', err2);
        });

    }).catch((errPorts) => {
        console.error('error getting ports', errPorts);
    });
}).catch((err1) => {
    console.error('error creating ports', err1);
});


