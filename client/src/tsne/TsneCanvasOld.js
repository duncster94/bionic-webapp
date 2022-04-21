import React from "react";
import tsnejs from "./tsne";
import * as d3 from "d3";

const SIZE = 200;
const MARGIN = 0.1 * SIZE;
const RADIUS = 2;

export default function TsneCanvas() {
  const containerRef = React.useRef();
  const svgRef = React.useRef();

  React.useEffect(() => {
    const divTemplate = d3.select(containerRef.current);
    const svg = d3.select(svgRef.current);

    const model = new tsnejs.tSNE({
      dim: 2,
      perplexity: 30,
    });

    async function parseData() {
      // load and process data
      const rawData = await d3.csv("./iris-dist.csv");
      const data = rawData.map((obj) =>
        Object.values(obj).map((value) => +value)
      );

      // load names
      const rawNames = await d3.csv("./iris-names.csv");
      const names = rawNames.map((obj) => obj[0]);

      model.initDataDist(data);

      const centerx = d3.scaleLinear().range([MARGIN, SIZE - MARGIN]);
      const centery = d3.scaleLinear().range([MARGIN, SIZE - MARGIN]);

      const simulation = d3
        .forceSimulation(
          data.map((d) => ((d.x = SIZE / 2), (d.y = SIZE / 2), d))
        )
        .alphaDecay(0.005)
        .alpha(0.1)
        .force("tsne", function (alpha) {
          // every time you call this, solution gets better
          model.step();

          // Y is an array of 2-D points that you can plot
          let pos = model.getSolution();

          centerx.domain(d3.extent(pos.map((d) => d[0])));
          centery.domain(d3.extent(pos.map((d) => d[1])));

          data.forEach((d, i) => {
            d.x += alpha * (centerx(pos[i][0]) - d.x);
            d.y += alpha * (centery(pos[i][1]) - d.y);
          });
        })
        .force(
          "collide",
          d3.forceCollide().radius((d) => RADIUS)
        )
        .on("tick", function () {
          let nodes = data.map((d, idx) => {
            return {
              x: d.x,
              y: d.y,
              name: names[idx],
            };
          });

          svg
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", RADIUS)
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y);
        });

      const tooltip = divTemplate
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("border-color", "#666666")
        .style("padding", "5px")
        .style("position", "absolute")
        .style("pointer-events", "none");

      var mouseover = function (d) {
        tooltip.style("opacity", 0.93);
        d3.select(this).style("stroke", "black").style("opacity", 1);
      };
      var mousemove = function (event, data) {
        tooltip
          .html(data.name)
          .style("left", `${event.x}px`)
          .style("top", `${event.y - 35}px`);
      };
      var mouseleave = function (d) {
        tooltip.style("opacity", 0);
        d3.select(this).style("stroke", "none").style("opacity", 0.8);
      };

      svg
        .selectAll("circle")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
    }

    parseData();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} ref={svgRef} />
    </div>
  );
}
