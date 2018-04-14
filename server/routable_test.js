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

    it('finds single vehicle routing solution', function (done) {
        const locations = [[0, 0], [0, 1], [0, 2], [0, 3],
            [1, 0], [1, 1], [1, 2], [1, 3],
            [2, 0], [2, 1], [2, 2], [2, 3],
            [3, 0], [3, 1], [3, 2], [3, 3]];

        // Starting location (node) for vehicle.
        const startNode = 0;

        const costMatrix = routable.getCostMatrix(locations, manhattanDistance);

        const solverOpts = {
            numNodes: locations.length,
            costs: costMatrix
        };

        const searchOpts = {
            computeTimeLimit: 1000,
            depotNode: startNode
        };

        routable.solveTSP(solverOpts, searchOpts, (err, solution) => {
            console.log(solution);
            assert.equal(solution.length, locations.length - 1, 'Number of locations in route is number of locations without startNode');
            assert.deepEqual(solution, [ 4, 8, 12, 13, 14, 15, 11, 10, 9, 5, 6, 7, 3, 2, 1 ], 'expected solution mismatch');
            done();
        });

    });
});






