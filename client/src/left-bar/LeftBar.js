import {
  Grid,
  IconButton as IconButtonMui,
  Paper,
  Icon,
  Typography,
  SvgIcon,
  Divider,
  Tooltip,
  LinearProgress,
  Link,
  Stack,
} from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import * as d3 from "d3";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";

const LeftBar = ({ props }) => {
  const { selectedNeighbors, rightBarType, enrichment, setEnrichment } = props;

  const [geneText, setGeneText] = React.useState(null);
  const [textDialogOpen, setTextDialogOpen] = React.useState(false);
  const [isTextLoading, setIsTextLoading] = React.useState(false);
  const textButtonDisabled =
    textDialogOpen ||
    isTextLoading ||
    rightBarType !== "neighbor" ||
    Object.keys(selectedNeighbors).length === 0;

  const [enrichmentDialogOpen, setEnrichmentDialogOpen] = React.useState(false);
  const [isEnrichmentLoading, setIsEnrichmentLoading] = React.useState(false);
  const enrichmentButtonDisabled =
    enrichmentDialogOpen ||
    isEnrichmentLoading ||
    rightBarType !== "neighbor" ||
    Object.keys(selectedNeighbors).length === 0;

  const handleTextDescriptionClick = async () => {
    setTextDialogOpen(true);
    setIsTextLoading(true);

    const selectedName = Object.keys(selectedNeighbors)[0];

    const hostName = process.env.HOSTNAME || "http://localhost:4000";
    
    const cacheResponse = await fetch(
      `${hostName}/geneinfo/${selectedName}`
    ).then((response) => response.json());

    if (cacheResponse.text) {
      setGeneText(cacheResponse.text);
      setIsTextLoading(false);
      return;
    }

    const mapperResponse = await fetch(
      `https://www.uniprot.org/uploadlists/?from=GENENAME&to=ACC&format=tab&taxon=559292&query=${selectedName}`
    ).then((response) => response.text());
    if (mapperResponse.split("\t").length < 3) {
      setGeneText("No description available.");
      setIsTextLoading(false);
      return;
    }
    const uniprotName = mapperResponse.split("\t")[2];

    const response = await fetch(
      `https://www.uniprot.org/uniprot/${uniprotName}.xml`
    );
    const textResponse = await response.text();
    const xmlParser = new DOMParser();
    const xmlResponse = xmlParser.parseFromString(
      textResponse,
      "application/xml"
    );
    try {
      const text = xmlResponse.querySelector("comment[type=function]")
        .children[0].textContent;
      setGeneText(text);
    } catch {
      setGeneText("No description available.");
    }
    setIsTextLoading(false);
  };

  const handleEnrichmentClick = async () => {
    setEnrichmentDialogOpen(true);
    setIsEnrichmentLoading(true);

    const neighbors = Object.keys(selectedNeighbors);

    const formData = new FormData();
    formData.append("list", neighbors.join("\n"));
    const addListResponse = await fetch(
      "https://maayanlab.cloud/YeastEnrichr/addList",
      {
        method: "POST",
        body: formData,
      }
    ).then((response) => response.json());
    const enrichResponse = await fetch(
      "https://maayanlab.cloud/YeastEnrichr/enrich?" +
        new URLSearchParams({
          userListId: addListResponse.userListId,
          backgroundType: "GO_Biological_Process_2018",
        })
    ).then((response) => response.json());

    setEnrichment(enrichResponse[Object.keys(enrichResponse)[0]].slice(0, 10));
    setIsEnrichmentLoading(false);
  };

  React.useEffect(() => {
    if (
      rightBarType !== "neighbor" ||
      Object.keys(selectedNeighbors).length === 0
    ) {
      setTextDialogOpen(false);
      setGeneText(null);

      setEnrichmentDialogOpen(false);
      setEnrichment([]);
    } else {
      if (textDialogOpen) handleTextDescriptionClick();
      if (enrichmentDialogOpen) handleEnrichmentClick();
    }
  }, [selectedNeighbors]);

  return (
    <>
      <DataOverlay
        props={{
          name: Object.keys(selectedNeighbors)[0],
          geneText,
          textDialogOpen,
          setTextDialogOpen,
          isTextLoading,
          enrichment,
          enrichmentDialogOpen,
          setEnrichmentDialogOpen,
          isEnrichmentLoading,
        }}
      />
      <Paper elevation={6} style={{ padding: "8px", height: "100%" }}>
        <Stack direction="column" style={{ height: "100%" }}>
          <IconButton
            props={{
              ariaLabel: "gene info",
              icon: <ArticleOutlinedIcon />,
              handleClick: handleTextDescriptionClick,
              disabled: textButtonDisabled,
              tip: "Gene info",
            }}
          />
          <IconButton
            props={{
              ariaLabel: "gene enrichment",
              icon: <InsertChartOutlinedIcon />,
              handleClick: handleEnrichmentClick,
              disabled: enrichmentButtonDisabled,
              tip: "Enrichment",
            }}
          />
          <div style={{ marginTop: "auto" }}>
            <IconButton
              props={{
                ariaLabel: "BIONIC GitHub",
                icon: <GitHubIcon />,
                // handleClick: handleEnrichmentClick,
                disabled: false,
                tip: "GitHub",
                href: "https://github.com/bowang-lab/BIONIC",
              }}
            />
          </div>
        </Stack>
      </Paper>
    </>
  );
};

