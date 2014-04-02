"use strict"

var preprocessTree = require("../level-ancestor")
var tape = require("tape")

tape("level-ancestor", function(t) {

  function verifyQuery(tree, ancestor) {
    var nodes = []
    var parents = []

    function visit(node, plist) {
      plist.push(node)
      nodes.push(node)
      parents.push(plist.slice())
      Object.keys(node).forEach(function(id) {
        var child = node[id]
        if(typeof child === "object" && child !== null) {
          visit(child, plist)
        }
      })
      plist.pop()
    }
    visit(tree, [])

    for(var i=0; i<nodes.length; ++i) {
      var p = parents[i]
      for(var j=0; j<p.length; ++j) {
        t.equals(ancestor(nodes[i], j), p[p.length-j-1], "ancestor(" + i + "," + j + ")")
      }
      t.equals(ancestor(nodes[i], p.length), null, "ancestor(" + i + "," + j + ")")
    }
  }

  function defaultChildrenOf(node) {
    return Object.keys(node).map(function(id) {
      return node[id]
    })
  }

  function verifyTree(tree) {
    var ancestor = preprocessTree(tree)
    verifyQuery(tree, ancestor)
    ancestor.rebuild()
    verifyQuery(tree, ancestor)
    verifyQuery(tree, preprocessTree(tree, defaultChildrenOf))
  }

  verifyTree({
    bar: { name: "bar" },
    baz: {
      name: "baz",
      zardoz: {
        golub: {},
        potato: {
          x: 1,
          y: 2,
          z: 3,
          f: {
            p: 1,
            q: {},
            xx: [
              {},
              {},
              {},
              [ [], [], [] ]
            ]
          }
        }
      }
    }
  })

  verifyTree([[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]])

  verifyTree({ x: null })
  
  t.end()
})