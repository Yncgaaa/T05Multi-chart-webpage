/**
 * charts/scatter.js
 * Scatter Plot: Energy Consumption vs. Star Rating (star2)
 */
(function () {
  const container = document.getElementById("scatter-chart");
  const tooltip = d3.select("#tooltip");

  function initScatterPlot(dataset) {
    // Filter out rows missing valid numeric coordinates
    const validData = dataset.filter(
      (d) => !isNaN(d.star2) && !isNaN(d.energyConsump) && d.energyConsump > 0
    );

    function render() {
      container.innerHTML = "";

      const width = container.clientWidth;
      const height = container.clientHeight;
      const margin = { top: 20, right: 30, bottom: 55, left: 65 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // X Scale: star2
      const xExtent = d3.extent(validData, (d) => d.star2);
      const xScale = d3
        .scaleLinear()
        .domain([Math.max(0, xExtent[0] - 0.5), (xExtent[1] || 6) + 0.5])
        .range([0, innerWidth])
        .nice();

      // Y Scale: energy sonsump
      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(validData, (d) => d.energyConsump) * 1.1])
        .range([innerHeight, 0])
        .nice();

      // Color Scale: Screen Technology
      const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

      // Background Grid Lines
      svg
        .append("g")
        .attr("class", "grid")
        .call(
          d3.axisLeft(yScale)
            .tickSize(-innerWidth)
            .tickFormat("")
        );

      svg
        .append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(
          d3.axisBottom(xScale)
            .tickSize(-innerHeight)
            .tickFormat("")
        );

      // Axes
      const xAxis = d3.axisBottom(xScale).ticks(Math.max(4, Math.floor(innerWidth / 80)));
      const yAxis = d3.axisLeft(yScale).ticks(6);

      svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis);

      svg
        .append("g")
        .attr("class", "axis")
        .call(yAxis);

      // Axis Labels
      svg
        .append("text")
        .attr("class", "axis-label")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 42)
        .attr("text-anchor", "middle")
        .text("Star Rating (star2)");

      svg
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -48)
        .attr("text-anchor", "middle")
        .text("Energy Consumption (kWh/year)");

      // Scatter Points
      svg
        .selectAll("circle.point")
        .data(validData)
        .join("circle")
        .attr("class", "point")
        .attr("cx", (d) => xScale(d.star2))
        .attr("cy", (d) => yScale(d.energyConsump))
        .attr("r", 5)
        .attr("fill", (d) => colorScale(d.screenTech))
        .attr("opacity", 0.75)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1)
        .on("mouseenter", (event, d) => {
          tooltip
            .style("opacity", 1)
            .html(`
              <strong>${d.model}</strong><br/>
              Technology: ${d.screenTech}<br/>
              Star Rating: ${d.star2}★<br/>
              Energy: ${d.energyConsump} kWh/yr
            `);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", `${event.pageX + 12}px`)
            .style("top", `${event.pageY - 12}px`);
        })
        .on("mouseleave", () => {
          tooltip.style("opacity", 0);
        });
    }

    render();

    // Responsive trigger
    const observer = new ResizeObserver(() => render());
    observer.observe(container);
  }

  // Hook into data loader promise
  if (window.appData && window.appData.ready) {
    window.appData.ready.then((data) => {
      if (data && data.tvAllSizes) {
        initScatterPlot(data.tvAllSizes);
      }
    });
  } else {
    window.addEventListener("dataLoaded", (e) => {
      initScatterPlot(e.detail.tvAllSizes);
    });
  }
})();
