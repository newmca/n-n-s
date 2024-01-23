#!/bin/bash

for x in {2..10}; do echo "count=$x" && for y in {1..10}; do node nns.js -c $x -d $y --debug; done; done