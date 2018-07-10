  // read data
  d3.csv("/data/Data.csv", function(data) {
    data.forEach(function(d) {
      d.healthStatus = +d.healthStatus;
      d.poverty = +d.poverty;
    });
    DrawScatterPlot(data);
  });

   function DrawScatterPlot(data)
   {

   var tooltip = d3.select('body').append('div')
     .attr('id', 'tooltip');
   var data = data;

   var margin = {
     top: 20,
     right: 20,
     bottom: 40,
     left: 40
   };
   width = 900 - margin.left - margin.right,
     height = 480 - margin.top - margin.bottom;



   var x = d3.scaleLinear()
     .range([0, width])
     .nice();

   var y = d3.scaleLinear()
     .range([height, 0]);

   var xAxis = d3.axisBottom(x).ticks(12),
     yAxis = d3.axisLeft(y).ticks(12 * height / width);

   var brush = d3.brush().extent([
       [0, 0],
       [width, height]
     ]).on("end", brushended),
     idleTimeout,
     idleDelay = 350;

   var svg = d3.select("body").append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
     .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

   var clip = svg.append("defs").append("svg:clipPath")
     .attr("id", "clip")
     .append("svg:rect")
     .attr("width", width)
     .attr("height", height)
     .attr("x", 0)
     .attr("y", 0);

   var xExtent = d3.extent(data, function(d) {
     return d.healthStatus;
   });
   var yExtent = d3.extent(data, function(d) {
     return d.poverty;
   });
   x.domain(d3.extent(data, function(d) {
     return d.healthStatus;
   })).nice();
   y.domain(d3.extent(data, function(d) {
     return d.poverty;
   })).nice();

   var scatter = svg.append("g")
     .attr("id", "scatterplot")
     .attr("clip-path", "url(#clip)");

   scatter.append("g")
     .attr("class", "brush")
     .call(brush);
    
    var dotselement = scatter.selectAll(".dot")
     .data(data)
     .enter()
     .append("g");
   
    dotselement.append("circle")
     .attr("class", "dot")
     .attr("r", 15)
     .attr("cx", function(d) {
       return x(d.healthStatus);
     })
     .attr("cy", function(d) {
       return y(d.poverty);
     })
     .attr("opacity", 0.5)
     .style("fill", "#4292c6")
     .on('mouseover', d => {
       tooltip.transition()
         .duration(100)
         .style('opacity', .9);
         tooltip.html(d.state +"<br/>" + 'Health Status: '+ d.healthStatus + "<br/>"  +
         'Poverty: '+ d.poverty )	
         //tooltip.text('Health Status: '+ d.healthStatus)
         .style('left', `${d3.event.pageX + 2}px`)
         .style('top', `${d3.event.pageY - 18}px`);
     })
     .on('mouseout', () => {
       tooltip.transition()
         .duration(400)
         .style('opacity', 0);
     });

     dotselement.append("text")
     .attr("dx", function(d){return x(d.healthStatus)-8})
     .attr("dy", function(d){return y(d.poverty)+4})
    
     .text(function(d){return d.abbr})

   // x axis
   svg.append("g")
     .attr("class", "x axis")
     .attr('id', "axis--x")
     .attr("transform", "translate(0," + height + ")")
     .call(xAxis);

   svg.append("text")
     .style("text-anchor", "end")
     .attr("x", width/2)
     .attr("y", height + 35)
     .text("In Poverty (%)");

   // y axis
   svg.append("g")
     .attr("class", "y axis")
     .attr('id', "axis--y")
     .call(yAxis);

   svg.append("text")
     .attr("transform", "rotate(-90)")
     
     
     .attr("x", -(width/4 - margin.bottom))
     .attr("y", -38)
     .attr("dy", "1em")
     .style("text-anchor", "end")
     .text("Lacks Healthcare (%)");



   function brushended() {

     var s = d3.event.selection;
     if (!s) {
       if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
       x.domain(d3.extent(data, function(d) {
         return d.healthStatus;
       })).nice();
       y.domain(d3.extent(data, function(d) {
         return d.poverty;
       })).nice();
     } else {

       x.domain([s[0][0], s[1][0]].map(x.invert, x));
       y.domain([s[1][1], s[0][1]].map(y.invert, y));
       scatter.select(".brush").call(brush.move, null);
     }
     zoom();
   }

   function idled() {
     idleTimeout = null;
   }

   function zoom() {

     var t = scatter.transition().duration(750);
     svg.select("#axis--x").transition(t).call(xAxis);
     svg.select("#axis--y").transition(t).call(yAxis);
     scatter.selectAll("circle").transition(t)
       .attr("cx", function(d) {
         return x(d.healthStatus);
       })
       .attr("cy", function(d) {
         return y(d.poverty);
       });
       scatter.selectAll("text").transition(t)
       .attr("dx", function(d) {
         return x(d.healthStatus)-8;
       })
       .attr("dy", function(d) {
         return y(d.poverty)+4;
       });
   }

  }
