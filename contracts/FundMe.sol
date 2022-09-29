//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import './PriceConverter.sol';

error FundMe__NotOwner();

/** @title A contract for getting funding
 * @author Amin Hassani
 * @notice This is for demo and example only
 * @dev This implements price feed
 */
contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 1e18;

    address[] public s_funders;
    mapping(address => uint256) public s_addressToAmountFunded;

    address public immutable i_owner;

    AggregatorV3Interface public s_priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    function fund() public payable {
        // Want to be bale to set a minimum fund amount.

        // 1. How do we send ETH to this addres?
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Didn't send enough ETH"
        ); // 1 ETH.
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        for (uint256 i = 0; i < s_funders.length; i++) {
            address funder = s_funders[i];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);

        // call
        (
            bool callSuccess, /* bytes memory dataReturned */

        ) = payable(msg.sender).call{value: address(this).balance}('');
        require(callSuccess, 'call failed');
    }
}
