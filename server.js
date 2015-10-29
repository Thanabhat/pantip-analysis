var request = require('request');
var async = require('async');
var MongoClient = require('mongodb').MongoClient;

var TIME_BETWEEN_REQUEST = 2000; //ms
var MONGODB_URL = 'mongodb://localhost:27017/pantip-analysis';

function crawTopicByRoom(room, pageCount) {

    var currentPage = 1;
    var lastIdCurrentPage = 0;
    async.whilst(
        function() {
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
            request(options, function(error, response, html) {
                var data = null;
                if(error) {
                    console.log('error in response');
                    callback(error);
                }
                if(html) {
                    data = JSON.parse(html);
                    console.log('request success');
                } else {
                    console.log('error in data');
                    callback();
                }
                currentPage++;
                lastIdCurrentPage = data.item.topic[data.item.topic.length - 1]._id;
                MongoClient.connect(MONGODB_URL, function(err, db) {
                    if(err) {
                        console.log('error in mongodb connect');
                        callback(err);
                    }
                    db.collection('topic', function(err, collection) {
                        if(err) {
                            console.log('error in mongodb collection');
                            callback(err);
                        }
                        async.each(
                            data.item.topic,
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
                                    console.log('error in async request');
                                    console.log(err);
                                    callback(err);
                                }
                                console.log('saved to database');
                                setTimeout(callback, TIME_BETWEEN_REQUEST);
                            }
                        );
                    });
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

crawTopicByRoom('supachalasai', 100);
// crawTopicByRoom(undefined, 3);
