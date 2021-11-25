// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.0;
import "@chainlink/contracts/src/v0.5/interfaces/AggregatorV3Interface.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC1155/ERC1155.sol";

contract Campaign is ERC1155 {
    address payable public receipient;
    uint256 public expiration_date;
    AggregatorV3Interface internal priceFeed;

    uint256 public goal;

    uint256 public donations = 0;

    uint256 public nftId;

    // error AuctionAlreadyEnded();

    event DonationSend(address donor, uint256 amount, uint256 nftId);
    event DonationEnded(address receipient, uint256 amount);

    constructor(
        uint256 init_duration,
        address payable receipient_adress,
        uint256 init_goal,
        uint256 init_nftId
    )
        ERC1155(
            "https://dnw6c3v77ahg.usemoralis.com:2053/server/functions/getNFT?_ApplicationId=RC8zJRpeRV5MdzR4pSbCEpnqBXNUgh7npI6sFJAa&id={id}"
        )
    {
        receipient = receipient_adress;
        goal = init_goal;
        nftId = init_nftId;
        priceFeed = AggregatorV3Interface(
            0x9326BFA02ADD2366b30bacB125260Af641031331
        );
        expiration_date = block.timestamp + init_duration;
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
        balance = uint256(price) * address(this).balance;
        return balance;
    }

    function payout() public {
        if (getBalance() < goal)
            revert("Donation Campaign has not reached its end goal");
        if (block.timestamp < expiration_date)
            revert("Donation Campaign has not Ended Yet");
        emit DonationEnded(receipient, address(this).balance);
        receipient.transfer(address(this).balance);
    }
}
