// Load CSV data
d3.csv("IEA Global EV Data 2024.csv").then(function(data) {
    console.log(data); // Check if the data is loaded correctly

    // Convert necessary columns to numbers
    data.forEach(function(d) {
        d.Year = +d.Year;
        d.EV_Sales = +d.EV_Sales; // Assuming "EV_Sales" is the column for sales data
    });

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
                .domain(data.map(d => d.Year))
                .range([0, width])
                .padding(0.1);

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.EV_Sales)])
                .nice()
                .range([height, 0]);

    // Add X axis
    svg.append("g")
       .selectAll(".tick")
       .data(data)
       .enter()
       .append("text")
       .attr("class", "x-axis")
       .attr("transform", function(d) {
           return "translate(" + x(d.Year) + ",0)";
       })
       .attr("y", height)
       .attr("dx", "-0.5em")
       .text(d => d.Year)
       .style("font-size", "12px");

    // Add Y axis
    svg.append("g")
       .call(d3.axisLeft(y));

    // Create bars for the chart
    svg.selectAll(".bar")
       .data(data)
       .enter()
       .append("rect")
       .attr("class", "bar")
       .attr("x", d => x(d.Year))
       .attr("y", d => y(d.EV_Sales))
       .attr("width", x.bandwidth())
       .attr("height", d => height - y(d.EV_Sales))
       .style("fill", "steelblue");

    // Add tooltips on hover
    svg.selectAll(".bar")
       .on("mouseover", function(event, d) {
           d3.select(this).style("fill", "orange");
           d3.select("#tooltip")
             .style("left", event.pageX + "px")
             .style("top", event.pageY - 28 + "px")
             .style("opacity", 1)
             .html(`Year: ${d.Year}<br>EV Sales: ${d.EV_Sales}`);
       })
       .on("mouseout", function() {
           d3.select(this).style("fill", "steelblue");
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
