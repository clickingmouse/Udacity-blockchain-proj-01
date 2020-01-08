//.load blockchain.js
let bc = new Blockchain();
bc._addBlock(new BlockClass.Block("test data 1"));
bc._addBlock(new BlockClass.Block("test data 2"));
bc._addBlock(new BlockClass.Block("test data 3"));
bc._addBlock(new BlockClass.Block("test data 4"));

// induces invald blocks
function tamperBlock(height) {
  bc.chain[height].body = "induced error";
}

bc.validateChain().then(value => console.log(value));
console.log("=============================================================");
tamperBlock(2);
tamperBlock(4);
bc.validateChain().then(value => console.log(value));

console.log("=============================================================");
// induces hash mismatch (1,3)
//'The previous hash value doesn\'t match - Block Index: 1',
//'The previous hash value doesn\'t match - Block Index: 2',
function transferBlock(height1, height2) {
  bc.chain[height1] = bc.chain[height2];
}
transferBlock(1, 3);
bc.validateChain().then(value => console.log(value));
