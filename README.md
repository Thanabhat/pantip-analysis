# Pantip Analysis

[Demo on GitHub Page](https://thanabhat.github.io/pantip-analysis/)

An analysis on http://pantip.com/.  This project has created on Windows.

## Prerequisite
- Node.js
- Python 2.7 (required by node-gyp node module)
- Microsoft Visual Studio C++ (required by node-gyp node module)
- MongoDB

## Installation
1. Run 'npm install'
 * If there is a problem on node-gyp moduls, please see more detail at https://github.com/nodejs/node-gyp
2. (Optional) craw new data and insert to database
 1. Create MongoDB on 'mongodb\data'
 2. Run 'start_mongodb.bat'
 3. (Optional) Run 'start_mongo-express.bat' for MongoDB web client
 4. Run 'node server\craw.js' to craw data and insert to database
 5. Run 'node server\process.js' to process the data
3. Run your local web server and open index.html
