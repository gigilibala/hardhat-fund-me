//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import './PriceConverter.sol';

error NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 1e18;

    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    address public immutable i_owner;

    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        // Want to be bale to set a minimum fund amount.

        // 1. How do we send ETH to this addres?
        require(
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "Didn't send enough ETH"
        ); // 1 ETH.
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert NotOwner();
        }
        require(msg.sender == i_owner, 'Sender is not the owner!');
        _;
    }

    function withdraw() public onlyOwner {
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            addressToAmountFunded[funder] = 0;
        }

        funders = new address[](0);

        // call
        (
            bool callSuccess, /* bytes memory dataReturned */

        ) = payable(msg.sender).call{value: address(this).balance}('');
        require(callSuccess, 'call failed');
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
