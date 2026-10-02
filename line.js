/**
 * charts/line.js
 * Line Chart: Wholesale Electricity Spot Prices (1998–2024)
 */
(function () {
  const container = document.getElementById("line-chart");
  const tooltip = d3.select("#tooltip");

  function initLineChart(dataset) {
    if (!dataset || dataset.length === 0) {
      console.warn("Line chart: received empty dataset.");
      return;
    }

    // Filter valid positive records and sort chronologically
    const data = dataset
      .filter((d) => !isNaN(d.year) && !isNaN(d.avgPrice) && d.avgPrice > 0)
      .sort((a, b) => a.year - b.year);

    function render() {
      container.innerHTML = "";

      const width = container.clientWidth || 500;
      const height = container.clientHeight || 380;
      const margin = { top: 25, right: 30, bottom: 50, left: 65 };

      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      // SVG Definitions for Area Gradient
      const defs = svg.append("defs");
      const gradient = defs
        .append("linearGradient")
        .attr("id", "line-area-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#0284c7")
        .attr("stop-opacity", 0.35);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#0284c7")
        .attr("stop-opacity", 0.0);

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // X Scale (Year)
      const xScale = d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => d.year))
        .range([0, innerWidth]);

      // Y Scale (Spot Price $/MWh)
      const maxPrice = d3.max(data, (d) => d.avgPrice) || 150;
      const yScale = d3
        .scaleLinear()
        .domain([0, maxPrice * 1.15])
        .range([innerHeight, 0])
        .nice();

      // Horizontal background grid lines
      g.append("g")
        .attr("class", "grid")
        .call(
          d3
            .axisLeft(yScale)
            .tickSize(-innerWidth)
            .tickFormat("")
        );

      // X Axis
      g.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(
          d3
            .axisBottom(xScale)
            .ticks(Math.max(5, Math.floor(innerWidth / 70)))
            .tickFormat(d3.format("d"))
        );

      // Y Axis
      g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(yScale).ticks(6));

      // X Axis Label
      g.append("text")
        .attr("class", "axis-label")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .text("Year");

      // Y Axis Label
      g.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .text("Average Spot Price ($/MWh)");

      // Area under line
      const areaGenerator = d3
        .area()
        .x((d) => xScale(d.year))
        .y0(innerHeight)
        .y1((d) => yScale(d.avgPrice))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(data)
        .attr("fill", "url(#line-area-gradient)")
        .attr("d", areaGenerator);

      // Line Path Generator
      const lineGenerator = d3
        .line()
        .x((d) => xScale(d.year))
        .y((d) => yScale(d.avgPrice))
        .curve(d3.curveMonotoneX);

      // Render Line
      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#0284c7")
        .attr("stroke-width", 2.5)
        .attr("d", lineGenerator);

      // Data Point Dots
      g.selectAll("circle.dot")
        .data(data)
        .join("circle")
        .attr("class", "dot")
        .attr("cx", (d) => xScale(d.year))
        .attr("cy", (d) => yScale(d.avgPrice))
        .attr("r", 4)
        .attr("fill", "#0284c7")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer")
        .on("mouseenter", function (event, d) {
          d3.select(this)
            .attr("r", 6.5)
            .attr("fill", "#0369a1");

          let breakdown = "";
          if (d.nsw != null) breakdown += `NSW: $${d.nsw} | `;
          if (d.vic != null) breakdown += `VIC: $${d.vic} | `;
          if (d.qld != null) breakdown += `QLD: $${d.qld} | `;
          if (d.sa != null) breakdown += `SA: $${d.sa}`;

          tooltip.style("opacity", 1).html(`
            <strong>Year: ${d.year}</strong><br/>
            Average Spot Price: <b>$${d.avgPrice.toFixed(2)} / MWh</b><br/>
            <span style="font-size: 11px; color: #94a3b8;">${breakdown}</span>
          `);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", `${event.pageX + 12}px`)
            .style("top", `${event.pageY - 12}px`);
        })
        .on("mouseleave", function () {
          d3.select(this)
            .attr("r", 4)
            .attr("fill", "#0284c7");
          tooltip.style("opacity", 0);
        });
    }

    render();

    // Re-render when window or container resizes
    const observer = new ResizeObserver(() => render());
    observer.observe(container);
  }

  // Hook into data loader
  if (window.appData && window.appData.ready) {
    window.appData.ready.then((data) => {
      if (data && data.spotPrices) {
        initLineChart(data.spotPrices);
      }
    });
  } else {
    window.addEventListener("dataLoaded", (e) => {
      if (e.detail && e.detail.spotPrices) {
        initLineChart(e.detail.spotPrices);
      }
    });
  }
})();
