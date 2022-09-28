//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice() internal view returns(uint256){
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        (/* uint80 roundId */, 
        int256 answer, 
        /* uint256 startedAt */, 
        /* uint256 updatedAt */, 
        /* uint80 answeredInRound */) = priceFeed.latestRoundData();

        // `answer` is ETH in USD.
        return uint256(answer * 1e10);
    }
    
    function getConversionRate(uint256 ethAmount) internal view returns(uint256) {
        uint256 ethPrice = getPrice();
        uint256 ethAmountInUsd = (ethAmount * ethPrice) / 1e18;
        return ethAmountInUsd;
    }

}