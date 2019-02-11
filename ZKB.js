module.exports = class ZKB
{
  constructor(kb)
  {
    //TODO: meta
    //  uuid, title, modify date, tags, links
    this.root = kb || this.createNode();

    //TODO: make this a utilities class that handles zkb-formatted data?
    //TODO: when creating, search for full path, then full path - 1, then full path - 2.. etc until one is found, then create the remaining path
    //TODO: return the full path when node is created i guess
    //TODO: make all of these functions operate on path arrays?
  }

  //RED: read, edit, delete
  //like crud except edit = create/update

  validatePath(path)
  {
    //TODO: check for $s in the middle of the path
    //TODO: check that path only contains alphanumeric characters except dots and $ at the beginning
    //TODO: format path here too? (lower case)

    //:^)
    return;
  }

  pathToArray(path)
  {
    this.validatePath(path);

    //split on period
    path = path.split(".");
    //omit root $
    //path = path.slice(1);


    return path;
  }

  deleteNode(path)
  {
    var pathArray = this.pathToArray(path);

    var node = this.get(path);

    if(node == null)
    {
      throw "" + path + " is null";
    }

    //TODO: fix delete node.. parent is null
    //console.log(pathArray.slice(0, -1), pathArray[pathArray.length - 1]);
    var parent = this.findNode(pathArray.slice(0, -1));//TODO meh join
    delete parent.children[pathArray[pathArray.length - 1]];
  }

  move(srcPath, dstPath)
  {
    var srcArray = this.pathToArray(srcPath);
    var dstArray = this.pathToArray(dstPath);

    //dstPath should not fully exist
    var existing = this.get(dstPath);
    if(existing != null)
    {
      throw "" + dstPath + " already exists";
    }

    if(this.get(srcPath) == null)
    {
      throw "" + srcPath + " is null";
    }

    //get source
    //TODO: get/set raw mode (returns full object)\
    console.log(srcArray, dstArray)
    var src = this.findNode(srcArray);
    //console.log(src)
    //delete source
    this.deleteNode(srcPath)

    //set destination
    console.log(dstArray.slice(0, -1), dstArray[dstArray.length - 1])
    var dst = this.findNode(dstArray.slice(0, -1));
    var dstLast = dstArray[dstArray.length - 1];

    dst.children[dstLast] = src;

    /*
    var srcParent = this.findNode(srcArray.slice(0, -1));
    delete srcParent.children[srcArray[srcArray.length - 1]];
    */
  }

  get(path)
  {
    var pathArray = this.pathToArray(path);

    var node = this.findNode(pathArray);

    if(node == null)
    {
      return null;
    }

    return node.data;
  }

  set(path, data)
  {
    var pathArray = this.pathToArray(path);
    var foundNode = this.findNode(pathArray);

    if(foundNode != null)
    {
      foundNode.data = data;
      return;
    }

    data = data || "";

    //TODO: remove empty

    //console.log(path + " not found, creating.");

    var node = this.createPath(pathArray);

    node.data = data;
  }

  createNode(data)
  {
    data = data || "";

    var n = {};
    n.data = data;
    //TODO parse meta here?
    n.meta = {};
    n.children = {};

    return n;
  }

  //TODO: return remaining path?
  findNode(pathArray, node)
  {
    //optional $
    if(pathArray[0] == "$")
    {
      pathArray = pathArray.slice(1);
    }

    node = node || this.root;

    //if we hit the end, return current node
    if(pathArray.length == 0)
    {
      //console.log("bye")
      return node;
    }

    //console.log("looking for " + pathArray[0])
    //if found, continue
    if(pathArray[0] in node.children)
    {
      return this.findNode(pathArray.slice(1), node.children[pathArray[0]]);
    }

    //if not found, return null
    return null;
  }

  //creates all nodes in the given path, but does not overwrite; returns last node
  createPath(pathArray, node)
  {
    if(pathArray[0] == "$")
    {
      pathArray = pathArray.slice(1);
    }

    node = node || this.root;

    if(pathArray.length == 0)
    {
      return node;
    }

    //console.log(pathArray)

    //create if not exist
    if(!(pathArray[0] in node.children))
    {
      //console.log("creating " + pathArray[0])
      node.children[pathArray[0]] = this.createNode();
    }

    //recurse
    node = node.children[pathArray[0]];
    return this.createPath(pathArray.slice(1), node);
  }
}
