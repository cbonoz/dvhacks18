/**
 * Created by cbuonocore on 4/13/18.
 */
const library = (function () {

    const ortools = require('node_or_tools');

    const getRandom = (items) => {
        return items[Math.floor(Math.random() * items.length)];
    };

    const formatDateTimeMs = (timeMs) => {
        const date = new Date(parseInt(timeMs));
        return `${date.toDateString()} ${date.toLocaleTimeString()}`;
    };

    function capitalize(str) {
        if (str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
        return str;
    }

    function matrix(m, n, fillValue) {
        const result = [];
        for(let i = 0; i < n; i++) {
            result.push(new Array(m).fill(fillValue));
        }
        return result;
    }

    function createTimeWindowMatrix(n) {
        return matrix(n, n, Infinity);
    }

    function createArrayList(n, val) {
        const result = [];
        for (let i = 0; i < n; i++) {
            if (val) {
                result.push(val);
            } else {
                result.push([]);
            }
        }
        return result;
    }

    /**
     * Multi-vehicle node visit optimization
     * @param vrpSolverOpts options for solving port vrp.
     * @param vrpSearchOpts options for searching port vrp solution.
     * @param cb: (err, solution) => { ... }
     */
    function solveVRP(vrpSolverOpts, vrpSearchOpts, cb) {
        const VRP = new ortools.VRP(vrpSolverOpts);
        VRP.Solve(vrpSearchOpts, cb);
    }

    /**
     * Single-vehicle node visit optimization
     * @param tspSolverOpts options for solving port tsp.
     * @param tspSearchOpts options for searching port tsp.
     * @param cb: (err, solution) => { ... }
     */
    function solveTSP(tspSolverOpts, tspSearchOpts, cb) {
        const TSP = new ortools.TSP(tspSolverOpts);
        TSP.Solve(tspSearchOpts, cb);
    }

    function getCostMatrix(locations, costFunction) {
        const costMatrix = new Array(locations.length);
        for (let from = 0; from < locations.length; ++from) {
            costMatrix[from] = new Array(locations.length);
            for (let to = 0; to < locations.length; ++to) {
                costMatrix[from][to] = costFunction(locations[from], locations[to]);
            }
        }
        return costMatrix;
    }

    return {
        capitalize: capitalize,
        matrix: matrix,
        createArrayList: createArrayList,
        createTimeWindowMatrix: createTimeWindowMatrix,
        getRandom: getRandom,
        getCostMatrix: getCostMatrix,
        formatDateTimeMs: formatDateTimeMs,
        solveVRP: solveVRP,
        solveTSP: solveTSP
    };

})();
module.exports = library;

