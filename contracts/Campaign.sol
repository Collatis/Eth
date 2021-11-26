// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Campaign is ERC1155 {
    address payable public receipient;
    uint256 public expiration_date;
    AggregatorV3Interface internal priceFeed;
    uint256 public goal;
    uint256 public donations = 0;
    uint256 public nftId;
    string public set_uri;
    string public name = "The Donation Project";

    event DonationSend(address donor, uint256 amount, uint256 nftId);
    event DonationEnded(address receipient, uint256 amount);
    event Transfer(address sender, address receiver, uint256 amount);

    constructor(
        uint256 init_duration,
        address payable receipient_adress,
        uint256 init_goal,
        uint256 init_nftId,
        string memory init_uri
    ) ERC1155(init_uri) {
        receipient = receipient_adress;
        goal = init_goal;
        nftId = init_nftId;
        set_uri = init_uri;
        expiration_date = block.timestamp + init_duration;
        priceFeed = AggregatorV3Interface(
            0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        );
    }

    function donate() public payable {
        if (expiration_date < block.timestamp)
            revert("This Donation Campaign has already ended.");
        _mint(msg.sender, nftId, 1, "");
        donations += 1;
        emit DonationSend(msg.sender, msg.value, nftId);
    }

    function getLatestPrice() public view returns (int256) {
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }

    function getBalance() public view returns (uint256) {
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();

        uint256 balance;
        balance = uint256(price) * (address(this).balance);
        return balance;
    }

    function payout() public {
        if (getBalance() >= goal || block.timestamp > expiration_date) {
            receipient.transfer(address(this).balance);
            emit DonationEnded(receipient, address(this).balance);
        } else if (getBalance() >= goal)
            revert("Donation Campaign has not reached its end goal");
        else if (block.timestamp < expiration_date)
            revert("Donation Campaign has not Ended Yet");
        // emit Transfer(address(this), receipient, address(this).balance);
    }

    function uri(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        return set_uri;
    }
}
