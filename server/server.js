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
    const host = process.env.ROUTABLE_HOST || "localhost";
    const db = process.env.ROUTABLE_DB;
    const PORT = process.env.ROUTABLE_SERVER_PORT || 9001;

    const COMPUTE_LIMIT_MS = 1000;
    const INF = 1000000;

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

    const connectionString = `postgres://${user}:${pass}@${host}:5432/${db}`;
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
     * Returns registered ports.
     */
    app.get('/api/ports', (err, res) => {
        const portQuery = `SELECT * from port`;
        pool.query(portQuery, (err, data) => {
            if (err) {
                const msg = JSON.stringify(err);
                return res.status(500).json(msg);
            }

            return res.status(200).json(data.rows);
        });
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
            return `('${port.name}', ${port.lat}, ${port.lng})`;
        });
        const insertQuery = `INSERT INTO port(name, lat, lng) VALUES${values.join(',')} ON CONFLICT DO NOTHING`;
        // console.log('port insertQuery', insertQuery);
        pool.query(insertQuery, [], (err, data) => {
            if (err) {
                const msg = JSON.stringify(err);
                console.log(err)
                return res.status(500).json(msg);
            }

            return res.status(200).json(data);
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
            return `(${job.pickupId}, ${job.deliveryId}, '${job.jobDate}')`;
        });
        const insertQuery = `INSERT INTO job(pickupId, deliveryId, jobDate) VALUES${values.join(',')} ON CONFLICT DO NOTHING`;
        console.log('job insertQuery', insertQuery);

        pool.query(insertQuery, (err, jobData) => {
            if (err) {
                const msg = JSON.stringify(err);
                res.status(500).json(err);
            }
            return res.status(200).json(jobData);
        });
    });


    /**
     * Returns the optimal schedule for the given driver and day.
     * Returned as a list of ordered nodes.
     *
     */
    app.post('/api/schedule', function (req, res, next) {
        const body = req.body;
        console.log('/api/schedule');

        const jobDate = body.jobDate;
        const startPortId = body.startPortId || 1;
        const numVehicles = body.numVehicles || 2;
        const vehicleCapacity = body.vehicleCapacity || 2;
        console.log('jobDate', jobDate);
        if (!jobDate) {
            return res.status(400).send('jobDate must be provided');
        }

        const query = `SELECT * FROM job WHERE jobDate='${jobDate}'`;
        pool.query(query, (err, jobData) => {
            if (err) {
                console.log(err)
                const msg = JSON.stringify(err);
                return res.status(500).json(msg);
            }

            const jobs = jobData.rows; // {pickupId, deliveryId, jobDate}
            // console.log('calculating schedule for ' + JSON.stringify(jobs));
            if (!jobs) {
                // No tasks required.
                return res.status(200).json(routable.createArrayList(numVehicles), []);
            }

            let ids = new Set();
            jobs.map((job) => {
                ids.add(job.pickupid);
                ids.add(job.deliveryid);
            });
            ids = Array.from(ids);
            // console.log('ids', ids);

            // Retrieve the ports used in the current jobs.
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
                        return loc.id === job.pickupid;
                    });
                    // pickups.push(pid);
                    const did = rows.findIndex((loc) => {
                        return loc.id === job.deliveryid;
                    });
                    // deliveries.push(did);
                });

                const costMatrix = routable.getCostMatrix(ports, routable.getDistance);

                const n = ports.length;
                const startNode = rows.findIndex((loc) => {
                    return loc.id === startPortId;
                });

                const solverOpts = {
                    numNodes: n,
                    costs: costMatrix,
                    durations: costMatrix,
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

                // console.log('solver', solverOpts);
                // console.log('search', searchOpts);
                try {
                    routable.solveVRP(solverOpts, searchOpts, (err, solution) => {
                        if (err) {
                            const errorMessage = JSON.stringify(err);
                            res.status(400).send(errorMessage);
                            return;
                        }
                        solution.ports = rows;
                        solution.pickups = pickups;
                        solution.deliveries = deliveries;
                        solution.jobDate = jobDate;
                        console.log('solution', solution);
                        return res.status(200).json(solution);
                    });
                } catch (e) {
                    const errorMessage = `Invalid Schedule Request Format: ${JSON.stringify(e)}`;
                    console.error('error', errorMessage);
                    return res.status(400).send(errorMessage);
                }
            });

        });
    });

    server.listen(PORT, () => {
        console.log('Express server listening on localhost port: ' + PORT);
    });
}());
