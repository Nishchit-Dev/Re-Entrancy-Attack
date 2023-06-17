const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const should = require("chai").should();

const wait = async () => {
  await setTimeout(() => {}, 3000);
};

describe("Re-Entrancy Attack", function () {
  // some helping variables
  var Alice, Bob, Attacker, EtherStoreAddress, AttackerAddress;

  describe("Fetching Accounts", function () {
    it("Alice's address", async () => {
      const [alice] = await ethers.getSigners();
      alice.should.have.property("address");
      Alice = alice;
      console.log(alice.address);
    });
    it("Bob's address", async () => {
      const [, bob] = await ethers.getSigners();
      Bob = bob;
      bob.should.have.property("address");

      console.log(bob.address);
    });
    it("Attacker's address", async () => {
      const [, , attacker] = await ethers.getSigners();
      Attacker = attacker;
      attacker.should.have.property("address");
      console.log(attacker.address);
    });
  });
  describe("Deploy Vulnerable SmartContract", () => {
    it("Deploying", async () => {
      const EtherStore = await ethers.getContractFactory(
        "contracts/EtherStore.sol:EtherStore"
      );

      let tx = await EtherStore.deploy();
      console.log(tx.target);
      EtherStoreAddress = tx.target;
      tx.target.should.be.a("string");
    });
  });
  describe("Deploy Attacker's SmartContract", function () {
    it("Deploying ", async () => {
      const AttackContract = await hre.ethers.getContractFactory(
        "contracts/Attack.sol:Attack"
      );
      const tx = await AttackContract.connect(Attacker).deploy(
        EtherStoreAddress
      );
      AttackerAddress = tx.target;
      tx.target.should.be.a("string");
      console.log(AttackerAddress);
    });
  });
  describe("Alice => 2 Ether Vulnerable Contract", async () => {
    it("Sending 2 ether", async () => {
      const EtherStore = await ethers.getContractAt(
        "contracts/EtherStore.sol:EtherStore",
        EtherStoreAddress
      );
      let amount = await ethers.parseEther("2.0");
      const tx = await EtherStore.connect(Alice).deposit({ value: amount });
    });
  });
  describe("Bob => 3 Ether Vulnerable Contract ", () => {
    it("Sending 3 ether", async () => {
      const EtherStore = await ethers.getContractAt(
        "contracts/EtherStore.sol:EtherStore",
        EtherStoreAddress
      );

      let amount = await ethers.parseEther("3.0");
      const tx = await EtherStore.connect(Bob).deposit({
        value: amount,
      });
    });
  });
  describe("GetBalance of Vulnerable Contract", () => {
    it("ETH Balance", async () => {

      const EtherStore = await ethers.getContractAt(
        "contracts/EtherStore.sol:EtherStore",
        EtherStoreAddress
      );
      const Eth = await EtherStore.getBalance();
      let amount = ethers.formatEther(Eth);

      console.log(amount);
    });
  });

  describe("Attacking", () => {
    it("Calling attack function", async () => {
      const AttackContract = await ethers.getContractAt(
        "contracts/Attack.sol:Attack",
        AttackerAddress
      );

      const Attack = await AttackContract.connect(Attacker).attack({
        value: ethers.parseEther("1.0"),
      });

      let Eth = await AttackContract.getBalance();
      Eth = ethers.formatEther(Eth);
      console.log(Eth);
      // expect(Number(Eth));
    });

    describe("GetBalance of Both Contract", () => {
      it("Ethers", async () => {
        const EtherStore = await ethers.getContractAt(
          "contracts/EtherStore.sol:EtherStore",
          EtherStoreAddress
        );
        const _attackContract = await ethers.getContractAt(
          "contracts/Attack.sol:Attack",
          AttackerAddress
        );

        const Eth_should = await EtherStore.getBalance();
        const Eth_stolen = await _attackContract.getBalance();

        console.log("Vulnerable SmartContract:",Eth_should, "\n Attacker's Contract",Eth_stolen);
        expect(Number(ethers.formatEther(Eth_should))).to.be.equal(0);
        expect(Number(ethers.formatEther(Eth_stolen))).to.be.a("number");
      });
    });
    describe("Withdraw All Eth from Attacker's Contract", () => {
      it("Withdrawing", async () => {
        const _attackContract = await ethers.getContractAt(
          "contracts/Attack.sol:Attack",
          AttackerAddress
        );

        const tx = await _attackContract.connect(Attacker).sendStolenEth();
      });
    });
  });
});
