//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import './PriceConverter.sol';
import 'hardhat/console.sol';

error FundMe__NotOwner();
error FundMe_NotEnoughEth();

/** @title A contract for getting funding
 * @author Amin Hassani
 * @notice This is for demo and example only
 * @dev This implements price feed
 */
contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 1e18;

    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;

    address private immutable i_owner;

    AggregatorV3Interface private s_priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        if (msg.value > 0) {
            fund();
        }
    }

    fallback() external payable {
        if (msg.value > 0) {
            fund();
        }
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    function fund() public payable {
        // Want to be bale to set a minimum fund amount.

        // 1. How do we send ETH to this address?
        uint256 rate = msg.value.getConversionRate(s_priceFeed);
        console.log(
            'Funding %s, %s against minimum of %s',
            msg.value,
            rate,
            MINIMUM_USD
        );
        if (rate < MINIMUM_USD) {
            revert FundMe_NotEnoughEth();
        }
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

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        // mappings can't be a memory
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);

        (
            bool callSuccess, /* bytes memory dataReturned */

        ) = payable(msg.sender).call{value: address(this).balance}('');
        require(callSuccess, 'call failed');
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
