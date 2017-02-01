#!/bin/sh

mkdir -p "imdb_arrival"
for page in {0..76}
do
   wget -O "imdb_arrival/$page.html" "http://www.imdb.com/title/tt2543164/reviews?start=$(($page * 10))"
done