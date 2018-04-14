// Author: Chris Buonocore (April 2018)
// Project: Routable
// License: MIT
// Made for DV Hacks 2018

(function () {
    "use strict";
    const axios = require('axios');
    const express = require('express');
    const cors = require('cors');
    const bodyParser = require('body-parser');
    const fs = require('fs');
    const http = require('http');
    const pg = require('pg');

    const PORT = 9001;

    const app = express();
    const server = http.createServer(app);
    // const io = require('socket.io')(server, {origins: '*:*'});

    const routable = require('./routable');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use(cors());

    app.get('/api/hello', (req, res) => {
        return res.json("hello world");
    });

    /**
     * Returns the optimal schedule for the given driver and day.
     * Returned as a list of ordered nodes.
     * day: date in format MM-dd-YYYY
     * driverId: driver id of the desired user
     */
    app.get('/api/schedule/:day/:driverId', (req, res) => {
        const day = req.params.day;
        console.log('address');

        const files = [];
        return res.json(files);
    });

    // app.post('/api/authorize', type, function (req, res, next) {
    //     // req.body contains the text fields
    // });
    //
    // app.post('/api/upload', type, function (req, res, next) {
    //     // req.body contains the text fields
    //     const fileContent = req.body.file;
    // });

    server.listen(PORT, () => {
        console.log('Express server listening on localhost port: ' + PORT);
    });
}());

