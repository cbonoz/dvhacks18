/**
 * Created by cbuonocore on 4/13/18.
 */
// Tests for the routable.js library.
const assert = require("assert"); // node.js core testing module.
const routable = require('./routable');
const util = require('util');

function manhattanDistance(lhs, rhs) {
    return Math.abs(lhs[0] - rhs[0]) + Math.abs(lhs[1] - rhs[1]);
}

describe('routable', () => {

    it('is ok', function () {
        assert.ok(true);
    });

    /**
     * Test that we find an expected solution for the port TSP using a sample configuration.
     */
    it('finds multi vehicle routing solution', function (done) {
        const depotNode = 0;
        // Object with solver-specific options:
        //     numNodes Number Number of locations in the problem ("nodes").
        //     costs Array Cost array the solver minimizes in optimization. Can for example be duration, distance but does not have to be. Two-dimensional with costs[from][to] being a Number representing the cost for traversing the arc from from to to.
        //     durations Array Duration array the solver uses for time constraints. Two-dimensional with durations[from][to] being a Number representing the duration for servicing node from plus the time for traversing the arc from from to to.
        //     timeWindows Array Time window array the solver uses for time constraints. Two-dimensional with timeWindows[at] being an Array of two Number representing the start and end time point of the time window when servicing the node at is allowed. The solver starts from time point 0 (you can think of this as the start of the work day) and the time points need to be positive offsets to this time point.
        //     demands Array Demands array the solver uses for vehicle capacity constraints. Two-dimensional with demands[from][to] being a Number representing the demand at node from, for example number of packages to deliver to this location. The to node index is unused and reserved for future changes; set demands[at] to a constant array for now. The depot should have a demand of zero.
        const vrpSolverOpts = {
            numNodes: 3,
            costs: [[0, 10, 10], [10, 0, 10], [10, 10, 0]],
            durations: [[0, 2, 2], [2, 0, 2], [2, 2, 0]],
            timeWindows: [[0, 9], [2, 3], [2, 3]],
            demands: [[0, 0, 0], [1, 1, 1], [1, 1, 1]]
        };
        // Parameters
        // computeTimeLimit Number Time limit in milliseconds for the solver. In general the longer you run the solver the better the solution (if there is any) will be. The solver will never run longer than this time limit but can finish earlier.
        //     numVehicles Number The number of vehicles for servicing nodes.
        //     depotNode Number The depot node index in the range [0, numNodes - 1] where all vehicles start and end at.
        //     timeHorizon Number The last time point the solver uses for time constraints. The solver starts from time point 0 (you can think of this as the start of the work day) and and ends at timeHorizon (you can think of this as the end of the work day).
        // vehicleCapacity Number The maximum capacity for goods each vehicle can carry. Demand at nodes decrease the capacity.
        //     routeLocks Array Route locks array the solver uses for locking (sub-) routes into place, per vehicle. Two-dimensional with routeLocks[vehicle] being an Array with node indices vehicle has to visit in order. Can be empty. Must not contain the depots.
        //     pickups Array with node indices for picking up good. The corresponding delivery node index is in the deliveries Array at the same position (parallel arrays). For a pair of pickup and delivery indices: pickup location comes before the corresponding delivery location and is served by the same vehicle.
        //     deliveries Array with node indices for delivering picked up goods. The corresponding pickup node index is in the pickups Array at the same position (parallel arrays). For a pair of pickup and delivery indices: pickup location comes before the corresponding delivery location and is served by the same vehicle.
        const vrpSearchOpts = {
            computeTimeLimit: 1000,
            numVehicles: 3,
            depotNode: depotNode,
            timeHorizon: 9 * 60 * 60,
            vehicleCapacity: 3,
            routeLocks: [[], [1, 2]],
            pickups: [4, 9],
            deliveries: [12, 8]
        };

        // routable.solveVRP(vrpSolverOpts, vrpSearchOpts, function (err, solution) {
        //     if (err) return console.log(err);
        //     console.log(util.inspect(solution, {showHidden: false, depth: null}));
        //     assert.ok(true);
        //     done()
        // });

        done();
    });

    it('finds single vehicle routing solution', function (done) {
        const locations = [[0, 0], [0, 1], [0, 2], [0, 3],
            [1, 0], [1, 1], [1, 2], [1, 3],
            [2, 0], [2, 1], [2, 2], [2, 3],
            [3, 0], [3, 1], [3, 2], [3, 3]];

        // Starting location (node) for vehicle.
        const depot = 0;

        const costMatrix = routable.getCostMatrix(locations, manhattanDistance);

        const solverOpts = {
            numNodes: locations.length,
            costs: costMatrix
        };

        const searchOpts = {
            computeTimeLimit: 1000,
            depotNode: depot
        };

        routable.solveTSP(solverOpts, searchOpts, (err, solution) => {
            console.log(solution);
            assert.equal(solution.length, locations.length - 1, 'Number of locations in route is number of locations without depot');
            assert.deepEqual(solution, [ 4, 8, 12, 13, 14, 15, 11, 10, 9, 5, 6, 7, 3, 2, 1 ], 'expected solution mismatch');
            done();
        });

    });
});






