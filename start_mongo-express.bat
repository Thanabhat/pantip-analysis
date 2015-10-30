copy config\mongo-express.config.js node_modules\mongo-express\config.js
cd node_modules\mongo-express\
start chrome http://localhost:8081/db/pantip-analysis/topic_list
node app.js