#!/bin/bash

state_num="44"
state_name="ri"
filename="cb_2019_${state_num}_bg_500k"
mkdir build

curl -o build/${filename}.zip "https://www2.census.gov/geo/tiger/GENZ2019/shp/${filename}.zip"
unzip -od build build/${filename}.zip ${filename}.shp ${filename}.dbf
chmod a-x build/${filename}.*

filter_str='(!/000$/.test(d.properties.GEOID))'

geo2topo -q 1e5 -n blocks=<( \
    shp2json -n build/$filename.shp \
      | ndjson-filter "$filter_str" \
      | ndjson-map '(d.id = d.properties.GEOID, d.properties = {}, d)' \
      | ndjson-join 'd.id' 'd.GEOID' - <(csv2json -n src/assets/RI_CBG_Town.csv) \
      | ndjson-map '(d[0].properties = {name: d[1].NAME}, d[0])') \
  | topomerge towns=blocks -k 'd.properties.name' \
  > src/assets/geojson/${state_name}.json

rm -rf build
