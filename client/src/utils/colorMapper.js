import * as d3 from "d3";

const colorMapper = function (rank) {
  return d3.interpolateBuPu((1.3 - rank / 50) / 1.8);
};

export default colorMapper;
