// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;
contract ReEntrancyGuard {
    bool internal locked;

    modifier noReentrant() {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }
}

contract SecuredEtherStore is ReEntrancyGuard{
    mapping (address=>uint ) public balances;

    function deposit() public payable{
        balances[msg.sender] += msg.value;
    }

    function withdraw()public noReentrant() {
        uint bal = balances[msg.sender];
        require(bal > 0 );

        (bool _tx,) = msg.sender.call{value:bal}("");
        require(_tx,"Failed to sent Ether");
        balances[msg.sender] = 0 ;

    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }
}