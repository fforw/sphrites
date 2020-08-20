const shelljs = require("shelljs");
const path = require("path");

shelljs.rm("-rf", path.join(__dirname, "../docs"))

