import React from "react";
import * as d3 from "d3";
import colorMapper from "../utils/colorMapper";

const SIZE = 200;
const MARGIN = 0.1 * SIZE;
const RADIUS = 0.75;
const N_NEIGHBORS = 50;

export default function NetworkCanvas({ props }) {
  const {
    cytoPos,
    cytoEdges,
    names,
    neighbors,
    selectedNeighbors,
    setSelectedNeighbors,
    setRightBarType,
    numNeighbors,
  } = props;
  const containerRef = React.useRef();
  const svgRef = React.useRef();
  const gRef = React.useRef();

  const handleClick = (g) => (event, data) => {
    event.stopPropagation();
    g.selectAll("circle").each(function (otherData) {
      const fill =
        neighbors[data.name].hasOwnProperty(otherData.name) &&
        neighbors[data.name][otherData.name] <= numNeighbors
          ? colorMapper(neighbors[data.name][otherData.name])
          : "#eeeeee";
      d3.select(this).style("fill", fill);
      fill === "#eeeeee" && d3.select(this).style("stroke", "#ddd");
      !(fill === "#eeeeee") && d3.select(this).raise();
    });
    d3.select(this).style("fill", d3.interpolateBuPu(1.0));
    const finalNeighbors = Object.fromEntries(
      Object.entries(neighbors[data.name]).slice(0, numNeighbors)
    );
    setSelectedNeighbors(finalNeighbors);
    setRightBarType("neighbor");
  };

  React.useEffect(() => {
    const divTemplate = d3.select(containerRef.current);
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    const positions = {};
    const nodes = cytoPos.map((d, idx) => {
      const x = d.position.x / 10 + SIZE / 2;
      const y = d.position.y / 10 + SIZE / 2;
      positions[d.data.id] = [x, y];
      return {
        x,
        y,
        id: d.data.id,
        name: d.data.name,
      };
    });

    const edges = cytoEdges.map((d, idx) => ({
      source: d.data.source,
      target: d.data.target,
      weight: d.data.Column_3,
      x1: positions[d.data.source][0],
      x2: positions[d.data.target][0],
      y1: positions[d.data.source][1],
      y2: positions[d.data.target][1],
    }));

    g.selectAll("line")
      .data(edges)
      .join("line")
      .style("stroke", "#333")
      .style("stroke-width", 0.25)
      .style("opacity", 0.35)
      .attr("x1", (d) => d.x1)
      .attr("x2", (d) => d.x2)
      .attr("y1", (d) => d.y1)
      .attr("y2", (d) => d.y2);

    g.selectAll("circle")
      .data(nodes)
      .join("circle")
      .style("fill", "#bbb")
      .style("stroke", "#555")
      .attr("id", (d) => d.name.replace(/\W/g, "_"))
      .attr("r", RADIUS)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .style("stroke-width", 0.25)
      .raise();

    const tooltip = divTemplate
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("border-color", "#999999")
      .style("padding", "5px")
      .style("position", "absolute")
      .style("pointer-events", "none");

    const handleMouseover = function (event, data) {
      d3.select(this)
        .attr("r", RADIUS * 1.4)
        .style("stroke", "#111")
        .style("opacity", 1)
        .raise();
    };
    const handleMousemove = function (event, data) {
      tooltip.style("opacity", 0.93);
      tooltip
        .html(data.name)
        .style("left", `${event.x - 56}px`)
        .style("top", `${event.y - 35}px`);
    };
    const handleMouseleave = function (event, data) {
      tooltip.style("opacity", 0);
      d3.select(this).style("stroke", "#555").attr("r", RADIUS);
    };

    g.selectAll("circle")
      .on("mouseover", handleMouseover)
      .on("mousemove", handleMousemove)
      .on("mouseleave", handleMouseleave)
      .on("click", handleClick(g));

    const handleSvgClick = function (d) {
      g.selectAll("circle").style("fill", "#bbb").style("stroke", "#555");
      setSelectedNeighbors({});
      setRightBarType(null);
    };

    svg.on("click", handleSvgClick);

    function handleZoom(event) {
      // event.stopPropagation();
      g.attr("transform", event.transform);
    }

    const zoom = d3.zoom().on("zoom", handleZoom);

    svg.call(zoom);
  }, []);

  React.useEffect(() => {
    const g = d3.select(gRef.current);
    g.selectAll("circle").on("click", handleClick(g));
    const neighbors_ = Object.keys(selectedNeighbors);
    if (neighbors_.length !== 0) {
      const id = "#" + neighbors_[0].replace(/\W/g, "_");
      d3.select(id).dispatch("click");
    }
  }, [numNeighbors]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <svg
        height="100%"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        ref={svgRef}
        style={{
          position: "absolute",
          width: "100%",
        }}
      >
        <g ref={gRef} />
      </svg>
    </div>
  );
}
