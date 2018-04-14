// Author: Chris Buonocore (April 2018)
// Project: Routable
// License: MIT
// Made for DV Hacks 2018

(function () {
    "use strict";

    /*************************
     * CONFIGURATION VARIABLES
     *************************/
    const user = process.env.ROUTABLE_DB_USER;
    const pass = process.env.ROUTABLE_DB_PASS;
    const host = process.env.ROUTABLE_HOST || "localhost:5432";
    const db = process.env.ROUTABLE_DB;

    const PORT = process.env.ROUTABLE_SERVER_PORT || 9001;

    const COMPUTE_LIMIT_MS = 1000;

    /***********
     * LIBRARIES
     ***********/
    const axios = require('axios');
    const express = require('express');
    const cors = require('cors');
    const bodyParser = require('body-parser');
    const fs = require('fs');
    const http = require('http');
    const {Pool, Client} = require('pg');
    const routable = require('./routable');

    /*******
     * SETUP
     *******/
    const app = express();
    const server = http.createServer(app);
    // const io = require('socket.io')(server, {origins: '*:*'});
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use(cors());

    /***********
     * ENDPOINTS
     ***********/
    app.get('/api/hello', (req, res) => {
        return res.json("hello world");
    });

    /**
     * Returns the optimal schedule for the given driver and day.
     * Returned as a list of ordered nodes.
     * Body params:
     *  day: date in format MM-dd-YYYY.
     *  driver: driver identifier of the desired user.
     *  startNode: starting location of the driver.
     * @return list of nodes in order to visit.
     */
    app.post('/api/schedule/:day/:driver/:start', function (req, res, next) {
        const body = req.body;
        const startNode = body.startNode;
        const driver = body.driver;
        const day = body.day;

        // TODO: Retrieve cost matrix based on the day and driver and solve.
        const locations = [];
        const costMatrix = routable.getCostMatrix(locations);

        const solverOpts = {
            numNodes: locations.length,
            costs: costMatrix
        };

        const searchOpts = {
            computeTimeLimit: COMPUTE_LIMIT_MS,
            depotNode: startNode
        };

        console.log('get schedule', day, driver);
        routable.solveTSP(solverOpts, searchOpts, (err, solution) => {
            console.log('solution', solution);
            return res.json(solution);
        });

    });

    app.post('/api/schedule/add', function (req, res, next) {
        const body = req.body;

        // TODO: store data to DB and return success.
        return res.json(body);
    });

    const connectionString = `postgresql://${user}:${pass}@${host}/${db}`;
    console.log('connectionString', connectionString);

    const pool = new Pool({
        connectionString: connectionString,
    });

    // TODO: verify syntax and connect pool asynchronously.
    pool.connect();

    server.listen(PORT, () => {
        console.log('Express server listening on localhost port: ' + PORT);
    });
}());

