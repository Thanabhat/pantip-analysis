var request = require('request');
var fs = require('fs');

function craw() {

    var payload = {
        'last_id_current_page': 0,
        'dataSend[room]': 'supachalasai',
        'dataSend[topic_type][type]': 0,
        'dataSend[topic_type][default_type]': 1,
        'thumbnailview': false,
        'current_page': 1
    }

    var options = {
        url: 'http://pantip.com/forum/topic/ajax_json_all_topic_info_loadmore',
        method: 'post',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        form: payload
    }

    request(options, function(error, response, html) {
        var data = null;
        if(!error && html) {
            // console.log(html);
            data = JSON.parse(html);
        } else {
            console.log('error in response');
        }

        fs.writeFile('output.json', JSON.stringify(data), function(err) {
            if(err) {
                return console.log('err');
            }
            console.log('write file success');
        });
    });
}

craw();
