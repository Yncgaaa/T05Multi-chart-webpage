/**
 * charts/bar.js
 * Bar Chart: Mean Energy Consumption for 55-inch Models by Screen Technology
 */
(function () {
  const container = document.getElementById("bar-chart");
  const tooltip = d3.select("#tooltip");

  function initBarChart(dataset) {
    if (!dataset || dataset.length === 0) {
      console.warn("Bar chart: received empty dataset.");
      return;
    }

    // Filter valid positive records and sort by energy consumption
    const data = dataset
      .filter((d) => !isNaN(d.meanEnergy) && d.meanEnergy > 0)
      .sort((a, b) => a.meanEnergy - b.meanEnergy);

    function render() {
      container.innerHTML = "";

      const width = container.clientWidth || 500;
      const height = container.clientHeight || 380;
      const margin = { top: 30, right: 25, bottom: 50, left: 65 };

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

      // X Scale (Screen Technology)
      const xScale = d3
        .scaleBand()
        .domain(data.map((d) => d.screenTech))
        .range([0, innerWidth])
        .padding(0.4);

      // Y Scale (Energy Consumption)
      const maxEnergy = d3.max(data, (d) => d.meanEnergy) || 400;
      const yScale = d3
        .scaleLinear()
        .domain([0, maxEnergy * 1.2]) // Extra 20% room for top value labels
        .range([innerHeight, 0])
        .nice();

      // Consistent Color Scale matching the Donut chart
      const colorScale = d3
        .scaleOrdinal()
        .domain(["LCD", "LED", "OLED"])
        .range(["#3b82f6", "#10b981", "#f59e0b"]);

      // Horizontal background grid lines
      svg
        .append("g")
        .attr("class", "grid")
        .call(
          d3
            .axisLeft(yScale)
            .tickSize(-innerWidth)
            .tickFormat("")
        );

      // X Axis
      svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("font-size", "12px")
        .attr("font-weight", "500");

      // Y Axis
      svg
        .append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(yScale).ticks(5));

      // Y Axis Label
      svg
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .text("Mean Energy Consumption (kWh/yr)");

      // X Axis Label
      svg
        .append("text")
        .attr("class", "axis-label")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .text("Screen Technology (55-Inch Only)");

      // Render Bars
      svg
        .selectAll(".bar")
        .data(data)
        .join("rect")
        .attr("class", "bar")
        .attr("x", (d) => xScale(d.screenTech))
        .attr("y", (d) => yScale(d.meanEnergy))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => innerHeight - yScale(d.meanEnergy))
        .attr("fill", (d) => colorScale(d.screenTech))
        .attr("rx", 5) // Rounded top corners
        .style("cursor", "pointer")
        .on("mouseenter", function (event, d) {
          d3.select(this).attr("opacity", 0.85);

          tooltip.style("opacity", 1).html(`
            <strong>${d.screenTech} (55")</strong><br/>
            Mean Energy: <b>${d.meanEnergy.toFixed(1)} kWh/yr</b>
          `);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", `${event.pageX + 12}px`)
            .style("top", `${event.pageY - 12}px`);
        })
        .on("mouseleave", function () {
          d3.select(this).attr("opacity", 1);
          tooltip.style("opacity", 0);
        });

      // Data Value Labels above each bar
      svg
        .selectAll(".bar-label")
        .data(data)
        .join("text")
        .attr("class", "bar-label")
        .attr("x", (d) => xScale(d.screenTech) + xScale.bandwidth() / 2)
        .attr("y", (d) => yScale(d.meanEnergy) - 8)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "600")
        .attr("fill", "#334155")
        .text((d) => `${Math.round(d.meanEnergy)} kWh`);
    }

    render();

    // Responsive window observer
    const observer = new ResizeObserver(() => render());
    observer.observe(container);
  }

  // Hook into data loader
  if (window.appData && window.appData.ready) {
    window.appData.ready.then((data) => {
      if (data && data.bar55Data) {
        initBarChart(data.bar55Data);
      }
    });
  } else {
    window.addEventListener("dataLoaded", (e) => {
      if (e.detail && e.detail.bar55Data) {
        initBarChart(e.detail.bar55Data);
      }
    });
  }
})();
