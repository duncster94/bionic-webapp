import React from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import TsneCanvas from "../src/tsne/TsneCanvas";
import NetworkCanvas from "../src/tsne/NetworkCanvas";
import LeftBar from "../src/left-bar/LeftBar";
import NeighborSlider from "../src/neighbor-slider/NeighborSlider";
import {
  AppBar,
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Autocomplete,
  TextField,
  InputAdornment,
  IconButton,
  useMediaQuery,
  Drawer,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/system";
import * as d3 from "d3";
import colorMapper from "../src/utils/colorMapper";
import Fuse from "fuse.js";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

export default function Home({ pos, names, neighbors }) {
  const [selectedNeighbors, setSelectedNeighbors] = React.useState([]);
  const [rightBarType, setRightBarType] = React.useState(null);
  const [enrichment, setEnrichment] = React.useState([]);
  const [numNeighbors, setNumNeighbors] = React.useState(25);

  const theme = useTheme();

  return (
    <div>
      <Head>
        <title>BIONIC Visualization</title>
        <meta name="description" content="BIONIC feature visualization tool" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
      </Head>

      <main>
        <Grid container spacing={0} justifyContent="flex-end">
          <Grid item>
            <LeftBar
              props={{
                selectedNeighbors,
                rightBarType,
                enrichment,
                setEnrichment,
              }}
            />
          </Grid>
          <Grid item xs>
            <TsneCanvas
              props={{
                pos,
                names,
                neighbors,
                selectedNeighbors,
                setSelectedNeighbors,
                setRightBarType,
                numNeighbors,
              }}
            />
            {/* <NetworkCanvas
              props={{
                cytoPos,
                cytoEdges,
                names,
                neighbors,
                selectedNeighbors,
                setSelectedNeighbors,
                setRightBarType,
                numNeighbors,
              }}
            /> */}
          </Grid>
          <Grid item>
            <RightBar
              props={{
                names,
                neighbors,
                selectedNeighbors,
                setSelectedNeighbors,
                rightBarType,
                setRightBarType,
              }}
            />
          </Grid>
        </Grid>
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: useMediaQuery(theme.breakpoints.down("sm"))
              ? "calc(50% + 28px)"
              : "calc(50% + 28px - 138.5px )",
            transform: "translate(-50%, 0)",
          }}
        >
          <NeighborSlider props={{ numNeighbors, setNumNeighbors }} />
        </div>
      </main>
    </div>
  );
}

