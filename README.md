# Pantip Analysis

An analysis on http://pantip.com/.  This project has created on Windows.

## Prerequisite
- Node.js
- Python 2.7 (required by node-gyp node module)
- Microsoft Visual Studio C++ (required by node-gyp node module)
- MongoDB

## Installation
1. run 'npm install'
 * If there is a problem on node-gyp moduls, please see more detail at https://github.com/nodejs/node-gyp
2. Create MongoDB on 'mongodb\data'
3. run 'start_mongodb.bat'
4. (Optional) run 'start_mongo-express.bat' for MongoDB web client
5. (Optional) craw new data and insert to database
 1. run 'node server\craw.js' to craw data and insert to database
 2. run 'node server\process.js' to process the data
6. run 'node server\server.js'
