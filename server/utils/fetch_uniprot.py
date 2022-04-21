import json
from pathlib import Path
import pandas as pd
import requests
import xml.etree.ElementTree as ET
from io import StringIO

yeast_ids = pd.read_csv("yeast-uniprot-ids.txt", sep="\t")
mapper = {}
for tup in yeast_ids.itertuples():
    uni, name, orf = tup[1], tup[2], tup[3]

    if pd.isna(uni):
        continue

    if pd.isna(name):
        mapper[uni] = orf
    else:
        mapper[uni] = name

uniprot_ids = list(mapper.keys())

results = {}
for i, id in enumerate(uniprot_ids):
    print(f"{id} {i} / {len(uniprot_ids)}")

    # try:
    response = requests.get(f"https://www.uniprot.org/uniprot/{id}.xml")

    tree = ET.fromstring(response.content)
    entry = tree.find("{http://uniprot.org/uniprot}entry")
    comments = entry.findall("{http://uniprot.org/uniprot}comment")
    for comment in comments:
        if comment.attrib["type"] == "function":
            text = comment.find("{http://uniprot.org/uniprot}text")
            results[mapper[id]] = text.text
    # except:
        # print(f"Failed on {id}")
    
    if i % 50 == 0 and i != 0:
        with Path("uniprot-yeast-descriptions.json").open("w") as f:
            json.dump(results, f)