const GeneSearch = function ({ props }) {
  const { names, setSelectedNeighbors, rightBarType, setRightBarType } = props;

  const fuse = new Fuse(names, { threshold: 0.1 });

  const [value, setValue] = React.useState("");

  const handleSearch = (value) => {
    setRightBarType("search");
    setValue(value);
    const searchResults = fuse.search(value).map((item) => item.item);
    console.log(searchResults);

    const searchResultsObj = {};
    for (let [idx, node] of searchResults.slice(0, 50).entries()) {
      searchResultsObj[node] = idx;
    }

    setSelectedNeighbors(searchResultsObj);
  };

  const handleClose = () => {
    setValue("");
    if (rightBarType === "search") setSelectedNeighbors({});
  };

  return (
    <Grid item style={{ marginBottom: "10px", paddingRight: "8px" }}>
      <Typography>Gene search</Typography>
      <TextField
        size="small"
        value={value}
        onChange={(event) => handleSearch(event.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end" style={{ marginRight: "-8px" }}>
              <IconButton size="small" onClick={handleClose}>
                <CloseOutlinedIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {
        // TODO: add clear button on search field
      }
    </Grid>
  );
};

const DrawerWrapper = (props) => {
  const { children, open, setOpen } = props;

  const handleOpen = (isOpen) => () => setOpen(isOpen);

  return (
    <Drawer
      open={open}
      onOpen={handleOpen(true)}
      onClose={handleOpen(false)}
      anchor="right"
    >
      {children}
    </Drawer>
  );
};

const RightBarContent = ({ props }) => {
  const {
    names,
    neighbors,
    selectedNeighbors,
    setSelectedNeighbors,
    rightBarType,
    setRightBarType,
  } = props;

  const theme = useTheme();

  let keys = Object.keys(selectedNeighbors);
  keys.sort(function (a, b) {
    return selectedNeighbors[a] - selectedNeighbors[b];
  });

  return (
    <Paper
      elevation={6}
      style={{
        paddingLeft: "8px",
        paddingTop: "8px",
        height: "100%",
        // display: useMediaQuery(theme.breakpoints.down("sm")) ? "none" : "block",
      }}
    >
      <Grid
        container
        spacing={0}
        style={{
          height: "100%",
          minWidth: "220px",
        }}
        direction="column"
      >
        <Grid item>
          <GeneSearch
            props={{
              names,
              setSelectedNeighbors,
              rightBarType,
              setRightBarType,
            }}
          />
        </Grid>
        <SearchOptions
          props={{
            neighbors,
            selectedNeighbors,
            setSelectedNeighbors,
            rightBarType,
          }}
        />
      </Grid>
    </Paper>
  );
};

const RightBar = function ({ props }) {
  const {
    names,
    neighbors,
    selectedNeighbors,
    setSelectedNeighbors,
    rightBarType,
    setRightBarType,
  } = props;

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const theme = useTheme();

  let keys = Object.keys(selectedNeighbors);
  keys.sort(function (a, b) {
    return selectedNeighbors[a] - selectedNeighbors[b];
  });

  return useMediaQuery(theme.breakpoints.down("sm")) ? (
    <>
      <IconButton onClick={() => setDrawerOpen(true)}>
        <Tooltip title="Neighbors and search" placement="left" enterDelay={400}>
          <MenuOpenIcon />
        </Tooltip>
      </IconButton>
      <DrawerWrapper open={drawerOpen} setOpen={setDrawerOpen}>
        <RightBarContent props={{ ...props }} />
      </DrawerWrapper>
    </>
  ) : (
    <RightBarContent props={{ ...props }} />
  );
};

const SearchOptions = function ({ props }) {
  const { neighbors, selectedNeighbors, setSelectedNeighbors, rightBarType } =
    props;

  const names = Object.keys(selectedNeighbors);
  names.sort(function (a, b) {
    return selectedNeighbors[a] - selectedNeighbors[b];
  });

  const topText = rightBarType === "neighbor" ? "Nearest neighbors to" : null;

  return (
    <>
      <Grid item>
        {topText && (
          <>
            <Typography>{topText}</Typography>
            <NeighborChip
              props={{
                name: names[0],
                neighbors,
                setSelectedNeighbors,
                rightBarType,
                rank: 0,
              }}
            />
            {/* <Typography>{names[0]}</Typography> */}
          </>
        )}
        <Divider />
      </Grid>
      <Grid item xs style={{ height: "100%", overflowY: "auto" }}>
        {names.map(
          (name, idx) =>
            (rightBarType !== "neighbor" || idx !== 0) && (
              <NeighborChip
                props={{
                  name,
                  neighbors,
                  setSelectedNeighbors,
                  rightBarType,
                  rank: idx,
                }}
                key={name}
              />
            )
        )}
      </Grid>
    </>
  );
};

const NeighborChip = function ({ props }) {
  const { name, neighbors, setSelectedNeighbors, rightBarType, rank } = props;

  const [textColor, setTextColor] = React.useState("#111");

  const id = "#" + name.replace(/\W/g, "_");

  const handleClick = (name) => () => {
    setSelectedNeighbors(neighbors[name]);

    // dispatches a click event on selected node `name`
    d3.select(id).dispatch("mouseleave");
    d3.select(id).dispatch("click");
  };

  const color = colorMapper(rank);

  const handleMouseEnter = () => {
    setTextColor("#888");
    d3.select(id).dispatch("mouseover");
  };

  const handleMouseLeave = () => {
    setTextColor("#111");
    d3.select(id).dispatch("mouseleave");
  };

  return (
    <div
      key={name}
      style={{ cursor: "pointer" }}
      onClick={handleClick(name)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {rightBarType == "neighbor" && (
        <div
          style={{
            borderRadius: "100%",
            backgroundColor: color,
            height: "10px",
            width: "10px",
            display: "inline-block",
            marginRight: "10px",
          }}
        />
      )}
      <Typography style={{ display: "inline-block", color: textColor }}>
        {name}
      </Typography>
    </div>
  );
};

export async function getServerSideProps(context) {
  let data = await fetch("http://localhost:4000/tsne");
  data = await data.json();
  const { xy, names, neighbors } = data;

  // const cytoData = await fetch("http://localhost:4000/network").then(
  //   (response) => response.json()
  // );
  // const { cytoPos, cytoEdges } = cytoData;

  return {
    props: { pos: xy, names, neighbors },
  };
}
