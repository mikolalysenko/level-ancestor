"use strict"

module.exports = preprocessTreeLevelAncestor

var weakMap = typeof WeakMap === "undefined" ? require("weakmap") : WeakMap
var bits = require("bit-twiddle")

function LadderEntry(ladder, offset) {
  this.ladder = ladder
  this.offset = offset
}

function preprocessTreeLevelAncestor(root) {
  var jumpTable

  function rebuildLevelAncestor() {
    //Unwrap nodes into a temporary array, tracking parents and depths
    var nodes = []
    var parents = []
    var depths = []

    function visit(node, parent, depth) {
      var idx = parents.length
      nodes.push(node)
      parents.push(parent)
      depths.push([depth, idx])
      Object.keys(node).forEach(function(id) {
        var child = node[id]
        if((typeof child === "object") && (child !== null)) {
          visit(child, idx, depth+1)
        }
      })
    }
    visit(root, -1, 0)

    //Sort nodes by depth
    depths.sort(function(a, b) {
      return b[0]-a[0]
    })

    //Compute ladder decomposition by walking up nodes from bottom
    var ladders = new Array(nodes.length)
    var nodeLadders = new Array(nodes.length)
    for(var i=0; i<nodes.length; ++i) {
      var idx = depths[i][1]
      if(ladders[idx]) {
        continue
      }
      //Build ladder for each node
      var path = [idx]
      ladders[idx] = path
      while(true) {
        var x = parents[idx]
        if(x < 0 || ladders[x]) {
          break
        }
        idx = x
        ladders[idx] = path
        path.push(idx)
      }
      //Extend ladder by factor of 2
      var count = path.length
      for(var j=0; j<count; ++j) {
        var x = parents[idx]
        if(x < 0) {
          break
        }
        idx = x
        path.push(idx)
      }
      //Convert to node reference ladders for later use
      var nodeLadder = path.map(function(idx) {
        return nodes[idx]
      })
      for(var j=0; j<count; ++j) {
        nodeLadders[path[j]] = new LadderEntry(nodeLadder, j)
      }
    }

    //Find level ancestor by jumping up ladder
    function jumpLadder(idx, step) {
      if(step === 0) {
        return idx
      }
      if(parents[idx] < 0) {
        return -1
      }
      var ladder = ladders[idx]
      var offset = nodeLadders[idx].offset
      var target = Math.min(ladder.length-1, offset + step)
      return jumpLadder(ladder[target], step - (target-offset))
    }

    //Compute jump table for each node
    if(jumpTable && jumpTable.clear) {
      jumpTable.clear()
    } else {
      jumpTable = new weakMap()
    }
    for(var i=0; i<nodes.length; ++i) {
      var jumps = []
      var idx=i
      for(var j=1,k=0; ; j*=2) {
        idx = jumpLadder(idx, j-k)
        if(idx < 0) {
          break
        }
        k = j
        jumps.push(nodeLadders[idx])
      }
      jumpTable.set(nodes[i], jumps)
    }
  }

  function levelAncestor(node, k) {
    if(k < 0) {
      return null
    }
    if(k === 0) {
      return node
    }
    var jumps = jumpTable.get(node)
    var level = bits.log2(k)
    if(level >= jumps.length) {
      return null
    }
    var ladder = jumps[level]
    var aindex = ladder.offset + k - (1<<level)
    if(aindex >= ladder.ladder.length) {
      return null
    }
    return ladder.ladder[aindex]
  }
  levelAncestor.rebuild = rebuildLevelAncestor

  rebuildLevelAncestor()
  return levelAncestor
}