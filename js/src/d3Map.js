function d3Map(){
  var WIDTH = 800, HEIGHT = 400;
  var wantedGender = 'M';
  var SCALE = 0.8;
  var width = WIDTH,
    height = HEIGHT;
  var config = {"color2":"#1a9641","color1":"#5e3c99","colorStates":"fff9db","stateDataColumn":"state","valueDataColumn":"count", "lat":"lat", "lng":"lng"};
  //copying row name from the array
  var MAP_STATE = config.stateDataColumn;
  //A hashmap created over here
  var numberOfMales = d3.map();
  var numberOfFemales = d3.map();
  var city_map = d3.map();

  var projection = d3.geo.albersUsa()
  var path = d3.geo.path()
	 .projection(projection);
  
  var svg = d3.select("#canvas-svg").append("svg")
    .attr("width", width)
    .attr("height", height);

  var deathData = []
  d3.csv("/data/SlateGunDeaths.csv", function(err, data) {
  	
  	var j =0;
    for(key in data){
     	deathData.push([data[key].lat,data[key].lng, data[key].gender, data[key].state, data[key].city]);
     }

     for(var key = 0;key<deathData.length;key++){
     	var oldValue = city_map.get(deathData[key][4]);

      if(oldValue==undefined){
        if(deathData[key][2] == 'M')
          var newValue = [deathData[key][0],deathData[key][1],1,0];
        else
          var newValue = [deathData[key][0],deathData[key][1],0,1];
      }
      else{
        if(deathData[key][2] == 'M')
          var newValue = [oldValue[0],oldValue[1],1+oldValue[2],oldValue[3]];
        else
          var newValue = [oldValue[0],oldValue[1],oldValue[2],1+oldValue[3]];
      }
      city_map.set(deathData[key][4], newValue); 
   }
   var keysOfCityMap = city_map.keys();
   var arrData = [];
   var iJ = 0;
   for(var key = 0;key<keysOfCityMap.length;key=key+2){
    console.log("Lat:"+city_map.get(keysOfCityMap[key])[0]+"Lng: "+city_map.get(keysOfCityMap[key])[1]);
    var projectedLat = projection([city_map.get(keysOfCityMap[key])[1],city_map.get(keysOfCityMap[key])[0]])[0];
    var projectedLng = projection([city_map.get(keysOfCityMap[key])[1],city_map.get(keysOfCityMap[key])[0]])[1];
    if(!isNaN(projectedLat) && !isNaN(projectedLng)){
      arrData[iJ++]=[projectedLat,projectedLng,'M',city_map.get(keysOfCityMap[key])[2]];
      arrData[iJ++]=[projectedLat,projectedLng,'F',city_map.get(keysOfCityMap[key])[3]];
    }
 }

  d3.tsv("data/us-state-names.tsv", function(error, names) {
    name_id_map = {};
    id_name_map = {};
    stateCodes ={};

    for (var i = 0; i < names.length; i++) {
      name_id_map[names[i].code] = names[i].id; //{"AL":1}
      id_name_map[names[i].id] = names[i].name; //{"1":"ALASKA"}
      stateCodes[names[i].id] = names[i].code; // {"1": "AL"}
    }
    //Data used over here
    var j =0;
    //"d" bellow is a row
    data.forEach(function(d) {
      var id = name_id_map[d[MAP_STATE]]; //gives state idnumber
      if(d["gender"]== 'M'){
      var oldValue = numberOfMales.get(""+id);
      if(oldValue==undefined){
        var newValue = 1;
      }
      else{
        var newValue = 1+oldValue;
      }
      numberOfMales.set(id, newValue); 
    }
  	else{
  		var oldValue = numberOfFemales.get(""+id);
      if(oldValue==undefined){
        var newValue = 1;
      }
      else{
        var newValue = 1+oldValue;
      }
      numberOfFemales.set(id, newValue);
  	}  
  });


  dataset = data.map(function(d) { return [ d["lat"], d["lng"], d["state"], d["gender"] ]; });

  d3.json("/data/us.json", function(error, us) {

  var g = svg.append("g");
  var stateCodesData =topojson.feature(us, us.objects.states).features;

  g.append("g")
  	.attr("class", "states-choropleth")
		.selectAll("path")
  	.data(topojson.feature(us, us.objects.states).features)
		.enter().append("path")
  	.attr("transform", "scale(" + SCALE + ")")
  	.attr("d", path)
  	//on mouse move
    .on("mousemove", function(d) {
        var html = "";

        html += "<div class=\"tooltip_kv\">";
        html += "<span class=\"tooltip_key\">";
        html += id_name_map[d.id];
        html += "</span>";
        html += "<span class=\"tooltip_value\">";
        
        var totalDeaths = (numberOfMales.get(d.id) ? numberOfMales.get(d.id) : 0) + (numberOfFemales.get(d.id) ? numberOfFemales.get(d.id) : 0);
        
        html += "Total: "+totalDeaths+"";
        html += "";

        html += "</span><hr>";
        html +="<b><p><span style='color:"+config.color1+";'>";
        html += "Male: </span><span class='tooltip_value' style='color:"+config.color1+";'>"+(numberOfMales.get(d.id) ? numberOfMales.get(d.id) : 0)+"</span></p>";
        html +="<p><span style='color:"+config.color2+";'>";
        html += "Female: </span><span class='tooltip_value' style='color:"+config.color2+";'>"+(numberOfFemales.get(d.id) ? numberOfFemales.get(d.id) : 0)+"</span></p></b>";
        html += "</div>";
        
        $("#tooltip-container").html(html);
        
        $(this).attr("fill-opacity", "0.5");

        $("#tooltip-container").show();

  	        var coordinates = d3.mouse(this);
  	        
  	        var map_width = $('.states-choropleth')[0].getBoundingClientRect().width;
  	        
  	        if (d3.event.layerX < map_width / 2) {
  	          d3.select("#tooltip-container")
  	            .style("top", (d3.event.layerY + 15) + "px")
  	            .style("left", (d3.event.layerX + 15) + "px");
  	        } else {
  	          var tooltip_width = $("#tooltip-container").width();
  	          d3.select("#tooltip-container")
  	            .style("top", (d3.event.layerY + 15) + "px")
  	            .style("left", (d3.event.layerX - tooltip_width - 30) + "px");
  	        }
  	    })
  	    .on("mouseout", function() {
  	           $(this).attr("fill-opacity", "1.0");
  	            $("#tooltip-container").hide();
  	        });

  g.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("transform", "scale(" + SCALE + ")")
      .attr("d", path);
  
  g.append("g")
  .attr("class", "states-names")
  .selectAll("text")
  .data(stateCodesData)
  .enter()
  .append("svg:text")
  .text(function(d){
    return stateCodes[d.id];
  })
  .attr("x", function(d){
      return path.centroid(d)[0];
  })
  .attr("y", function(d){
      return  path.centroid(d)[1];
  })
  .attr("text-anchor","middle")
  .attr("transform", "scale(" + SCALE + ")")
  .attr('fill', 'black');

  svg.append("g")
      .attr("class", "deathLocations")
  		.selectAll("circle")
   		.data(arrData)
   		.enter()
   		.append("circle")
   		.attr("cx", function(d,i) {
             return d[0];})
      .attr("cy", function(d) {
             return d[1];})
   .attr("transform", "scale(" + SCALE + ")")

   .attr("r", function(d){ return ((Math.sqrt(d[3])*3)+1);})

   .style("fill", function(j){ if(j[2]=='F') { return config.color2;} else return config.color1;})

   .attr("class",function(j){ if(j[2]=='F') return "femaleClass"; else return "maleClass";});

    svg.selectAll("circle")
    .transition()
      .duration(2000)
          .attr('fill-opacity', 0.6)
          .style("stroke", "black") ;
          

  });

  });

  });

  $('input:radio[name="gender"]').change(
  function(){
      if ($(this).is(':checked') && $(this).val() == 'M') {
          $(".headerClass").css({color: "yellow"});
          $(".maleClass").show();
          $(".femaleClass").hide();
      }
      else if ($(this).is(':checked') && $(this).val() == 'B') {
          $(".maleClass").show();
          $(".femaleClass").show();
      }
      else{
      	 $(".maleClass").hide();
      	 $(".femaleClass").show();
      }
  });

}


