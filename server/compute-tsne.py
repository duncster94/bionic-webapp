import io
import json
import requests
import pandas as pd
from pathlib import Path
import typer
from sklearn.neighbors import NearestNeighbors
from openTSNE import TSNE
# from umap import UMAP
import sys
from time import time
import pickle

app = typer.Typer()

@app.command("tsne")
def compute_tsne(feature_path: Path, delimiter: str = ","):

    if feature_path.stem == "yeast_BIONIC_features":
        with Path("features/yeast-BIONIC-data.json").open("r") as f:
            res = json.load(f)
            sys.stdout.write(json.dumps(res))
            sys.stdout.flush()
            return

    features = pd.read_csv(feature_path, index_col=0, sep=delimiter)
    mapper = pickle.load(open("features/yeast_orf2name.pickle", "rb"))
    features.index = [mapper[name][0] if name in mapper else name for name in features.index]
    # umap = UMAP(metric="cosine", min_dist=0.1, n_neighbors=200)
    # xy = umap.fit_transform(features.values)
    tsne = TSNE(metric="cosine")
    xy = tsne.fit(features.values)
    xy *= 1.5
    xy_ = []
    for row in xy:
        xy_.append([float(val) for val in row])
    xy = xy_

    neigh = NearestNeighbors(n_neighbors=min(50, len(xy)), metric="cosine")
    neigh.fit(features.values)
    nn = neigh.kneighbors(features.values, return_distance=False)
    nn_ = {}
    for name, idx in zip(features.index, nn):
        val = {neigh_name: neigh_idx for neigh_idx, neigh_name in enumerate(features.index[idx])}
        nn_[name] = val
    nn = nn_

    names = list(features.index)  # `names` MUST be gene symbols
    # json.dump({"xy": xy, "names": names, "neighbors": nn}, open("features/yeast-BIONIC-data.json", "w"))
    sys.stdout.write(json.dumps({"xy": xy, "names": names, "neighbors": nn}))
    sys.stdout.flush()

if __name__ == "__main__":
    app()
