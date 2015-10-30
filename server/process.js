var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');

var MONGODB_URL = 'mongodb://localhost:27017/pantip-analysis';

function process() {
    MongoClient.connect(MONGODB_URL, function(err, db) {
        if(err) {
            console.log('error in mongodb connect');
            throw err;
        }
        /* 	resultObj =
			{
				'tag1': {
					count: 1234,
					tagsLink: {
						'tag3': 4,
						'tag12': 6
					}
				},
				'tag2': ...
			}
        */
        var resultObj = {};
        console.log('retrieving data...');
        db.collection('topic_list').find().toArray().then(function(topics) {
            console.log(topics.length + ' topics found');
            for(var i = 0; i < topics.length; i++) {
                var tags = topics[i].tags;
                for(var j = 0; j < tags.length; j++) {
                    var tagObj = resultObj[tags[j].tag];
                    if(!tagObj) {
                        var tagObj = {
                            count: 1,
                            tagsLink: {}
                        };
                        resultObj[tags[j].tag] = tagObj;
                    }
                    tagObj.count++;
                    for(var k = 0; k < tags.length; k++) {
                        if(j === k) {
                            continue;
                        }
                        if(!tagObj.tagsLink[tags[k].tag]) {
                            tagObj.tagsLink[tags[k].tag] = 1;
                        } else {
                            tagObj.tagsLink[tags[k].tag]++;
                        }
                    }
                }
            }
            console.log('retrieving done');
            console.log('processing data...');
            /* 	resultArr = [
					{
						tag: 'tag1',
						count: 1234,
						link: [
							{tag: 'tag12', linkCount: 6},
							{tag: 'tag3', linkCount: 4}
						]
					},
					{
	
					}
            	]
            */
            var resultArr = [];
            for(var tag in resultObj) {
                var newTagObj = {
                    tag: tag,
                    count: resultObj[tag].count,
                    link: []
                };
                for(var linkedTag in resultObj[tag].tagsLink) {
                    newTagObj.link.push({
                        tag: linkedTag,
                        linkCount: resultObj[tag].tagsLink[linkedTag]
                    });
                }
                newTagObj.link.sort(function(a, b) {
                    if(a.linkCount > b.linkCount) {
                        return -1;
                    } else if(a.linkCount < b.linkCount) {
                        return 1;
                    } else {
                        if(a.tag < b.tag) {
                            return -1;
                        } else if(a.tag > b.tag) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                });
                resultArr.push(newTagObj);
            }
            resultArr.sort(function(a, b) {
                if(a.count > b.count) {
                    return -1;
                } else if(a.count < b.count) {
                    return 1;
                } else {
                    if(a.tag < b.tag) {
                        return -1;
                    } else if(a.tag > b.tag) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            });

            console.log('processing done');
            fs.writeFile('output\\tags_output.json', JSON.stringify(resultArr), function(err) {
                if(err) {
                    console.log('can not write file');
                    throw err;
                }
                console.log('file wrote: output\\tags_output.json');
            });
        }).then(function() {
            db.close();
            process.exit();
        });
    });
}

process();
