/**
 * charts/donut.js
 * Donut Chart: Mean Energy Consumption across Screen Technologies
 */
(function () {
  const container = document.getElementById("donut-chart");
  const tooltip = d3.select("#tooltip");

  function initDonutChart(dataset) {
    if (!dataset || dataset.length === 0) {
      console.warn("Donut chart: received empty dataset.");
      return;
    }

    // Filter valid positive records
    const data = dataset.filter((d) => !isNaN(d.meanEnergy) && d.meanEnergy > 0);
    const totalMeanEnergy = d3.sum(data, (d) => d.meanEnergy);

    function render() {
      container.innerHTML = "";

      const width = container.clientWidth || 500;
      const height = container.clientHeight || 380;

      // Reserve space on the right for the legend
      const legendWidth = 110;
      const chartWidth = width - legendWidth;
      const radius = Math.min(chartWidth, height) / 2 - 20;

      if (radius <= 0) return;

      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      // Group translated to center of chart area
      const g = svg
        .append("g")
        .attr("transform", `translate(${chartWidth / 2 + 10}, ${height / 2})`);

      // Color palette
      const colorScale = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.screenTech))
        .range(["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]);

      // D3 Pie layout
      const pie = d3
        .pie()
        .value((d) => d.meanEnergy)
        .sort(null)
        .padAngle(0.03); // Slight spacing between slices

      // Arc generator (55% inner radius creates the donut hole)
      const arc = d3
        .arc()
        .innerRadius(radius * 0.55)
        .outerRadius(radius * 0.90)
        .cornerRadius(4);

      // Expanded arc for hover effect
      const arcHover = d3
        .arc()
        .innerRadius(radius * 0.53)
        .outerRadius(radius * 0.96)
        .cornerRadius(4);

      // Render Donut Slices
      const arcs = g
        .selectAll(".arc")
        .data(pie(data))
        .join("g")
        .attr("class", "arc");

      arcs
        .append("path")
        .attr("d", arc)
        .attr("fill", (d) => colorScale(d.data.screenTech))
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .style("transition", "transform 0.15s ease-out")
        .on("mouseenter", function (event, d) {
          d3.select(this)
            .transition()
            .duration(150)
            .attr("d", arcHover);

          const percent = ((d.data.meanEnergy / totalMeanEnergy) * 100).toFixed(1);
          tooltip.style("opacity", 1).html(`
            <strong>${d.data.screenTech}</strong><br/>
            Mean Energy: <b>${d.data.meanEnergy.toFixed(1)} kWh/yr</b><br/>
            Share: <b>${percent}%</b>
          `);

          // Update center text dynamically on hover
          centerTitle.text(d.data.screenTech);
          centerValue.text(`${Math.round(d.data.meanEnergy)} kWh`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", `${event.pageX + 12}px`)
            .style("top", `${event.pageY - 12}px`);
        })
        .on("mouseleave", function () {
          d3.select(this)
            .transition()
            .duration(150)
            .attr("d", arc);

          tooltip.style("opacity", 0);

          // Reset center text
          centerTitle.text("Screen Tech");
          centerValue.text(`${data.length} Types`);
        });

      // Center Text Summary
      const centerTitle = g
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.2em")
        .attr("font-size", "13px")
        .attr("font-weight", "600")
        .attr("fill", "#64748b")
        .text("Screen Tech");

      const centerValue = g
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1.25em")
        .attr("font-size", "15px")
        .attr("font-weight", "700")
        .attr("fill", "#0f172a")
        .text(`${data.length} Types`);

      // Side Legend
      const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${chartWidth + 15}, ${height / 2 - (data.length * 28) / 2})`);

      data.forEach((d, i) => {
        const legendRow = legend
          .append("g")
          .attr("transform", `translate(0, ${i * 28})`);

        legendRow
          .append("rect")
          .attr("width", 12)
          .attr("height", 12)
          .attr("rx", 3)
          .attr("fill", colorScale(d.screenTech));

        legendRow
          .append("text")
          .attr("x", 20)
          .attr("y", 10)
          .attr("font-size", "12px")
          .attr("fill", "#334155")
          .attr("font-weight", "500")
          .text(d.screenTech);
      });
    }

    render();

    // Re-render when container size changes
    const observer = new ResizeObserver(() => render());
    observer.observe(container);
  }

  // Hook into data loader
  if (window.appData && window.appData.ready) {
    window.appData.ready.then((data) => {
      if (data && data.donutData) {
        initDonutChart(data.donutData);
      }
    });
  } else {
    window.addEventListener("dataLoaded", (e) => {
      if (e.detail && e.detail.donutData) {
        initDonutChart(e.detail.donutData);
      }
    });
  }
})();
