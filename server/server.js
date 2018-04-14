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
        const ports = req.ports;

        const values = ports.map((port) => {
            return `(${port.name}, ${port.latitude}, ${port.longitude})`;
        });
        const insertQuery = `'INSERT INTO ports(name, lat, lng) VALUES${values.join(',')}`;
        pool.query(insertQuery, [], (err, res) => {
            if (err) {
                const msg = JSON.stringify(err);
                return res.json(msg).status(500);
            }

            const msg = `inserted ${ports.length} rows`;
            return res.json(msg).status(200);
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
        const vehicleCapacity = body.vehicleCapacity || 2;
        const numVehicles = body.numVehicles;

        const query = `SELECT * FROM job WHERE day=${day}`;
        pool.query(query, [], (err, res) => {
            if (err) {
                const msg = JSON.stringify(err);
                return res.json(msg).status(500);
            }

            const jobs = res.rows; // {pickupId, deliveryId, jobDate}
            if (!jobs) {
                // No tasks required.
                return res.json(routable.createArrayList(numVehicles), []).status(200);
            }

            const ids = new Set();
            jobs.map((job) => {
                ids.add(job.pickupId);
                ids.add(job.deliveryId);
            });

            // Retrieve the ports
            const locationQuery = `SELECT * FROM port where id in (${ids.join(',')})`;
            pool.query(locationQuery, (err, res) => {
                if (err) {
                    const msg = JSON.stringify(err);
                    return res.json(msg).status(500);
                }

                const rows = res.rows;
                // minimal set of locations needed to cover the pickups and deliveries for today.
                const locations = rows.map((row) => {
                    return [row.lat, row.lng];
                });

                // TODO: Construct the location, pickups, and deliveries arrays based on the jobs list.
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

                const costMatrix = routable.getCostMatrix(locations);

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
                        res.json(errorMessage).status(500);
                    }
                    solution.locations = locations;
                    solution.pickups = pickups;
                    solution.deliveries = deliveries;
                    console.log('solution', solution);
                    return res.json(solution).status(200);
                });
            });

        });
    });

    /**
     * Add the jobs to the db.
     * {
     *  locations: [ {pickupId, deliveryId, jobDate} ... ]
     * }
     */
    app.post('/api/jobs/add', function (req, res, next) {
        const body = req.body;
        const locations = body.locations;

        const values = locations.map((location) => {
            return `(${location.pickupId}, ${location.deliveryId}, ${location.jobDate})`;
        });
        const insertQuery = `'INSERT INTO jobs(pickupId, deliveryId, jobDate) VALUES${values.join(',')}`;

        pool.query(insertQuery, (err, res) => {
            if (err) {
                const msg = JSON.stringify(err);
                res.json(err).status(500);
            }
            const msg = `inserted ${locations.length} rows`;
            return res.json(msg).status(200);
        });
    });

    server.listen(PORT, () => {
        console.log('Express server listening on localhost port: ' + PORT);
    });
}());

