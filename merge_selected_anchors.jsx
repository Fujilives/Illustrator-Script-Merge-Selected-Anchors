// Merge the Overlapped Anchors

// Merges nearly overlapped anchor points, also reports how many anchor points had been reduced.
// USAGE: Select the anchors and run this script.

// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Original Copyright(c) 2005-2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// Updated by GitHub Copilot GPT-4o and Fujilives
// 2025-03-30
// Refined to process only selected anchors instead of the entire path

// 2005-09-16
// 2009-05-23 some refinements


// Setting ===========================

// merge the anchors when the distance between 2 points is
// within this value (in point)
var minDist = 0.05;

// report how many anchors had been reduced for
// this number of paths in the selection. (counting from foreground)
var repo_max = 10;

// ===================================
minDist *= minDist;

var result = {};
result.before = 0;
result.after = 0;

var paths = [];
getPathItemsInSelection(2, paths);

if (paths.length > 0) {
    var p, len;
    var msgs = [];

    for (var j = paths.length - 1; j >= 0; j--) {
        p = paths[j].pathPoints;

        readjustAnchors(p, minDist, result);

        if (j < repo_max) {
            if (result.after == 0) {
                msgs.unshift("removed\n");

            } else if (result.after < result.before) {
                msgs.unshift(result.before + " => " + result.after + "\n");

            } else {
                msgs.unshift(" -\n");
            }
            msgs.unshift("PathItem # " + (j + 1) + " : ");
        }
    }

    if (paths.length > repo_max) {
        msgs.push("\n(a log for first " + repo_max + " paths)");
    }

    alert("# the number of anchors\n      before => after\n------------------------\n" + msgs.join(""));
}

// ------------------------------------------------
function readjustAnchors(p, minDist, result) {
    result.before = p.length;
    var i;

    // Filter selected points
    var selectedPoints = [];
    for (i = 0; i < p.length; i++) {
        if (p[i].selected == PathPointSelection.ANCHORPOINT) {
            selectedPoints.push(p[i]);
        }
    }

    // Process only selected points
    if (selectedPoints.length > 1) {
        for (i = selectedPoints.length - 1; i >= 1; i--) {
            for (var j = 0; j < i; j++) {
                if (dist2(selectedPoints[i].anchor, selectedPoints[j].anchor) < minDist) {
                    selectedPoints[j].rightDirection = selectedPoints[i].rightDirection;
                    selectedPoints[i].remove();
                    selectedPoints.splice(i, 1);
                    break;
                }
            }
        }
    }

    if (p.length < 2) {
        p.parent.remove();
        result.after = 0;
    } else {
        result.after = p.length;
    }
}

// ------------------------------------------------
// return the squared distance between p1=[x,y] and p2=[x,y]
function dist2(p1, p2) {
    return Math.pow(p1[0] - p2[0], 2)
        + Math.pow(p1[1] - p2[1], 2);
}

// ------------------------------------------------
// extract PathItems from the selection which length of PathPoints
// is greater than "n"
function getPathItemsInSelection(n, paths) {
    if (documents.length < 1) return;

    var s = activeDocument.selection;

    if (!(s instanceof Array) || s.length < 1) return;

    extractPaths(s, n, paths);
}

// --------------------------------------
// extract PathItems from "s" (Array of PageItems -- ex. selection),
// and put them into an Array "paths".  If "pp_length_limit" is specified,
// this function extracts PathItems which PathPoints length is greater
// than this number.
function extractPaths(s, pp_length_limit, paths) {
    for (var i = 0; i < s.length; i++) {
        if (s[i].typename == "PathItem") {
            if (pp_length_limit
                && s[i].pathPoints.length <= pp_length_limit) {
                continue;
            }
            paths.push(s[i]);

        } else if (s[i].typename == "GroupItem") {
            // search for PathItems in GroupItem, recursively
            extractPaths(s[i].pageItems, pp_length_limit, paths);

        } else if (s[i].typename == "CompoundPathItem") {
            // searches for pathitems in CompoundPathItem, recursively
            // ( ### Grouped PathItems in CompoundPathItem are ignored ### )
            extractPaths(s[i].pathItems, pp_length_limit, paths);
        }
    }
}