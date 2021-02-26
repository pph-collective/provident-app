#!/bin/bash

state_num="$1"
state_name="$2"
filename="cb_2018_${state_num}_bg_500k"
mkdir build

curl -o build/${filename}.zip "https://www2.census.gov/geo/tiger/GENZ2018/shp/${filename}.zip"
unzip -od build build/${filename}.zip ${filename}.shp ${filename}.dbf
chmod a-x build/${filename}.*

# ny specific logic to only get nyc
filter_str='(!/000$/.test(d.properties.GEOID))'
if [ $state_num == "36" ]; then
    filter_str=$filter_str' && ["005", "085", "061", "047", "081"].includes(d.properties.GEOID.slice(2, 5))'
else
    filer_str=$filter_str"'"
fi;

geo2topo -q 1e5 -n blocks=<( \
    shp2json -n build/$filename.shp \
      | ndjson-filter "$filter_str" \
      | ndjson-map '(d.id = d.properties.GEOID, delete d.properties, d)') \
  | toposimplify -f -s 1e-7 \
  | topomerge counties=blocks -k 'd.id.slice(2, 5)' \
  > src/assets/geojson/${state_name}.json

rm -rf build
