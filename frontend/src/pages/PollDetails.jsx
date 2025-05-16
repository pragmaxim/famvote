import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useContract } from '../hooks/useContract';

const PollDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { contract } = useContract();
  
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  
  // Fetch poll details
  useEffect(() => {
    const fetchPoll = async () => {
      if (!contract || !id) return;
      
      try {
        setLoading(true);
        
        const pollData = await contract.read.getPoll([parseInt(id)]);
        
        // Check if the current user has already voted
        // This is a workaround since we can't directly access the hasVoted mapping
        // We'll need to implement this check on the backend in a production app
        
        const pollObj = {
          id: parseInt(id),
          description: pollData[0],
          options: pollData[1],
          results: pollData[2].map(count => Number(count)),
          voters: pollData[3],
          endTime: Number(pollData[4]),
          active: pollData[5],
          isVoter: pollData[3].includes(address)
        };
        
        setPoll(pollObj);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching poll:', err);
        setError('Failed to load poll details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchPoll();
  }, [contract, id, address]);
  
  // Calculate if poll is expired
  const isExpired = poll ? Math.floor(Date.now() / 1000) > poll.endTime : false;
  
  // Format time remaining or expired time
  const formatTime = () => {
    if (!poll) return '';
    
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = poll.endTime - currentTime;
    
    if (timeDiff <= 0) {
      const expiredAgo = Math.abs(timeDiff);
      const hours = Math.floor(expiredAgo / 3600);
      const minutes = Math.floor((expiredAgo % 3600) / 60);
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `Expired ${days} day${days !== 1 ? 's' : ''} ago`;
      }
      
      if (hours > 0) {
        return `Expired ${hours}h ${minutes}m ago`;
      }
      
      return `Expired ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else {
      const hours = Math.floor(timeDiff / 3600);
      const minutes = Math.floor((timeDiff % 3600) / 60);
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days} day${days !== 1 ? 's' : ''} remaining`;
      }
      
      if (hours > 0) {
        return `${hours}h ${minutes}m remaining`;
      }
      
      return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    }
  };
  
  // Calculate total votes
  const totalVotes = poll ? poll.results.reduce((sum, count) => sum + count, 0) : 0;
  
  // Handle vote submission
  const handleVote = async () => {
    if (selectedOption === null) {
      setError('Please select an option to vote');
      return;
    }
    
    try {
      setIsVoting(true);
      setError(null);
      
      // Call the contract to vote
      const tx = await contract.write.vote([
        BigInt(poll.id),
        BigInt(selectedOption)
      ]);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Refresh poll data
      const pollData = await contract.read.getPoll([parseInt(id)]);
      
      const updatedPoll = {
        ...poll,
        results: pollData[2].map(count => Number(count))
      };
      
      setPoll(updatedPoll);
      setHasVoted(true);
      setIsVoting(false);
    } catch (err) {
      console.error('Error voting:', err);
      setError('Failed to submit vote. You may have already voted or the poll has ended.');
      setIsVoting(false);
    }
  };
  
  // Handle ending the poll
  const handleEndPoll = async () => {
    try {
      setIsEnding(true);
      setError(null);
      
      // Call the contract to end the poll
      const tx = await contract.write.endPoll([BigInt(poll.id)]);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Update poll status
      setPoll({
        ...poll,
        active: false
      });
      
      setIsEnding(false);
    } catch (err) {
      console.error('Error ending poll:', err);
      setError('Failed to end poll. It may already be inactive.');
      setIsEnding(false);
    }
  };
  
  if (loading) return <div className="text-center py-8">Loading poll details...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!poll) return <div className="text-center py-8">Poll not found</div>;
  
  return (
    <div className="poll-details">
      <button 
        onClick={() => navigate('/')}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        ← Back to Polls
      </button>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{poll.description}</h1>
          <div className={`text-sm px-2 py-1 rounded ${poll.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {poll.active ? 'Active' : 'Closed'}
          </div>
        </div>
        
        <div className="mb-6 text-sm text-gray-600">
          <p>Time: {formatTime()}</p>
          <p>Total votes: {totalVotes}</p>
        </div>
        
        {/* Results Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          
          <div className="space-y-4">
            {poll.options.map((option, index) => {
              const voteCount = poll.results[index] || 0;
              const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              
              return (
                <div key={index} className="poll-option">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{option}</span>
                    <span>{voteCount} vote{voteCount !== 1 ? 's' : ''} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-600 h-4 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Voting Section - Only show if user can vote and poll is active */}
        {poll.active && poll.isVoter && !hasVoted && !isExpired && (
          <div className="voting-section">
            <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
            
            <div className="space-y-2 mb-4">
              {poll.options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name="poll-option"
                    value={index}
                    checked={selectedOption === index}
                    onChange={() => setSelectedOption(index)}
                    className="mr-2"
                  />
                  <label htmlFor={`option-${index}`}>{option}</label>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleVote}
              disabled={isVoting || selectedOption === null}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded disabled:opacity-50"
            >
              {isVoting ? 'Submitting Vote...' : 'Submit Vote'}
            </button>
          </div>
        )}
        
        {/* Poll Management - Only show if poll is active */}
        {poll.active && (
          <div className="mt-8 pt-4 border-t">
            <h2 className="text-xl font-semibold mb-4">Poll Management</h2>
            
            <button
              onClick={handleEndPoll}
              disabled={isEnding}
              className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded disabled:opacity-50"
            >
              {isEnding ? 'Ending Poll...' : 'End Poll Now'}
            </button>
            
            <p className="text-sm text-gray-500 mt-2">
              Note: Ending a poll will permanently close it for voting.
            </p>
          </div>
        )}
        
        {/* Voter List */}
        <div className="mt-8 pt-4 border-t">
          <h2 className="text-xl font-semibold mb-4">Allowed Voters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {poll.voters.map((voter, index) => (
              <div 
                key={index} 
                className={`text-sm font-mono p-2 rounded ${voter === address ? 'bg-blue-100' : 'bg-gray-100'}`}
              >
                {voter === address ? `${voter} (You)` : voter}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollDetails;