import { Slider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

const NeighborSlider = ({ props }) => {
  const { numNeighbors, setNumNeighbors } = props;

  const [displayValue, setDisplayValue] = React.useState(numNeighbors);

  const handleDisplayChange = (event, newValue) => {
    setDisplayValue(newValue);
  };

  const handleCommitChange = (event, newValue) => {
    setNumNeighbors(newValue);
  };

  return (
    <Box
      sx={(theme) => ({
        [theme.breakpoints.up("xs")]: {
          width: "180px",
        },
        [theme.breakpoints.up("md")]: {
          width: "300px",
        },
      })}
    >
      <Typography>Neighborhood size: {displayValue}</Typography>
      <Slider
        aria-label="Number of neighbors"
        value={displayValue}
        onChange={handleDisplayChange}
        onChangeCommitted={handleCommitChange}
        step={5}
        marks
        min={5}
        max={50}
      />
    </Box>
  );
};

export default NeighborSlider;
