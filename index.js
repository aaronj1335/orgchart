/*global d3*/
var width = window.innerWidth;
var height = window.innerHeight;
var colors = {
  waterfall: 'black',
  engineering: '#d7a31e',
  product: '#209575',
  marketing: '#eb2722',
  finance: '#9c4a9e',
  bizdev: '#f57e2d',
  sales: '#54a6fc',
  design: '#689a2d'
};

var svg = d3.select('body').append('svg')
  .attr('width', width)
  .attr('height', height);

var force = d3.layout.force()
  .gravity(0.05)
  .distance(function(d) {
    return 150 - 40 * d.source.depth;
  })
  .charge(-300)
  .size([width, height]);

var data = (function(data) {
  var current, node, id = 0, nodes = [], links = [];
  var stack = [{parent: {}, node: data}];
  while (stack.length) {
    current = stack.pop();
    nodes.push(node = {
      group: id++,
      name: current.node.name,
      team: current.node.team || current.parent.team || 'waterfall',
      depth: (current.parent.depth == null? -1 : current.parent.depth) + 1
    });
    if (current.parent.group != null) {
      links.push({
        source: current.parent.group,
        target: node.group,
        value: 1
      });
    }
    (current.node.peeps || []).forEach(function(child) {
      stack.push({parent: node, node: child});
    });
  }
  return {nodes: nodes, links: links};
})(window.data);

force
  .nodes(data.nodes)
  .links(data.links)
  .start();

var link = svg.selectAll('.link')
    .data(data.links)
  .enter().append('line')
    .attr('class', 'link')
    .attr('stroke', function(d) {return colors[d.source.team];});

var node = svg.selectAll('.node')
    .data(data.nodes)
  .enter().append('g')
    .attr('class', 'node')
    .call(force.drag);

node.append('circle')
  .attr('r', function(d) { return 60 - d.depth * 10; })
  .attr('fill', 'white')
  .attr('stroke', function(d) { return colors[d.team]; });

node.append('circle')
  .attr('r', function(d) { return 40 - d.depth * 5; })
  .attr('fill', function(d) {
    return colors[d.team];
  });

node.append('text')
  .text(function(d) { return d.name; });

force.on('tick', function() {
  link.attr('x1', function(d) { return d.source.x; })
    .attr('y1', function(d) { return d.source.y; })
    .attr('x2', function(d) { return d.target.x; })
    .attr('y2', function(d) { return d.target.y; });

  node.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
});
