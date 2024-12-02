d3.csv("locations.csv").then(function(data) {
    // Process data
    data.forEach(function(d) {
        d.Latitude = +d.Latitude;
        d.Longitude = +d.Longitude;
        d.State = d.State.trim();
        d.AccessDaysTime = d.AccessDaysTime.trim();
    });

    // Get unique states for the dropdown
    const states = [...new Set(data.map(d => d.State))];
    
    const stateFilter = d3.select("#stateFilter");
    states.forEach(state => {
        stateFilter.append("option").text(state).attr("value", state);
    });

    // Initialize the map
    const map = L.map('map').setView([37.8, -96], 4);  // Center to USA
    
    // Add tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create a function to add markers
    function updateMap(data) {
        // Clear previous markers
        map.eachLayer(function(layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Add new markers
        data.forEach(function(d) {
            L.marker([d.Latitude, d.Longitude])
                .addTo(map)
                .bindPopup(`<strong>${d.StationName}</strong><br>${d.StreetAddress}<br>${d.City}, ${d.State}`);
        });
    }
    
    // Add markers based on all stations initially
    updateMap(data);
    
    // Create bar chart
    function createBarChart(data) {
        const stateCount = d3.nest()
            .key(d => d.State)
            .rollup(v => v.length)
            .entries(data);

        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        
        const svg = d3.select("#bar-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(stateCount.map(d => d.key))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(stateCount, d => d.value)])
            .nice()
            .range([height, 0]);

        svg.selectAll(".bar")
            .data(stateCount)
            .enter().append("rect")
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
    }
    
    createBarChart(data);

    // Create time of access visualization (pie chart or simple bar)
    function createAccessTimeChart(data) {
        const accessCount = d3.nest()
            .key(d => d.AccessDaysTime)
            .rollup(v => v.length)
            .entries(data);

        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        const width = 600 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const svg = d3.select("#time-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(accessCount.map(d => d.key))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(accessCount, d => d.value)])
            .nice()
            .range([height, 0]);

        svg.selectAll(".bar")
            .data(accessCount)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.key))
            .attr("y", d => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.value));

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));
    }
    
    createAccessTimeChart(data);

    // Filter data when a state is selected
    stateFilter.on("change", function() {
        const selectedState = this.value;
        const filteredData = selectedState === "all" ? data : data.filter(d => d.State === selectedState);

        updateMap(filteredData);
        createBarChart(filteredData);
        createAccessTimeChart(filteredData);
    });
});
