import React, { useState } from 'react';

const Dashboard = () => {
  const [form, setForm] = useState({
    name: '',
    age: '',
    trait: '',
    favoriteThing: '',
    favoriteColor: '',
    storyType: '',
    storyElement: '',
  });
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naturalLanguageQuery: form }),
      });

      if (response.status !== 200) {
        const parsedError: { err: string } = await response.json();
        setError(parsedError.err);
      } else {
        const data = await response.json();
        setStory(data.databaseResponse);
      }
    } catch (_err) {
      setError('Error processing your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <input
          name='name'
          value={form.name}
          onChange={handleChange}
          placeholder='Name'
        />
        <input
          name='age'
          value={form.age}
          onChange={handleChange}
          placeholder='Age'
        />
        <input
          name='trait'
          value={form.trait}
          onChange={handleChange}
          placeholder='Trait'
        />
        <input
          name='favoriteThing'
          value={form.favoriteThing}
          onChange={handleChange}
          placeholder='Favorite Thing'
        />
        <input
          name='favoriteColor'
          value={form.favoriteColor}
          onChange={handleChange}
          placeholder='Favorite Color'
        />
        <input
          name='storyType'
          value={form.storyType}
          onChange={handleChange}
          placeholder='Story Type'
        />
        <input
          name='storyElement'
          value={form.storyElement}
          onChange={handleChange}
          placeholder='Element to include in story (optional)'
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Story'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      
      {story && (
        <div className="story-container">
          <h2>Your Story</h2>
          <p>{story}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
