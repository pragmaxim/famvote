import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useContract } from '../hooks/useContract';

const CreatePoll = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { contract } = useContract();
  
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']); // Start with 2 empty options
  const [voters, setVoters] = useState([address]); // Start with current user
  const [duration, setDuration] = useState(3600); // Default: 1 hour in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Add a new empty option
  const addOption = () => {
    setOptions([...options, '']);
  };

  // Remove an option at specific index
  const removeOption = (index) => {
    if (options.length <= 2) return; // Keep at least 2 options
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  // Update option at specific index
  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Add a new voter address
  const addVoter = () => {
    setVoters([...voters, '']);
  };

  // Remove a voter at specific index
  const removeVoter = (index) => {
    if (voters.length <= 1) return; // Keep at least 1 voter
    const newVoters = [...voters];
    newVoters.splice(index, 1);
    setVoters(newVoters);
  };

  // Update voter at specific index
  const updateVoter = (index, value) => {
    const newVoters = [...voters];
    newVoters[index] = value;
    setVoters(newVoters);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!description.trim()) {
      setError('Please enter a poll description');
      return;
    }
    
    if (options.some(opt => !opt.trim())) {
      setError('All options must have a value');
      return;
    }
    
    if (voters.some(voter => !voter || !voter.startsWith('0x'))) {
      setError('All voter addresses must be valid Ethereum addresses');
      return;
    }
    
    if (duration <= 0) {
      setError('Duration must be greater than 0');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Call the contract to create a new poll
      const tx = await contract.write.createPoll([
        description,
        options,
        voters,
        BigInt(duration)
      ]);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Redirect to home page
      navigate('/');
    } catch (err) {
      console.error('Error creating poll:', err);
      setError('Failed to create poll. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-poll">
      <h1 className="text-3xl font-bold mb-6">Create New Poll</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Poll Description */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Poll Question
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's for dinner?"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        {/* Poll Options */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Options
          </label>
          {options.map((option, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-grow p-2 border rounded"
                required
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                disabled={options.length <= 2}
                className="ml-2 px-3 py-2 bg-red-500 text-white rounded disabled:opacity-50"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="mt-2 px-3 py-2 bg-gray-200 text-gray-800 rounded"
          >
            + Add Option
          </button>
        </div>
        
        {/* Voters */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Allowed Voters (Ethereum Addresses)
          </label>
          {voters.map((voter, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={voter}
                onChange={(e) => updateVoter(index, e.target.value)}
                placeholder="0x..."
                className="flex-grow p-2 border rounded font-mono"
                required
              />
              <button
                type="button"
                onClick={() => removeVoter(index)}
                disabled={voters.length <= 1}
                className="ml-2 px-3 py-2 bg-red-500 text-white rounded disabled:opacity-50"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addVoter}
            className="mt-2 px-3 py-2 bg-gray-200 text-gray-800 rounded"
          >
            + Add Voter
          </button>
        </div>
        
        {/* Duration */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Poll Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value={300}>5 minutes</option>
            <option value={900}>15 minutes</option>
            <option value={1800}>30 minutes</option>
            <option value={3600}>1 hour</option>
            <option value={7200}>2 hours</option>
            <option value={14400}>4 hours</option>
            <option value={28800}>8 hours</option>
            <option value={86400}>1 day</option>
            <option value={172800}>2 days</option>
            <option value={604800}>1 week</option>
          </select>
        </div>
        
        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePoll;