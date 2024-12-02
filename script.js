d3.csv("IEA Global EV Data 2024.csv").then(function(data) {
    // Process data
    data.forEach(function(d) {
        d.value = +d.value; // Convert 'value' to number
    });

    // Group data by region
    const regionSales = d3.nest()
        .key(d => d.region)
        .rollup(function(leaves) {
            return d3.sum(leaves, d => d.value); // Sum sales per region
        })
        .entries(data);

    // Set up chart dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    const x = d3.scaleBand()
        .domain(regionSales.map(d => d.key))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(regionSales, d => d.value)])
        .nice()
        .range([height, 0]);

    // Add X and Y axes
    svg.append("g")
        .selectAll(".bar")
        .data(regionSales)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value));

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    // Label the axes
    svg.selectAll(".x-axis text")
        .style("font-size", "12px")
        .style("text-anchor", "middle");

    svg.selectAll(".y-axis text")
        .style("font-size", "12px");
});
