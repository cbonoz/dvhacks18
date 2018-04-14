/**
 * Created by cbuonocore on 4/13/18.
 */
const axios = require('axios');
const routable = require('../routable');
const fs = require('fs');

const content = fs.readFileSync("demo/nodes.json", "utf8");
const locations = JSON.parse(content);

const url = `${BASE_URL}/api/schedule/add`;
return axios.post(url, {
    userId: user.uid,
    email: user.email,
    username: user.email.split('@')[0],
    address: address
}).then(response => {
    const data = response.data;
    return data;
});

axios.post({

});

