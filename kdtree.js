// kdtree.js
// Points should be specified as k-dimensional arrays.

// Given an array of points, return a kd-tree.
this.kd_create = function(points) {
    if (points.length == 0)
        return;

    // Assume all points have same number of dimensions
    var k = points[0].length;
    var rect = {};
    var root = _create(k, points, rect, 0);
    return {
        root: root,
        rect: rect,
        k: k
    };
};

// Given a kd-tree and a point, return the nearest point
// in the tree.
this.kd_nearest = function(tree, target) {
    // First estimate is root
    var dist_sq = 0;
    for (var i = 0; i < tree.k; i++) {
        dist_sq += Math.pow(tree.root.location[i] - target[i], 2);
    }

    var best = {
        node: tree.root,
        dist_sq: dist_sq
    };

    // This gets munged by _nearest, so make a copy
    var rect = {
        min: tree.rect.min.slice(0),
        max: tree.rect.max.slice(0)
    };

    _nearest(tree.k, tree.root, target, best, rect);
    return best.node.location;
};

this.kd_print = function(tree) {
    return "kdtree(k=" + tree.k + ", rect=[" + _print_point(tree.rect.min) + "," + _print_point(tree.rect.max) + "]:\n"
      + _print(tree.root, 1);
}

function _create(k, points, rect, depth) {
    if (points.length == 0)
        return;

    // The kd-tree cycles through axes as we go deeper
    var axis = depth % k;

    points = points.sort(function(a,b) { return a[axis] - b[axis] });
    var median = Math.floor(points.length / 2);
    var location = points[median];

    if (!rect.min || !rect.max) {
        // Make copies
        rect.min = location.slice(0);
        rect.max = location.slice(0);
    }
    else {
        // Extend rect
        for (var i = 0; i < k; i++) {
            if (location[i] < rect.min[i]) {
                rect.min[i] = location[i];
            }
            if (location[i] > rect.max[i]) {
                rect.max[i] = location[i];
            }
        }
    }

    var node = {
        axis: axis,
        location: location,
        left: _create(k, points.slice(0, median), rect, depth + 1),
        right: _create(k, points.slice(median + 1), rect, depth + 1)
    };

    return node;
}

function _nearest(k, node, target, best, rect) {
    var axis = node.axis;
    var node_near, node_far;
    var rect_near, rect_far;

    // Determine which direction to recurse in
    var cmp = target[axis] - node.location[axis];
    if (cmp <= 0) {
        node_near = node.left;
        node_far = node.right;
        rect_near = rect.max;
        rect_far = rect.min;
    }
    else {
        node_near = node.right;
        node_far = node.left;
        rect_near = rect.min;
        rect_far = rect.max;
    }

    if (node_near) {
        // Temporarily shrink the rect to match the nearer subtree
        var temp = rect_near[axis];
        rect_near[axis] = node.location[axis];
        _nearest(k, node_near, target, best, rect);
        rect_near[axis] = temp;
    }

    // Check if we have a better estimate
    var dist_sq = 0;
    for (var i = 0; i < k; i++) {
        dist_sq += Math.pow(node.location[i] - target[i], 2);
    }
    if (dist_sq < best.dist_sq) {
        best.node = node;
        best.dist_sq = dist_sq;
    }

    if (node_far) {
        // Temporarily shrink the rect to match the further subtree
        var temp = rect_far[axis];
        rect_far[axis] = node.location[axis];

        // If further subtree rect is outside a circle around our
        // target point of radius best.dist_sq, it won't yield a
        // nearer point, so skip
        var rect_dist_sq = 0;
        for (var i = 0; i < k; i++) {
            if (node.location[i] < rect.min[i])
                rect_dist_sq += Math.pow(rect.min[i] - node.location[i], 2);
            else if (node.location[i] > rect.max[i]) {
                rect_dist_sq += Math.pow(rect.max[i] - node.location[i], 2);
            }
        }

        if (rect_dist_sq < best.dist_sq) {
            _nearest(k, node_far, target, best, rect);
        }
    }
}

// Debug

function _print(node, indent) {
    var is = "";
    var str = [];
    for (var i = 0; i < indent; i++) {
        is += "  ";
    }
    str.push(is + _print_point(node.location) + " [" + node.axis + "]\n");
    if (node.left) {
        str.push(is + "Left:\n");
        str.push(_print(node.left, indent + 1));
    }
    if (node.right) {
        str.push(is + "Right:\n");
        str.push(_print(node.right, indent + 1));
    }
    return str.join('');
}

function _print_point(point) {
    if (!point) {
        return "(undef)";
    }
    return "(" + point.join(', ') + ")";
}
