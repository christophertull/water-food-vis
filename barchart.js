

var margin = {top: 20, right: 40, bottom: 10, left: 100},
    width = 700,
    height = 400 - margin.top - margin.bottom;

var format = d3.format(".1"),
    foods,
    type;

var transitionDuration = 750;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.ordinal()
    .rangeRoundBands([0, height], .1);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("top")
    // .tickSize(-height - margin.bottom)
    .tickFormat(format);

var chartDiv = ".wpd3-41-0"
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    // .style("margin-left", -margin.left + "px")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
    .attr("class", "x axis");

svg.append("g")
    .attr("class", "y axis")
  .append("line")
    .attr("class", "domain")
    .attr("y2", height);

var menu = d3.select("#menu select")
    .on("change", change);


data_csv = "http://visiblysustainable.com/visualizations/water-food-vis/water_data.csv";

d3.csv("data/water_data.csv" ,function(data,error) {
  if(error)
    console.log(error);

  foods = data;
  console.log("FOODS: ",foods);

  volumes = ["Green","Blue","Grey","Total","Calorie (liter/kcal)",
              "Protein (liter/g protein)","Fat (liter/g fat)"];
  menuLabels = ["Total Mass (liter/kg)","Calorie (liter/kcal)","Protein (liter/g protein)","Fat (liter/g fat)"];


  menu.selectAll("option")
      .data(menuLabels)
    .enter().append("option")
      .text(function(d) {console.log(d); return d; });

    console.log("MENU: ",menu);
    // console.log("MENU: ",menu);
    
  menu.property("value", "Total Mass (liter/kg)");

  redraw(true);
});







// var altKey;

// d3.select(window)
//     .on("keydown", function() { altKey = d3.event.altKey; })
//     .on("keyup", function() { altKey = false; });








function change() {
  // clearTimeout(timeout);

  d3.transition()
      // .duration(altKey ? 7500 : 750)
      .duration(transitionDuration)
      .each(function(){
        redraw(false);
      });
  // console.log()
}







function redraw(sort) {
  //the current value to be displayed
  var newType = menu.property("value");

  if(sort){
    foods.sort(function(a,b){
      return b[newType] - a[newType];
    });
  }

  //map the food items to the y axis
  y.domain(foods.map(function(d) { return d.Item; }));

  var bar = svg.selectAll(".bar")
      .data(foods, function(d) { return d.Item; });

  var barEnter = bar.enter().insert("g", ".axis")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(0," + (y(d.Item) + height) + ")"; });

  //add the bars
  barEnter
      .append("rect")
        .attr("width", type && function(d) { return x(d[type]); })
        .attr("height", y.rangeBand());
  
  // svg.selectAll(".bar")
  //     .append("rect")
  //       .attr("width", type && function(d) { 
  //         return x(d[type]*(d["Green"]/d["Total Mass (liter/kg)"])); 
  //       })
  //       .attr("height", y.rangeBand())
  //       .attr("class","greenbar");

  //add text to the bars
  barEnter.append("text")
      .attr("class", "label")
      .attr("x", -3)
      .attr("y", y.rangeBand() / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .each(function(d){
        if(d[newType] <= 0){
          d3.select(this)
          .attr("fill","gray");
        }
      })
      .text(function(d) { return d.Item; });


  barEnter.append("text")
      .attr("class", "value")
      .each(function(d){
        if(x(parseFloat(d[newType]))-margin.left < 20 ){
          d3.select(this)
            .attr("x", type && function(d) { return x(d[type]) + 3; })
            .attr("fill","black")
            .attr("text-anchor", "start");
        }
        else{
          d3.select(this)
          .attr("x", type && function(d) { return x(d[type]) - 3; })
          .attr("fill","white")
          .attr("text-anchor", "end");
        }
      })
      .attr("y", y.rangeBand() / 2)
      .attr("dy", ".35em");

  type = newType;

  //update the xdomain to the new max
  console.log("Xdomain: ", d3.max(foods,function(d){return parseFloat(d[type]);}) );
  x.domain([0, d3.max(foods,function(d){return parseFloat(d[type]);}) ]);



  //transition the new bars into place
  var barUpdate = d3.transition(bar)
      .attr("transform", function(d) { return "translate(0," + (d.y0 = y(d.Item)) + ")"; })
      .style("fill-opacity", 1);



  //adjust width
  barUpdate.select("rect")
      .attr("width", function(d) { return x(d[type]); });

  barUpdate.select(".label")
      .each(function(d){
        if(d[newType] <= 0){
          d3.select(this)
          .attr("fill","grey");
        }
        else{
          d3.select(this)
          .attr("fill","black");
        }
      });

  barUpdate.select(".value")
      .each(function(d){
        if(x(parseFloat(d[newType])) < 20 ){
          d3.select(this)
            .transition(transitionDuration)
            .attr("x", type && function(d) { return x(d[type]) + 2; })
            .attr("fill","black")
            .attr("text-anchor", "start");
        }
        else{
          d3.select(this)
          .transition(transitionDuration)
          .attr("x", type && function(d) { return x(d[type]) - 3; })
          .attr("fill","white")
          .attr("text-anchor", "end");
        }

        if(d[newType] <= 0 ){
          d3.select(this)
            .text(function(d) { return "NA"; });
        }
        else{
          d3.select(this)
            .text(function(d) { return format(d[type]); });
        }
      });

  // //get rid of old bars
  // var barExit = d3.transition(bar.exit())
  //     .attr("transform", function(d) { return "translate(0," + (d.y0 + height) + ")"; })
  //     .style("fill-opacity", 0)
  //     .remove();

  // barExit.select("rect")
  //     .attr("width", function(d) { return x(d[type]); });

  // barExit.select(".value")
  //     .attr("x", function(d) { return x(d[type]) - 3; })
  //     .text(function(d) { return format(d[type]); });

  d3.transition(svg).select(".x.axis")
      .call(xAxis);

  console.log(d3.transition(svg));
  console.log(d3.transition(svg).select(".x.axis"));
}






// var timeout = setTimeout(function() {
//   menu.property("value", "Total Mass (liter/kg)").node().focus();
//   change();
// }, 5000);