// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.4.22 <0.8.0;

contract Campaign {
    address payable public receipient;
    uint256 public expiration_date;
    // uint public goal;

    // error AuctionAlreadyEnded();

    event DonationSend(address donor, uint256 amount);
    event DonationEnded(address receipient, uint256 amount);

    constructor(uint256 duration, address payable receipient_adress) public {
        receipient = receipient_adress;
        // goal = goal;
        expiration_date = block.timestamp + duration;
    }

    function donate() public payable {
        if (expiration_date < block.timestamp)
            revert("This Donation Campaign has already ended.");
        emit DonationSend(msg.sender, msg.value);
    }  

    function payout() external {
        if (block.timestamp < expiration_date)
            revert("Donation Campaign has not Ended Yet");
        emit DonationEnded(receipient, address(this).balance);
        receipient.transfer(address(this).balance);
    }
}
