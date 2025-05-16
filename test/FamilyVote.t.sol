// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/FamilyVote.sol";

contract FamilyVoteTest is Test {
    FamilyVote public famVote;

    address user1 = address(0x1);
    address user2 = address(0x2);

    function setUp() public {
        famVote = new FamilyVote();
    }

    function testCreateAndVote() public {
        // Declare memory arrays with size 2
        address[] memory voters = new address[](2); // declare and initialize voters variable
        voters[0] = user1;
        voters[1] = user2;

        string[] memory options = new string[](2); // declare and initialize options variable
        options[0] = "Pizza";
        options[1] = "Pasta";

        // Now you can call the function with those arrays
        famVote.createPoll("Dinner tonight?", options, voters, 3600);
        vm.prank(user1);
        famVote.vote(0, 1); // Vote for "Pasta"

        (, , uint[] memory results,,,) = famVote.getPoll(0);
        assertEq(results[1], 1);
    }
}

