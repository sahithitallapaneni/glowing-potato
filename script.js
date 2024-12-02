// Load the dataset (ensure the CSV is in the same directory or link to URL)
d3.csv("Alternative Fuel Vehicles US.csv").then(function(data) {

    // Convert data types as needed
    data.forEach(d => {
        d['Alternative Fuel Economy City'] = +d['Alternative Fuel Economy City'];
        d['Alternative Fuel Economy Highway'] = +d['Alternative Fuel Economy Highway'];
        d['All-Electric Range'] = +d['All-Electric Range'];
        d['PHEV Total Range'] = +d['PHEV Total Range'];
    });

    // Bar Chart for Fuel Economy Comparison (City vs Highway)
    const margin = {top: 20, right: 30, bottom: 40, left: 40};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#fuel-comparison-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x0 = d3.scaleBand()
        .domain(data.map(d => d['Manufacturer']))
        .rangeRound([0, width])
        .padding(0.1);

    const x1 = d3.scaleBand()
        .domain(['City', 'Highway'])
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d['Alternative Fuel Economy City'], d['Alternative Fuel Economy Highway']))])
        .nice()
        .rangeRound([height, 0]);

    svg.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", d => "translate(" + x0(d['Manufacturer']) + ",0)")
      .selectAll("rect")
        .data(d => [{category: 'City', value: d['Alternative Fuel Economy City']}, {category: 'Highway', value: d['Alternative Fuel Economy Highway']}])
        .enter().append("rect")
        .attr("x", d => x1(d.category))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("class", "bar");

    svg.append("g")
        .selectAll(".axis")
        .data([y])
        .enter().append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0));

    // Scatter Plot for All-Electric Range vs Hybrid Range
    const scatterSvg = d3.select("#electric-vs-hybrid")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d['All-Electric Range'])])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d['PHEV Total Range'])])
        .range([height, 0]);

    scatterSvg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d['All-Electric Range']))
        .attr("cy", d => yScale(d['PHEV Total Range']))
        .attr("r", 5)
        .attr("fill", "steelblue");

    scatterSvg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    scatterSvg.append("g")
        .call(d3.axisLeft(yScale));

    // Pie Chart for Vehicle Categories Distribution
    const categoryCounts = d3.nest()
        .key(d => d['Category'])
        .rollup(v => v.length)
        .entries(data);

    const pie = d3.pie()
        .value(d => d.value);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(width, height) / 2);

    const pieSvg = d3.select("#vehicle-category-pie")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    pieSvg.selectAll("path")
        .data(pie(categoryCounts))
        .enter().append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.key));

    pieSvg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2 + 20) + ")");
});
