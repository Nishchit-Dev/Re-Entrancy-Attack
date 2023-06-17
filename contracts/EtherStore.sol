// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

contract EtherStore {
    mapping (address=>uint ) public balances;

    function deposit() public payable{
        balances[msg.sender] += msg.value;
    }

    function withdraw()public {
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