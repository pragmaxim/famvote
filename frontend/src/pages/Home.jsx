import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useContract } from '../hooks/useContract';

const Home = () => {
  const { address } = useAccount();
  const { contract } = useContract();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolls = async () => {
      if (!contract) return;

      try {
        setLoading(true);

        // Get the total number of polls
        const pollCount = await contract.read.getPollCount();

        // Fetch details for each poll
        const pollsData = [];
        for (let i = 0; i < pollCount; i++) {
          const pollData = await contract.read.getPoll([i]);

          pollsData.push({
            id: i,
            description: pollData[0],
            options: pollData[1],
            results: pollData[2].map(count => Number(count)),
            voters: pollData[3],
            endTime: Number(pollData[4]),
            active: pollData[5],
            isVoter: pollData[3].includes(address)
          });
        }

        setPolls(pollsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching polls:', err);
        setError('Failed to load polls. Please try again later.');
        setLoading(false);
      }
    };

    fetchPolls();
  }, [contract, address]);

  // Group polls by active status
  const activePolls = polls.filter(poll => poll.active);
  const pastPolls = polls.filter(poll => !poll.active);

  if (loading) return <div className="text-center py-8">Loading polls...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="polls-container">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Family Polls</h1>
        <Link 
          to="/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create New Poll
        </Link>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 rounded-lg">
          <p className="text-xl">No polls created yet.</p>
          <p className="mt-2">Create your first poll to get started!</p>
        </div>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Active Polls</h2>
            {activePolls.length === 0 ? (
              <p className="text-gray-500">No active polls at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePolls.map(poll => (
                  <PollCard key={poll.id} poll={poll} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Past Polls</h2>
            {pastPolls.length === 0 ? (
              <p className="text-gray-500">No past polls.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastPolls.map(poll => (
                  <PollCard key={poll.id} poll={poll} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

// Poll card component
const PollCard = ({ poll }) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const isExpired = currentTime > poll.endTime;
  const timeRemaining = poll.endTime - currentTime;

  // Format time remaining
  const formatTimeRemaining = () => {
    if (isExpired) return 'Expired';

    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days !== 1 ? 's' : ''} remaining`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }

    return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
  };

  // Calculate total votes and percentages for past polls
  const totalVotes = poll.results.reduce((sum, count) => sum + count, 0);

  return (
    <Link 
      to={`/poll/${poll.id}`} 
      className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
    >
      <h3 className="text-xl font-semibold mb-2">{poll.description}</h3>

      <div className="flex justify-between text-sm text-gray-600 mb-3">
        <span className={isExpired ? 'text-red-500' : 'text-green-500'}>
          {formatTimeRemaining()}
        </span>
      </div>

      {poll.active && (
          <div className="mb-3 text-sm">
            {poll.options.map((option, index) => (
                <div
                    key={index}
                    className="text-gray-700 text-sm font-semibold leading-tight mb-0.5"
                >
                  {option}
                </div>
            ))}
          </div>
      )}

      {/* Display brief results for past polls */}
      {!poll.active && (
        <div className="mb-3 text-sm">
          {poll.options.map((option, index) => {
            const voteCount = poll.results[index] || 0;
            const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
            return (
              <div key={index} className="text-gray-700 text-sm font-semibold leading-tight mb-0.5">
                {option}: {voteCount} ({percentage}%)
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-sm">
          {poll.isVoter ? 'You can vote' : 'View only'}
        </span>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          {poll.active ? 'Active' : 'Closed'}
        </span>
      </div>
    </Link>
  );
};

export default Home;
