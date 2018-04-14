/**
 * Created by cbuonocore on 4/14/18.
 * https://github.com/mapbox/node-or-tools/blob/master/API.md#vrp
 */
const assert = require("assert"); // node.js core testing module.
const routable = require('./routable');
const fs = require('fs');
const util = require('util');
const _ = require('lodash');

const content = fs.readFileSync("demo/nodes.json", "utf8");
const locations = JSON.parse(content);

console.log('locations', locations.length);

// Starting location (node) for vehicle.
const startNode = 0;
const numVehicles = 5;
const vehicleCapacity = 5;
const n = locations.length;

const costMatrix = routable.getCostMatrix(locations, routable.getDistance);
const INF = 1000000; // also max time horizon.

const solverOpts = {
    numNodes: n,
    costs: costMatrix,
    durations: costMatrix,
    timeWindows: routable.createArrayList(n, [0, INF]),
    demands: routable.createDemandMatrix(n, startNode)
};

const routeLocks = routable.createArrayList(numVehicles, []);

// Select random subset of pickup/destination indices.
const indexes = _.range(n);
const pickups = indexes.slice(0, n/2);
const deliveries = indexes.slice(n/2);
// console.log('pickups',pickups.length, pickups);
// console.log('deliveries', deliveries.length, deliveries);

const searchOpts = {
    computeTimeLimit: 1000,
    numVehicles: numVehicles,
    depotNode: startNode,
    timeHorizon: INF,
    vehicleCapacity: vehicleCapacity,
    routeLocks: routeLocks,
    pickups: pickups,
    deliveries: deliveries
};

// console.log(solverOpts, searchOpts);
//
routable.solveVRP(solverOpts, searchOpts, (err, solution) => {
    if (err) {
        console.error('error', err);
        return;
    }
    console.log('solution', JSON.stringify(solution));
});
