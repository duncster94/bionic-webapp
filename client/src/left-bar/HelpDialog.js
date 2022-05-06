import React from "react";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import Image from "next/image";
import {
  DialogContent,
  DialogContentText,
  Divider,
  Link,
  Typography,
} from "@mui/material";
import neighborImage from "../../public/neighbors.png";
import leftBarImage from "../../public/leftbar.png";

const HelpDialog = ({ props }) => {
  const { helpDialogOpen, setHelpDialogOpen } = props;
  return (
    <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)}>
      <DialogTitle>BIONIC Visualizer Help</DialogTitle>
      <DialogContent>
        <DialogContentText style={{ marginBottom: "12px" }}>
          This webapp is an interactive visualization tool which allows users to
          explore{" "}
          <Link
            href="https://figshare.com/articles/dataset/BIONIC_Yeast_Features/16632286"
            target="_blank"
            rel="noopener"
          >
            features
          </Link>{" "}
          produced by intergrating three yeast networks (protein-protein
          interaction, co-expression, and genetic interaction) using{" "}
          <Link
            href="https://github.com/bowang-lab/BIONIC"
            target="_blank"
            rel="noopener"
          >
            BIONIC
          </Link>
          . The features are visualized using a t-distributed stochastic
          neighbor embedding (t-SNE).
        </DialogContentText>
        <DividerWithMargins />
        <Image src={neighborImage} layout="responsive" />
        <DialogContentText>
          Selecting a gene highlights its nearest neighbors in the original
          feature space. The neighborhood size can be changed using the slider
          at the bottom of the screen.
        </DialogContentText>
        <DividerWithMargins />
        <Image src={leftBarImage} layout="responsive" />
        <DialogContentText>
          You can view a curated gene function description for the selected
          gene, and perform a neighborhood GO biological process enrichment
          test, using the buttons on the left bar.
        </DialogContentText>
        <DividerWithMargins />
        <DialogContentText>
          If you have any questions about the visualizer or feature suggestions,
          feel free to open an issue on the{" "}
          <Link
            href="https://github.com/duncster94/bionic-webapp"
            target="_blank"
            rel="noopener"
          >
            bionic-webapp
          </Link>{" "}
          GitHub!
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
};

const DividerWithMargins = () => (
  <Divider style={{ marginTop: "32px", marginBottom: "32px" }} />
);

export default HelpDialog;
