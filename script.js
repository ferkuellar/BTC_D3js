// Define the chart container outside the fetchAndUpdate function
const margin = { top: 20, right: 20, bottom: 80, left: 80 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;
const svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function fetchAndUpdate() {
    fetch('http://localhost:3000/btc-price')
        .then(response => response.json())
        .then(data => {
            // Sample data transformation, assuming data is in the required format
            const transformedData = data.slice(-30).map(d => ({
                date: new Date(d[0]),
                open: +d[1],
                close: +d[4],
                high: +d[2],
                low: +d[3]
            }));

            // Clear previous content
            svg.selectAll('*').remove();

            const xScale = d3.scaleBand()
                .domain(transformedData.map(d => d.date))
                .range([0, width])
                .padding(0.1);

            const yScale = d3.scaleLinear()
                .domain([d3.min(transformedData, d => d.low), d3.max(transformedData, d => d.high)])
                .range([height, 0]);

            // Create candles
            const candles = svg.selectAll(".candle").data(transformedData);
            const candleGroup = candles.enter().append("g").attr("class", "candle");

            candleGroup.append("line") // High-low line
                .attr("x1", d => xScale(d.date) + xScale.bandwidth() / 2)
                .attr("x2", d => xScale(d.date) + xScale.bandwidth() / 2)
                .attr("y1", d => yScale(d.high))
                .attr("y2", d => yScale(d.low))
                .attr("stroke", "black");

            candleGroup.append("rect") // Open-close box
                .attr("x", d => xScale(d.date))
                .attr("y", d => yScale(Math.max(d.open, d.close)))
                .attr("width", xScale.bandwidth())
                .attr("height", d => Math.abs(yScale(d.open) - yScale(d.close)))
                .attr("fill", d => d.open > d.close ? "red" : "green");

            // Create axes
            svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m-%d"))) // Cambiar el formato aquí
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");
        

            svg.append("g")
                .attr("class", "y-axis axis")
                .call(d3.axisLeft(yScale));

            // Add tooltip
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            candleGroup.on("mouseover", d => {
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html("Open: $" + d.open + "<br/>Close: $" + d.close)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 10) + "px");
            }).on("mouseout", d => {
                tooltip.transition().duration(500).style("opacity", 0);
            });

            // Add legends
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + margin.bottom - 1)
                .attr("text-anchor", "middle")
                .text("Fecha");

            svg.append("text")
                .attr("x", -(height / 2))
                .attr("y", -margin.left + 20)
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .text("Precio (USD)");

            // Get current BTC price (last close value)
            const currentPrice = transformedData[transformedData.length - 1].close;

            // Add label for current BTC price in the top-right corner
            svg.append("text")
                .attr("x", width + 10)
                .attr("y", 20)
                .attr("text-anchor", "end")
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .text("Precio Actual de BTC: $" + currentPrice.toFixed(2));
        });

    // Call the function again in 10 seconds
    setTimeout(fetchAndUpdate, 10 * 1000);
}

// Call the function once at the beginning
fetchAndUpdate();
