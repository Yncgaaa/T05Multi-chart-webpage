/**
 * load-data.js
 * Centralized data loader for all 4 dashboard charts.
 */
(function () {
  window.appData = window.appData || {};

  // File paths
  const filePaths = {
    tvAllSizes: "data/Ex5_TV_energy.csv",
    donutData: "data/Ex5_TV_energy_Allsizes_byScreenType.csv",
    bar55Data: "data/Ex5_TV_energy_55inchtv_byScreenType.csv",
    spotPrices: "data/Ex5_ARE_Spot_Prices.csv"
  };

  // Promise array loading all 4 datasets
  window.appData.ready = Promise.all([
    // 1. TV Energy All Sizes (Scatter plot)
    d3.csv(filePaths.tvAllSizes, (d) => {
      // Handles potential column name variations / casing
      const energy = +(d["energy sonsump"] || d["Energy Consump"] || d["energy_consumpt"] || d["Energy_Consumption"]);
      const star = +(d["star2"] || d["Star2"] || d["star_rating"]);
      const size = +(d["screensize"] || d["screen_size"] || d["Size"] || 0);

      return {
        model: d["Model"] || d["model"] || "Unknown Model",
        screenTech: d["Screen_Technology"] || d["screen_tech"] || d["Type"] || "Unknown",
        screenSize: size,
        star2: star,
        energyConsump: energy
      };
    }),

    // 2. Donut Data
    d3.csv(filePaths.donutData, (d) => {
        return {
            screenTech: d["Screen_Tech"] || d["screen_tech"] || "Unknown",
            meanEnergy: +(d["Mean(Labelled energy consumption (kWh/year))"] || 0)
        };
    }).catch((err) => {
        console.warn("Could not load donut CSV data:", err);
        return [];
    }),

    // 3. 55-inch Data
    d3.csv(filePaths.bar55Data, (d) => {
        return {
            screenTech: d["Screen_Tech"] || d["screen_tech"] || "Unknown",
            meanEnergy: +(d["Mean(Labelled energy consumption (kWh/year))"] || 0)
        };
    }).catch((err) => {
        console.warn("Could not load 55-inch bar chart CSV data:", err);
        return [];
    }),

    // 4. Spot Power Prices Data
    d3.csv(filePaths.spotPrices, (d) => {
        return {
            year: +d["Year"],
            avgPrice: +(d["Average Price (notTas-Snowy)"] || 0),
            qld: d["Queensland ($ per megawatt hour)"] ? +d["Queensland ($ per megawatt hour)"] : null,
            nsw: d["New South Wales ($ per megawatt hour)"] ? +d["New South Wales ($ per megawatt hour)"] : null,
            vic: d["Victoria ($ per megawatt hour)"] ? +d["Victoria ($ per megawatt hour)"] : null,
            sa: d["South Australia ($ per megawatt hour)"] ? +d["South Australia ($ per megawatt hour)"] : null,
            tas: d["Tasmania ($ per megawatt hour)"] ? +d["Tasmania ($ per megawatt hour)"] : null
        };
    }).catch((err) => {
        console.warn("Could not load spot prices CSV data:", err);
        return [];
    }),
  ])
    .then(([tvAllSizes, donutData, bar55Data, spotPrices]) => {
      window.appData.tvAllSizes = tvAllSizes;
      window.appData.donutData = donutData;
      window.appData.bar55Data = bar55Data;
      window.appData.spotPrices = spotPrices;

      // Dispatch event to notify chart scripts
      window.dispatchEvent(new CustomEvent("dataLoaded", { detail: window.appData }));
      return window.appData;
    })
    .catch((error) => {
      console.error("Critical error while loading CSV datasets:", error);
    });
})();
