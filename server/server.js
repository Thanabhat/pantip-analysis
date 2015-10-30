var express = require('express');
var app = express();
var path = require('path');

app.get('/getTagsData', function(req, res) {
    res.sendFile(path.resolve(__dirname + '/../output/tags_output.json'));
});

app.use(express.static('web'));
app.listen('8082');
