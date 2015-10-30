var tagsData = null;
var graphData = null;
var tagToIndex = null;
var MAX_TAG = 50;
var MAX_LINK = 20;

$(window).load(function() {
    $.ajax({
        url: "getTagsData"
    }).done(function(data) {
        tagsData = data;
        processData();
        drawGraph();
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
            group: 1
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
            graphData.links.push({
                source: tag1Ind,
                target: tag2Ind,
                value: link.linkCount
            });
        }
    }
}

function drawGraph() {
    var width = 960,
        height = 500

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    var force = d3.layout.force()
        .gravity(.05)
        .distance(100)
        .charge(-100)
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
            return Math.sqrt(d.weight);
        });

    var node = svg.selectAll(".node")
        .data(json.nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag);

    node.append("circle")
        .attr("r", "5");

    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
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
