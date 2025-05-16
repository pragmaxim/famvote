// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FamilyVote {
    struct Poll {
        string description;
        string[] options;
        address[] voters;
        uint endTime;
        bool active;
        mapping(uint => uint) votesPerOption;
        mapping(address => bool) hasVoted;
    }

    Poll[] public polls;
    mapping(uint => mapping(uint => uint)) public pollResults; // pollId => option => voteCount

    event PollCreated(uint pollId, string description);
    event Voted(uint pollId, address voter, uint option);

    function createPoll(
        string memory _description,
        string[] memory _options,
        address[] memory _voters,
        uint _durationSeconds
    ) public {
        Poll storage newPoll = polls.push();
        newPoll.description = _description;
        newPoll.options = _options;
        newPoll.voters = _voters;
        newPoll.endTime = block.timestamp + _durationSeconds;
        newPoll.active = true;

        emit PollCreated(polls.length - 1, _description);
    }

    function vote(uint _pollId, uint _option) public {
        Poll storage poll = polls[_pollId];
        require(poll.active, "Poll is not active");
        require(block.timestamp < poll.endTime, "Poll has ended");
        require(!poll.hasVoted[msg.sender], "Already voted");
        require(_option < poll.options.length, "Invalid option");
        require(isAllowedVoter(poll.voters, msg.sender), "Not allowed to vote");
        poll.votesPerOption[_option]++;
        pollResults[_pollId][_option]++;
        poll.hasVoted[msg.sender] = true;

        emit Voted(_pollId, msg.sender, _option);
    }

    function getPoll(uint _pollId) public view returns (
        string memory description,
        string[] memory options,
        uint[] memory results,
        address[] memory voters,
        uint endTime,
        bool active
    ) {
        Poll storage poll = polls[_pollId];
        uint[] memory counts = new uint[](poll.options.length);
        for (uint i = 0; i < poll.options.length; i++) {
            counts[i] = poll.votesPerOption[i];
        }
        return (
            poll.description,
            poll.options,
            counts,
            poll.voters,
            poll.endTime,
            poll.active
        );
    }

    function getPollCount() public view returns (uint) {
        return polls.length;
    }

    function endPoll(uint _pollId) public {
        Poll storage poll = polls[_pollId];
        require(poll.active, "Already ended");
        poll.active = false;
    }

    function isAllowedVoter(address[] storage voters, address user) internal view returns (bool) {
        for (uint i = 0; i < voters.length; i++) {
            if (voters[i] == user) {
                return true;
            }
        }
        return false;
    }
}

