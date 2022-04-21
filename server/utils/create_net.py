import json
import pickle
import pandas as pd
import networkx as nx
from sklearn.metrics.pairwise import cosine_similarity
from umap import UMAP

import typer

app = typer.Typer()

@app.command("main")
def main():
    df = pd.read_csv("../features/yeast_BIONIC_features.csv", index_col=0)
    
    # map ORFs to gene names
    mapper = pickle.load(open("../features/yeast_orf2name.pickle", "rb"))
    df.index = [mapper[orf][0] if orf in mapper else orf for orf in df.index]

    # sim = cosine_similarity(df.values)
    # (sim[sim < 0.5]) = 0

    # net = nx.from_pandas_adjacency(pd.DataFrame(sim, index=df.index, columns=df.index))
    # net.remove_edges_from(nx.selfloop_edges(net))
    # net.remove_nodes_from(list(nx.isolates(net)))
    # print(nx.info(net))

    # nx.write_weighted_edgelist(net, "../features/bionic_net_0.5.txt")

    umap = UMAP()
    xy = umap.fit_transform(df.values)
    xy = [list(row) for row in xy]
    bionic_json = json.load(open("../features/yeast-BIONIC-data.json", "r"))
    bionic_json["xy"] = xy
    json.dump(bionic_json, open("../features/yeast-BIONIC-data.json", "w"))

if __name__ == "__main__":
    app()