const DataOverlay = ({ props }) => {
  return (
    <Grid
      container
      style={{
        position: "absolute",
        left: "65px",
        maxWidth: "600px",
        zIndex: 1,
      }}
      direction="column"
      spacing={1}
    >
      <Grid item>
        <GeneTextBox props={{ ...props }} />
      </Grid>
      <Grid item>
        <EnrichmentBox props={{ ...props }} />
      </Grid>
    </Grid>
  );
};

const GeneTextBox = ({ props }) => {
  const { name, geneText, textDialogOpen, setTextDialogOpen, isTextLoading } =
    props;

  return (
    <Paper
      style={{
        padding: "8px",
        // maxHeight: "300px",
        display: textDialogOpen ? "block" : "none",
      }}
      elevation={6}
    >
      <Grid container justifyContent="space-between">
        <Grid item>
          <Typography variant="h5" component="h1">
            Description for {name}
          </Typography>
        </Grid>
        <Grid item>
          <IconButton
            props={{
              ariaLabel: "close gene info",
              icon: <CloseOutlinedIcon />,
              handleClick: () => setTextDialogOpen(false),
              disabled: false,
              size: "small",
            }}
          />
        </Grid>
      </Grid>
      <Divider style={{ paddingTop: "4px" }} />
      {isTextLoading ? (
        <LoadingBar />
      ) : (
        <>
          <Box style={{ maxHeight: "300px", overflowY: "auto" }}>
            <Typography>{geneText}</Typography>
            <Typography style={{ fontSize: "0.75rem", paddingTop: "5px" }}>
              Powered by{" "}
              <Link
                href="https://www.uniprot.org/"
                target="_blank"
                rel="noopener"
              >
                Uniprot
              </Link>
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

const EnrichmentBox = ({ props }) => {
  const {
    enrichment,
    enrichmentDialogOpen,
    setEnrichmentDialogOpen,
    isEnrichmentLoading,
  } = props;
  const svgRef = React.useRef();

  React.useEffect(() => {
    d3.select(svgRef.current).selectChildren().remove();
    const margin = { top: 5, right: 20, bottom: 40, left: 25 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    function wrap() {
      const self = d3.select(this),
        textLength = self.node().getComputedTextLength(),
        text = self.text();
      while (textLength > width - margin.right && text.length > 0) {
        text = text.slice(0, -1);
        self.text(text + "...");
        textLength = self.node().getComputedTextLength();
      }
    }

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // get domain upper limit value
    const domainUpperLimit = enrichment.length > 0 ? enrichment[0][4] : 0;
    const parsedEnrichment = enrichment.filter((d) => d[6] <= 0.05);

    // axes
    const xAxis = d3
      .scaleLinear()
      .domain([0, domainUpperLimit])
      .range([0, width]);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xAxis))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    const yAxis = d3
      .scaleBand()
      .range([0, height])
      .domain(parsedEnrichment.map((d) => d[1]))
      .padding(0.1);

    const handleClick = (event, data) => {
      let term = data;
      if (Array.isArray(data)) {
        term = data[1];
      }
      const splitTerm = term.split(" ");
      const parsedTerm = splitTerm[splitTerm.length - 1]
        .replace("(", "")
        .replace(")", "");
      window.open(
        `https://www.ebi.ac.uk/QuickGO/term/${parsedTerm}`,
        "_blank",
        "noopener"
      );
    };

    svg
      .selectAll("rect")
      .data(parsedEnrichment)
      .join("rect")
      .attr("x", xAxis(0))
      .attr("y", (d) => yAxis(d[1]))
      .attr("width", (d) => xAxis(d[4]))
      .attr("height", yAxis.bandwidth())
      .attr("fill", (_, idx) => d3.interpolateBuPu((1.1 - idx / 10) / 2.5))
      .style("cursor", "pointer")
      .on("click", handleClick);

    const yGroup = svg.append("g").call(d3.axisLeft(yAxis));

    yGroup
      .selectAll("text")
      .attr("transform", "translate(15,0)")
      .style("text-anchor", "start")
      .style("font-size", "0.75rem")
      .style("cursor", "pointer")
      .each(wrap)
      .on("click", handleClick);

    yGroup.selectAll("line").attr("opacity", 0);

    // add x axis label
    svg
      .append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom})`)
      .style("text-anchor", "middle")
      .text("Enrichr Combined Score");

    // add y axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left)
      .attr("x", -height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Enriched Bioprocesses");
  }, [enrichment]);

  return (
    <Paper
      style={{
        padding: "8px",
        display: enrichmentDialogOpen ? "block" : "none",
        maxWidth: "600px",
      }}
      elevation={6}
    >
      {isEnrichmentLoading ? (
        <LoadingBar />
      ) : (
        <>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Typography component="h1" style={{ fontSize: "1.2rem" }}>
                GO bioprocess enrichment for selected neighborhood
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                props={{
                  ariaLabel: "close gene enrichment",
                  icon: <CloseOutlinedIcon />,
                  handleClick: () => setEnrichmentDialogOpen(false),
                  disabled: false,
                  size: "small",
                }}
              />
            </Grid>
          </Grid>

          <svg ref={svgRef} />
          <Typography style={{ fontSize: "0.75rem" }}>
            Powered by{" "}
            <Link
              href="https://maayanlab.cloud/Enrichr/"
              target="_blank"
              rel="noopener"
            >
              Enrichr
            </Link>
          </Typography>
        </>
      )}
    </Paper>
  );
};

const IconButton = ({ props }) => {
  const {
    ariaLabel,
    icon,
    handleClick,
    disabled,
    tip,
    href,
    size = "medium",
  } = props;

  const button = (
    <IconButtonMui
      aria-label={ariaLabel}
      onClick={handleClick}
      disabled={disabled}
      size={size}
      href={href}
      target="_blank"
      rel="noopener"
    >
      {icon}
    </IconButtonMui>
  );

  if (tip === undefined) return button;

  return (
    <Tooltip title={tip} placement="right" enterDelay={400}>
      {button}
    </Tooltip>
  );
};

const LoadingBar = () => (
  <div style={{ width: "100%", marginTop: "10px", marginBottom: "10px" }}>
    <LinearProgress />
  </div>
);

export default LeftBar;
