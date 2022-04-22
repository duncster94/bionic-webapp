const express = require("express");
const spawn = require("child_process").spawn;
const cors = require("cors");
const app = express();

const yeastUniprotDescriptions = require("./utils/uniprot-yeast-descriptions.json");
const cyto = require("./features/bionic_net_0.5.txt.json");
const tsneResults = require("./features/yeast-BIONIC-data.json");

app.use(cors());

app.get("/tsne", (req, res) => {
  // const ls = spawn("python", [
  //   "compute-tsne.py",
  //   "features/yeast_BIONIC_features.csv",
  // ]);

  // ls.stdout.on("data", (data) => {
  //   data = JSON.parse(data);
  //   res.json(data);
  // });

  // ls.stderr.on("data", (data) => {
  //   console.log(`stderr: ${data}`);
  // });

  // ls.on("close", (code) => {});
  res.json(tsneResults);
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/geneinfo/:gene", (req, res) => {
  const gene = req.params.gene;
  if (yeastUniprotDescriptions.hasOwnProperty(gene))
    res.json({ text: yeastUniprotDescriptions[gene] });
  else res.json({ text: null });
});

app.get("/network", (req, res) => {
  const pos = cyto.elements.nodes;
  const edges = cyto.elements.edges;
  res.json({ cytoPos: pos, cytoEdges: edges });
});

const port = process.env.PORT || 4000;
app.listen(port);
