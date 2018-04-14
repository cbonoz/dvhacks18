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
    const INF = 100000;

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

    const connectionString = `postgresql://${user}:${pass}@${host}/${db}`;
    console.log('connectionString', connectionString);

    const pool = new Pool({
        connectionString: connectionString,
    });

    /***********
     * ENDPOINTS
     ***********/
    app.get('/api/hello', (req, res) => {
        return res.json("hello world");
    });

    /*
     * Register new ports with the Routable DB.
     * {
     *  ports: [ {name, latitude, longitude}, ... ]
     * }
     */
    app.post('/api/ports/add', function (req, res, next) {
        const body = req.body;
        const ports = body.ports;

        const values = ports.map((port) => {
            return `(${port.name}, ${port.latitude}, ${port.longitude})`;
        });
        const insertQuery = `INSERT INTO ports(name, lat, lng) VALUES${values.join(',')}`;
        console.log('port insertQuery', insertQuery)
        pool.query(insertQuery, [], (err, data) => {
            if (err) {
                const msg = JSON.stringify(err);
                return res.status(500).json(msg);
            }

            const msg = `inserted ${ports.length} rows`;
            return res.status(200).json(msg);
        });
    });

    /**
     * Returns the optimal schedule for the given driver and day.
     * Returned as a list of ordered nodes.
     *
     */
    app.post('/api/schedule', function (req, res, next) {
        const body = req.body;

        const day = body.day;
        const startingPortId = body.startingPortId || 0;
        const numVehicles = body.numVehicles;
        const vehicleCapacity = body.vehicleCapacity || 2;

        const query = `SELECT * FROM job WHERE day=${day}`;
        pool.query(query, [], (err, jobData) => {
            if (err) {
                const msg = JSON.stringify(err);
                return res.status(500).json(msg);
            }

            const jobs = jobData.rows; // {pickupId, deliveryId, jobDate}
            if (!jobs) {
                // No tasks required.
                return res.status(200).json(routable.createArrayList(numVehicles), [])
            }

            const ids = new Set();
            jobs.map((job) => {
                ids.add(job.pickupId);
                ids.add(job.deliveryId);
            });

            // Retrieve the ports
            const portQuery = `SELECT * FROM port where id in (${ids.join(',')})`;
            pool.query(portQuery, (err, portData) => {
                if (err) {
                    const msg = JSON.stringify(err);
                    return res.status(500).json(msg);
                }

                const rows = portData.rows;
                // minimal set of ports needed to cover the pickups and deliveries for today.
                const ports = rows.map((row) => {
                    return [row.lat, row.lng];
                });

                const pickups = [];
                const deliveries = [];
                jobs.map((job) => {
                    const pid = rows.findIndex((loc) => {
                        return loc.id === job.pickupId;
                    });
                    pickups.push(pid);
                    const did = rows.findIndex((loc) => {
                        return loc.id === job.pickupId;
                    });
                    deliveries.push(did);
                });

                const costMatrix = routable.getCostMatrix(ports);

                const n = jobs.length;
                const startNode = rows.findIndex((loc) => {
                    return loc.id === startingPortId;
                });

                const solverOpts = {
                    numNodes: n,
                    costs: costMatrix,
                    durations: routable.matrix(n, n, 1),
                    timeWindows: routable.createArrayList(n, [0, INF]),
                    demands: routable.createDemandMatrix(n, startNode)
                };

                // No route locks/restrictions.
                const routeLocks = routable.createArrayList(numVehicles, []);

                const searchOpts = {
                    computeTimeLimit: COMPUTE_LIMIT_MS,
                    numVehicles: numVehicles,
                    depotNode: startNode,
                    timeHorizon: INF,
                    vehicleCapacity: vehicleCapacity,
                    routeLocks: routeLocks,
                    pickups: pickups,
                    deliveries: deliveries
                };

                routable.solveVRP(solverOpts, searchOpts, (err, solution) => {
                    if (err) {
                        const errorMessage = JSON.stringify(err);
                        res.status(500).json(errorMessage);
                    }
                    solution.ports = ports;
                    solution.pickups = pickups;
                    solution.deliveries = deliveries;
                    console.log('solution', solution);
                    return res.status(200).json(solution);
                });
            });

        });
    });

    /**
     * Add the jobs to the db.
     * {
     *  jobs: [ {pickupId, deliveryId, jobDate} ... ]
     * }
     */
    app.post('/api/jobs/add', function (req, res, next) {
        const body = req.body;
        const jobs = body.jobs;

        const values = jobs.map((job) => {
            return `(${job.pickupId}, ${job.deliveryId}, ${job.jobDate})`;
        });
        const insertQuery = `INSERT INTO jobs(pickupId, deliveryId, jobDate) VALUES${values.join(',')}`;
        console.log('job insertQuery', insertQuery)

        pool.query(insertQuery, (err, jobData) => {
            if (err) {
                const msg = JSON.stringify(err);
                res.status(500).json(err);
            }
            const msg = `inserted ${jobs.length} rows`;
            return res.status(200).json(msg);
        });
    });

    server.listen(PORT, () => {
        console.log('Express server listening on localhost port: ' + PORT);
    });
}());

