async function draw() {
  // Data
  const dataset = await d3.csv("crime_against_senior.csv");
  const parseDate = d3.timeParse("%Y");

  // Dimensions
  let dimensions = {
    width: 800,
    height: 400,
    margins: 50,
  };

  dimensions.ctrWidth = dimensions.width - dimensions.margins * 2;
  dimensions.ctrHeight = dimensions.height - dimensions.margins * 2;

  // Draw Image
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const ctr = svg
    .append("g")
    .attr("transform", `translate(${dimensions.margins}, ${dimensions.margins})`);

  const tooltip = d3.select("#tooltip");

  const xAxisGroup = ctr.append("g").style("transform", `translateY(${dimensions.ctrHeight}px)`);
  const yAxisGroup = ctr.append("g");

  svg
    .append("text")
    .attr("x", 100)
    .attr("y", dimensions.margins / 2)
    .attr("text-anchor", "middle")
    .attr("dy", "0em")
    .text("Crimes (per 100k)");

  function histogram(metric) {
    const xAccessor = (d) => {
      const date = parseDate(d.year);
      console.log("Parsed date:", date);
      return date;
    };
    const yAccessor = (d) => {
      const value = +d[metric];
      console.log(`Metric (${metric}) value:`, value);
      return value;
    };

    console.log("Dataset:", dataset);

    const xScale = d3
      .scaleTime()
      .domain([parseDate("2010"), parseDate("2023")])
      .range([0, dimensions.ctrWidth])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataset, yAccessor)])
      .range([dimensions.ctrHeight, 0])
      .nice();

    // Clear previous path
    ctr.selectAll("path").remove();

    // Draw Lines
    const lineGenerator = d3
      .line()
      .x((d) => xScale(xAccessor(d)))
      .y((d) => yScale(yAccessor(d)));

    ctr
      .append("path")
      .datum(dataset)
      .attr("d", lineGenerator)
      .attr("fill", "none")
      .attr("stroke", "#30475e")
      .attr("stroke-width", 2);

    // Draw Circles
    ctr
      .selectAll("circle")
      .data(dataset)
      .join("circle")
      .attr("r", 4)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("cx", (d) => xScale(xAccessor(d)))
      .attr("cy", (d) => yScale(yAccessor(d)))
      .on("mouseenter", function (event, datum) {
        tooltip
          .style("display", "block")
          .style("top", event.pageY - 45 + "px")
          .style("left", event.pageX - 25 + "px");

        const formatter = d3.format(".2f");

        tooltip.select(".number").text(formatter(datum[metric]));
      })
      .on("mouseleave", function (event) {
        tooltip.style("display", "none");
      });

    // Draw Axes
    const xAxis = d3.axisBottom(xScale).ticks(d3.timeYear.every(1));

    xAxisGroup.call(xAxis);

    const yAxis = d3.axisLeft(yScale);

    yAxisGroup.call(yAxis);
  }

  d3.select("#metric").on("change", function (e) {
    e.preventDefault();
    histogram(this.value);
  });

  histogram("rape_rate_per_100k");
}

draw();
