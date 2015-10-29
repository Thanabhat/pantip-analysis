var request = require('request');
var async = require('async');
var MongoClient = require('mongodb').MongoClient;

var TIME_BETWEEN_REQUEST = 2000; //ms
var MONGODB_URL = 'mongodb://localhost:27017/pantip-analysis';

function MongoClientBatchSave(collection, items, callback) {
    MongoClient.connect(MONGODB_URL, function(err, db) {
        if(err) {
            console.log('error in mongodb connect');
            console.log(err);
            callback();
        }
        db.collection(collection, function(err, collection) {
            if(err) {
                console.log('error in mongodb collection');
                console.log(err);
                callback();
            }
            async.each(
                items,
                function(item, callback2) {
                    collection.save(item, {
                        w: 1
                    }, function(err, result) {
                        if(err) {
                            console.log('error in save');
                            callback2(err);
                        }
                        callback2();
                    });
                },
                function(err) {
                    if(err) {
                        console.log('error in async saved');
                        console.log(err);
                        callback();
                    }
                    console.log('saved to database');
                    if(callback) {
                        callback();
                    }
                }
            );
        });
    });
}

function MongoClientSave(collection, item, callback) {
    MongoClient.connect(MONGODB_URL, function(err, db) {
        if(err) {
            console.log('error in mongodb connect');
            console.log(err);
            callback();
        }
        db.collection(collection, function(err, collection) {
            if(err) {
                console.log('error in mongodb collection');
                console.log(err);
                callback();
            }
            collection.save(item, {
                w: 1
            }, function(err, result) {
                if(err) {
                    console.log('error in save');
                    callback2(err);
                }
                console.log('saved to database');
                if(callback) {
                    callback();
                }
            });
        });
    });
}

function crawTopicByRoom(room, pageCount) {
    var currentPage = 0;
    var lastIdCurrentPage = 0;
    async.whilst(
        function() {
            currentPage++;
            return currentPage <= pageCount;
        },
        function(callback) {
            var payload = {
                'last_id_current_page': lastIdCurrentPage,
                'dataSend[room]': room || 'undefined',
                'dataSend[topic_type][type]': 0,
                'dataSend[topic_type][default_type]': 1,
                'thumbnailview': false,
                'current_page': currentPage
            };
            var options = {
                url: 'http://pantip.com/forum/topic/ajax_json_all_topic_info_loadmore',
                method: 'post',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                form: payload
            };
            console.log('crawTopicByRoom: room=' + room + ', page=' + currentPage);
            request(options, function(error, response, json) {
                var data = null;
                if(error) {
                    console.log('error in response');
                    console.log(error);
                    callback();
                    return;
                }
                if(json) {
                    data = JSON.parse(json);
                    console.log('request success');
                } else {
                    console.log('error in json data');
                    callback();
                    return;
                }
                lastIdCurrentPage = data.item.topic[data.item.topic.length - 1]._id;
                MongoClientBatchSave('topic_list', data.item.topic, function() {
                    setTimeout(callback, TIME_BETWEEN_REQUEST);
                });
            });
        },
        function(err) {
            if(err) {
                console.log('error in async request');
                console.log(err);
            }
        }
    );
}

function crawCommentByTopic(tid) {
    var currentPage = 1;
    var max_comments = 100;
    var dataToSave = {};
    async.doWhilst(
        function(callback) {
            var qs = {
                tid: tid,
                param: 'page' + currentPage
            };
            var options = {
                url: 'http://pantip.com/forum/topic/render_comments',
                method: 'get',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                qs: qs
            };
            console.log('crawCommentByTopic: tid=' + qs.tid + ', param=' + qs.param);
            request(options, function(error, response, json) {
                var data = null;
                if(error) {
                    console.log('error in response');
                    console.log(error);
                    callback();
                    return;
                }
                if(json) {
                    data = JSON.parse(json);
                    console.log('request success');
                } else {
                    console.log('error in json data');
                    callback();
                    return;
                }
                max_comments = data.paging.max_comments;
                if(currentPage === 1) {
                    dataToSave = data;
                    dataToSave._id = tid;
                } else {
                    dataToSave.comments = dataToSave.comments.concat(data.comments);
                }
                setTimeout(callback, TIME_BETWEEN_REQUEST);
            });
        },
        function() {
            currentPage++;
            return currentPage <= Math.ceil(max_comments / 100.0);
        },
        function(err) {
            if(err) {
                console.log('error in async request');
                console.log(err);
            }
            MongoClientSave('topic_comment', dataToSave, null);
        }
    );
}

// crawTopicByRoom('supachalasai', 100);
// crawTopicByRoom(undefined, 10);
crawCommentByTopic(34359693);
// crawCommentByTopic(34379026);
