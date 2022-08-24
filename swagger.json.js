let swaggerDocsFile = require('./tsconfig.json');
const fs = require('fs');
if (fs.existsSync('./swagger-output.json')) {
	swaggerDocsFile = require('./swagger-output.json');
}
module.exports = swaggerDocsFile;
