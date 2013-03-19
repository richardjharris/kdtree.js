kdtree.js
=========

kd-tree implementation in JavaScript

## Usage

### tree = kdtree_create(points)

Takes an array of n-dimensional arrays, returns a tree object.

### nearest_point = kdtree_nearest(tree, point)

Given a tree and a target point, returns the nearest point.

### kd_print(tree)

Returns a pretty-printed string representation of a tree.

## Bugs

* Dumps functions into global namespace.
