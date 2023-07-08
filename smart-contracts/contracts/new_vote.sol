// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

contract new_vote {
    struct Vote {
        string candidateId;
        address voterWalletAddress;
    }

    Vote[] votes;
    mapping(string => address[]) public voteCheck;
    // mapping(string => mapping(string => address[])) public voteList;

    function voterExists(address[] memory arr, address element) public pure returns (bool) {
    for (uint256 i = 0; i < arr.length; i++) {
        if (arr[i] == element) {
            return true;
        }
    }
    return false;
}
    function giveVote(string memory candidateId, string memory eid) external {
        require(!voterExists(voteCheck[eid], msg.sender), "You have already voted");
        votes.push(Vote(candidateId, msg.sender));
        voteCheck[eid].push(msg.sender);
        // voteList[eid][candidateId].push(msg.sender);
    }

    function getVotes() public view returns (Vote[] memory) {
        return votes;
    }

    function getVoteCheck(string memory electionId) public view returns (address[] memory) {
        return voteCheck[electionId];
    }

    //get vote count by candidate id function
    function getCountOfVotes(string memory candidateId) public view returns (uint256) {
        uint count = 0;
        for(uint i = 0; i < votes.length; i++){
            if(keccak256(abi.encodePacked(votes[i].candidateId)) == keccak256(abi.encodePacked(candidateId))){
                count++;
            }
        }
        return count;
    }
}

//deployed at : 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
