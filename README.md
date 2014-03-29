level-ancestor
==============
Preprocesses a tree encoded as a JSON object so that [level ancestor](http://en.wikipedia.org/wiki/Level_ancestor_problem) queries can be answered in O(1) time.  Takes O(n log(n)) space and preprocessing time.

# Example

```javascript
var preprocessTree = require("level-ancestor")

//Construct some random tree object
var tree = {
  x: {
    y: {
      z: {
        foo: []
      }
    }
  }
}

//Preprocess and build data structure
var ancestor = preprocessTree(tree)

//Now we can answer ancestor predicates in constant time!
var assert = require("assert")

assert.ok(ancestor(tree.x.y.z.foo, 3) === tree.x)
```

# Install

```
npm install level-ancestor
```

# API

### `var ancestor = require("level-ancestor")(tree[,filter])`
Creates an ancestor query data structure for the given JSON tree

* `tree` is the root of a tree-like JSON object
* `filter(node,child)` is an optional function, which if passed determines which subtrees the augmentation is applied to.  The interpretation of these arguments is:

    + `node` is the subtree node
    + `child` is a string representing the child property of node

    `filter` should return a truthy value if `node[child]` should be augmented, or a falsey value if it should be skipped.
    

**Returns** A function `ancestor` for answering `ancestor` queries on `tree`

### `ancestor(node, k)`
Finds the `k`th ancestor of `node` in the tree.  For example, `ancestor(node,1)` is the parent of `node`, `ancestor(node,2)` is the grand parent, and so on.

* `node` is a node in the tree
* `k` is the ancestor to query

**Returns** The `k`th ancestor of `node`

### `ancestor.rebuild()`
Rebuilds the data structure on `tree`.  You must call this if the tree changes.

# Credits
(c) 2014 Mikola Lysenko. MIT License