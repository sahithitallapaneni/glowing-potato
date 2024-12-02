// Load the CSV data
d3.csv("IEA Global EV Data 2024.csv").then(function(data) {

    // Process data: Convert year to number and value to number
    data.forEach(function(d) {
        d.year = +d.year;
        d.value = +d.value;
    });

    // Group data by region and year
    const nestedData = d3.nest()
        .key(d => d.region)
        .key(d => d.year)
        .rollup(function(leaves) {
            return d3.sum(leaves, d => d.value);
        })
        .entries(data);

    // Set up chart dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Append SVG to the body
    const svg = d3.select("#visualization")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    const x = d3.scaleBand()
                .range([0, width])
                .padding(0.1);

    const y = d3.scaleLinear()
                .range([height, 0]);

    // Flatten nested data into a list of bars
    const flattenedData = [];
    nestedData.forEach(function(regionData) {
        regionData.values.forEach(function(yearData) {
            flattenedData.push({
                region: regionData.key,
                year: yearData.key,
                value: yearData.value
            });
        });
    });

    // Set domain for scales based on the data
    x.domain(flattenedData.map(d => d.year));
    y.domain([0, d3.max(flattenedData, d => d.value)]);

    // Add X axis
    svg.append("g")
       .selectAll(".tick")
       .data(flattenedData)
       .enter()
       .append("text")
       .attr("class", "x-axis")
       .attr("transform", function(d) {
           return "translate(" + x(d.year) + ",0)";
       })
       .attr("y", height)
       .attr("dx", "-0.5em")
       .text(d => d.year)
       .style("font-size", "12px");

    // Add Y axis
    svg.append("g")
       .call(d3.axisLeft(y));

    // Create bars for the chart
    svg.selectAll(".bar")
       .data(flattenedData)
       .enter()
       .append("rect")
       .attr("class", "bar")
       .attr("x", d => x(d.year))
       .attr("y", d => y(d.value))
       .attr("width", x.bandwidth())
       .attr("height", d => height - y(d.value))
       .style("fill", d => {
           // Color bars based on region
           if (d.region === 'Europe') return 'blue';
           else if (d.region === 'USA') return 'green';
           return 'gray';
       });

    // Add tooltips on hover
    svg.selectAll(".bar")
       .on("mouseover", function(event, d) {
           d3.select(this).style("fill", "orange");
           d3.select("#tooltip")
             .style("left", event.pageX + "px")
             .style("top", event.pageY - 28 + "px")
             .style("opacity", 1)
             .html(`Year: ${d.year}<br>Region: ${d.region}<br>EV Sales: ${d.value}`);
       })
       .on("mouseout", function() {
           d3.select(this).style("fill", function(d) {
               if (d.region === 'Europe') return 'blue';
               else if (d.region === 'USA') return 'green';
               return 'gray';
           });
           d3.select("#tooltip").style("opacity", 0);
       });

});

// Tooltip div
d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("background-color", "lightgray")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("opacity", 0);
