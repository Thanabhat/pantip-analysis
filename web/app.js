var tagsData = null;
var graphData = null;
var tagToIndex = null;

var MAX_TAG = 100;
var MAX_LINK = 27;
var MIN_LINK_COUNT_TO_SHOW = 5;

$(window).load(function() {
    NProgress.start();
    $.ajax({
        url: "output/tags_output_small.json"
    }).done(function(data) {
        NProgress.inc();
        tagsData = data;
        processData();
        drawGraph();
        NProgress.done();
    });
});

function processData() {
    graphData = {
        nodes: [],
        links: []
    };
    tagToIndex = {};
    for(var i = 0; i < tagsData.length && i < MAX_TAG; i++) {
        graphData.nodes.push({
            name: tagsData[i].tag,
            group: 1,
            size: tagsData[i].count
        });
        tagToIndex[tagsData[i].tag] = i;
    }
    for(var i = 0; i < tagsData.length && i < MAX_TAG; i++) {
        var tag1Ind = tagToIndex[tagsData[i].tag];
        if(typeof tag1Ind === 'undefined') {
            continue;
        }
        for(var j = 0; j < tagsData[i].link.length && j < MAX_LINK; j++) {
            var link = tagsData[i].link[j];
            var tag2Ind = tagToIndex[link.tag];
            if(typeof tag2Ind === 'undefined') {
                continue;
            }
            if(tag1Ind > tag2Ind) {
                continue;
            }
            if(link.linkCount < MIN_LINK_COUNT_TO_SHOW) {
                continue;
            }
            graphData.links.push({
                source: tag1Ind,
                target: tag2Ind,
                weight: link.linkCount
            });
        }
    }
}

function drawGraph() {
    var maxWeight = tagsData[0].link[0].linkCount;

    var width =  document.body.clientWidth || window.innerWidth,
        height =  document.body.clientHeight || window.innerHeight;

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    var force = d3.layout.force()
        .gravity(.04)
        .distance(function(d) {
            var distance = -Math.log(d.weight / maxWeight + 0.0001) - 0.1;
            distance = Math.max(distance, 0.5);
            distance = Math.min(distance, 7);
            distance *= 20;
            return distance;
        })
        .charge(-180)
        .size([width, height]);

    json = graphData;

    force
        .nodes(json.nodes)
        .links(json.links)
        .start();

    var link = svg.selectAll(".link")
        .data(json.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) {
            return Math.pow(d.weight, 1 / 2.2);
        });

    var node = svg.selectAll(".node")
        .data(json.nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag);

    node.append("circle")
        .attr("r", function(d) {
            return Math.pow(d.size, 1 / 2.2);
        });

    node.append("text")
        .attr("dx", "-12px")
        .attr("dy", "5px")
        .text(function(d) {
            return d.name
        });

    force.on("tick", function() {
        link.attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {
                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                return d.target.y;
            });

        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    });
}

/* Longest Path Analysis */

var adjList = {};
var nodeList = [];

function createAdjList() {
    // console.log(graphData);
    var maxWeight = tagsData[0].link[0].linkCount;
    for(var i = 0; i < graphData.nodes.length; i++) {
        adjList[graphData.nodes[i].name] = [];
    }
    for(var i = 0; i < graphData.links.length; i++) {
        var distance = -Math.log(graphData.links[i].weight / maxWeight + 0.0001) + 0.1;
        adjList[graphData.links[i].source.name].push({
            tag: graphData.links[i].target.name,
            distance: distance
        });
        adjList[graphData.links[i].target.name].push({
            tag: graphData.links[i].source.name,
            distance: distance
        });
    }
    // console.log(adjList);
    nodeList = Object.keys(adjList);
    // console.log(nodeList);
}

function findDistanceByHop(tagName) {
    var visited = {};
    var q = [];
    q.push({
        tag: tagName,
        distance: 0
    });
    while(q.length > 0) {
        var tagObj = q.shift();
        var tag = tagObj.tag;
        var distance = tagObj.distance;
        console.log(tag, tagObj.distance);
        visited[tag] = true;
        if(adjList[tag]) {
            for(var i = 0; i < adjList[tag].length; i++) {
                if(!visited[adjList[tag][i].tag]) {
                    q.push({
                        tag: adjList[tag][i].tag,
                        distance: distance + 1
                    });
                }
            }
        }
    }
}

function findDistanceByWeight(tagName) {
    var INFINITY = 10000000;
    var visited = {};
    var distance = {};
    for(var i = 0; i < nodeList.length; i++) {
        distance[nodeList[i]] = INFINITY;
    }
    distance[tagName] = 0;
    var isAvailable = true;
    while(Object.keys(visited).length < nodeList.length) {
        var tag = undefined;
        for(var i = 0; i < nodeList.length; i++) {
            if(!visited[nodeList[i]]) {
                if(!tag || distance[tag] > distance[nodeList[i]]) {
                    tag = nodeList[i];
                }
            }
        }
        if(!tag) {
            break;
        }
        console.log(tag, distance[tag]);
        visited[tag] = true;
        if(adjList[tag]) {
            for(var i = 0; i < adjList[tag].length; i++) {
                if(!visited[adjList[tag][i].tag]) {
                    distance[adjList[tag][i].tag] = distance[tag] + adjList[tag][i].distance;
                }
            }
        }
    }
}

// setTimeout(function() {
//     createAdjList();
//     // findDistanceByHop('วิทยาศาสตร์');
//     findDistanceByWeight('วิทยาศาสตร์');
// }, 1000);
