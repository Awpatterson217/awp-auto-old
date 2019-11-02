'use strict';

/**
 * @author Adam Patterson <awpatterson217@gmail.com>
 */

const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

/**
 * Represents a file.
 * @constructor
 */
function File(path) {
    this.path = path;
    /**
     * Reads data from file.
     * 
     * @function
     * @returns {Promise} 
     */
    this.read = function() {
        return readFile(this.path);
    }
    /**
     * writes data to file.
     * 
     * @function
     * @returns {Promise} 
     */
    this.write = function({ path, data }) {
        let finalPath = path
            ? path
            : this.path;

        return writeFile(finalPath, data);
    }
}

module.exports = File;