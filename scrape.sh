#!/bin/sh

mkdir -p "data"
for page in {0..103}
do
   wget -O "data/$page.html" "http://www.imdb.com/title/tt2543164/reviews?start=$(($page * 10))"
done