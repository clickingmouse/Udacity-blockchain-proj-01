/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message`
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *
 */

const SHA256 = require("crypto-js/sha256");
const BlockClass = require("./block.js");
const bitcoinMessage = require("bitcoinjs-message");

class Blockchain {
  /**
   * Constructor of the class, you will need to setup your chain array and the height
   * of your chain (the length of your chain array).
   * Also everytime you create a Blockchain class you will need to initialized the chain creating
   * the Genesis Block.
   * The methods in this class will always return a Promise to allow client applications or
   * other backends to call asynchronous functions.
   */
  constructor() {
    this.chain = [];
    this.height = -1;
    this.initializeChain();
  }

  /**
   * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
   * You should use the `addBlock(block)` to create the Genesis Block
   * Passing as a data `{data: 'Genesis Block'}`
   */
  async initializeChain() {
    if (this.height === -1) {
      let block = new BlockClass.Block({ data: "Genesis Block" });
      await this._addBlock(block);
    }
  }

  /**
   * Utility method that return a Promise that will resolve with the height of the chain
   */
  getChainHeight() {
    return new Promise((resolve, reject) => {
      resolve(this.height);
    });
  }

  /**
   * _addBlock(block) will store a block in the chain
   * @param {*} block
   * The method will return a Promise that will resolve with the block added
   * or reject if an error happen during the execution.
   * You will need to check for the height to assign the `previousBlockHash`,
   * assign the `timestamp` and the correct `height`...At the end you need to
   * create the `block hash` and push the block into the chain array. Don't for get
   * to update the `this.height`
   * Note: the symbol `_` in the method name indicates in the javascript convention
   * that this method is a private method.
   */
  _addBlock(block) {
    let self = this;
    return new Promise(async (resolve, reject) => {
      // block height
      block.height = this.chain.length;

      // timestamp
      block.time = new Date()
        .getTime()
        .toString()
        .slice(0, -3);
      //* You will need to check for the height to assign the `previousBlockHash`,
      if (this.chain.length > 0) {
        block.previousBlockHash = this.chain[this.chain.length - 1].hash;
      }
      //create the `block hash` and push the block into the chain array.
      block.hash = SHA256(JSON.stringify(block)).toString();
      this.chain.push(block);
      if ((this.chain[this.chain.length - 1] = block)) {
        resolve(block);
      } else {
        reject("Error adding block");
      }
    });
  }

  /**
   * The requestMessageOwnershipVerification(address) method
   * will allow you  to request a message that you will use to
   * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
   * This is the first step before submit your Block.
   * The method return a Promise that will resolve with the message to be signed
   * @param {*} address
   */
  //bitcoinjs-lib and bitcoinjs-message will help us verify wallet address ownership and signatures.
  //Note: Make sure to always use Legacy Wallet addresses.

  requestMessageOwnershipVerification(address) {
    return new Promise(resolve => {
      //<WALLET_ADDRESS>:${new Date().getTime().toString().slice(0,-3)}:starRegistry

      //You will need to replace <WALLET_ADDRESS> with the wallet address submitted by the requestor
      //and the time in your message will allow you to validate the 5 minutes time window.
      resolve(
        `${address}:${new Date()
          .getTime()
          .toString()
          .slice(0, -3)}:starRegistry`
      );
    });
  }

  /**
   * The submitStar(address, message, signature, star) method
   * will allow users to register a new Block with the star object
   * into the chain. This method will resolve with the Block added or
   * reject with an error.
   * Algorithm steps:
   * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
   * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
   * 3. Check if the time elapsed is less than 5 minutes
   * 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
   * 5. Create the block and add it to the chain
   * 6. Resolve with the block added.
   * @param {*} address
   * @param {*} message
   * @param {*} signature
   * @param {*} star
   */
  submitStar(address, message, signature, star) {
    console.log("<<<<<<<<<<<<");
    console.log(star);
    let self = this;
    return new Promise(async (resolve, reject) => {
      let time = parseInt(message.split(":")[1]);
      let currentTime = parseInt(
        new Date()
          .getTime()
          .toString()
          .slice(0, -3)
      );

      console.log(
        "submitting --->message:" +
          message +
          "|address:" +
          address +
          "|signature:" +
          signature
      );
      if (currentTime - time < 5000 * 60) {
        let verifiedMessage = bitcoinMessage.verify(
          message,
          address,
          signature
        );
        let newMessage = message.split(":");

        newMessage[2] = JSON.stringify(star);
        //newMessage[2] = star;

        newMessage = newMessage.join(":");
        console.log("newMessage---------------->" + newMessage);
        //* 5. Create the block and add it to the chain
        //const BlockClass = require("./block.js");
        //let block = new BlockClass.Block({ data: "Genesis Block" });
        //const newBlock = new BlockClass

        //const newBlock = new BlockClass.Block({ data: verifiedMessage });
        const newBlock = new BlockClass.Block({ data: newMessage });

        //newBlock = new BlockClass(verifiedMessage);
        this._addBlock(newBlock);
        resolve(newBlock);
      } else {
        reject("Error @ Creating new block");
      }
    });
  }

  /**
   * This method will return a Promise that will resolve with the Block
   *  with the hash passed as a parameter.
   * Search on the chain array for the block that has the hash.
   * @param {*} hash
   */
  getBlockByHash(hash) {
    let self = this;
    return new Promise((resolve, reject) => {
      block = this.chain.filter(block => block.hash == hash);
      if (block) {
        resolve(block);
      } else {
        reject("Error cannot find block with specified hash");
      }
    });
  }

  /**
   * This method will return a Promise that will resolve with the Block object
   * with the height equal to the parameter `height`
   * @param {*} height
   */
  getBlockByHeight(height) {
    let self = this;
    return new Promise((resolve, reject) => {
      let block = self.chain.filter(p => p.height === height)[0];
      if (block) {
        resolve(block);
      } else {
        resolve(null);
      }
    });
  }

  /**
   * This method will return a Promise that will resolve with an array of Stars objects existing in the chain
   * and are belongs to the owner with the wallet address passed as parameter.
   * Remember the star should be returned decoded.
   * @param {*} address
   */
  getStarsByWalletAddress(address) {
    let self = this;
    let stars = [];
    return new Promise((resolve, reject) => {
      console.log("============================================== ");
      console.log("searching for" + address);
      //stars = self.chain.map(el=>{  })
      stars = self.chain
        .filter(block => {
          if (block.height > 0) {
            let dataMessage = block.getBData();
            let blockAddress = dataMessage.split(":")[0];
            if (blockAddress == address) {
              return dataMessage.split(":")[2];
            }
          }
        })
        .map(block => {
          if (block.height > 0) {
            let dataMessage = block.getBData();
            let blockAddress = dataMessage.split(":")[0];
            if (blockAddress == address) {
              console.log("==>>" + typeof dataMessage);
              //console.log(JSON.stringify(dataMessage.split(":")[2]));
              var dMessage = dataMessage.split(":");
              dMessage.shift();
              dMessage.shift();

              //   console.log(dMessage);
              //   var a = dMessage.shift();
              //   console.log(a);
              //   var b = a.shift();
              //   console.log(b);
              var parsedMessage = dMessage.join(":");

              console.log(JSON.parse(parsedMessage));
              return JSON.parse(parsedMessage);
            }
          }
        });

      console.log(stars);
      if (stars.length > 0) {
        console.log("+" + stars);

        resolve(stars);
      } else {
        reject("Error no stars");
      }
    });
  }

  /**
   * This method will return a Promise that will resolve with the list of errors when validating the chain.
   * Steps to validate:
   * 1. You should validate each block using `validateBlock`
   * 2. Each Block should check the with the previousBlockHash
   */
  validateChain() {
    let self = this;
    let errorLog = [];
    return new Promise(async (resolve, reject) => {
      //this.chain.
      for (let i = 0; i < this.chain.length; i++) {
        const thisBlock = this.chain[i];
        const thisBlockHash = thisBlock.hash;
        const thisBlockPrevious = thisBlock.previousBlockHash;
        console.log("validating block[" + i + "]");
        if ((await thisBlock.validate()) == false) {
          console.log("found invalid block @" + thisBlock.height);
          errorLog.push("invalid block @ " + thisBlock.height);
        }
        if (i > 0) {
          //console.log("pushing Genesis@ i=" + i);
          //errorLog.push("Genesis Block does not validate");
          const aBlock = this.chain[i];
          const prevBlock = this.chain[i - 1];
          //          console.log(prevBlock);
          //          console.log(prevBlock.hash);
          //          console.log("comparing @ " +i +": " +thisBlock.previousBlockHash +" VSV " + this.chain[i - 1].hash);
          if (thisBlock.previousBlockHash != this.chain[i - 1].hash) {
            errorLog.push(
              "previousBlockHash value MISMATCH in Block[" +
                thisBlock.height +
                "]@index" +
                i
            );
          }
        }
      }

      if (errorLog) {
        resolve(errorLog);
      } else {
        //console.log("REJECT");
        reject("error validating ", errorLog);
      }
    });
  }
}

module.exports.Blockchain = Blockchain;
