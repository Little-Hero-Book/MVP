import React, { useState } from 'react';

const Dashboard = () => {
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [databaseQuery, setDatabaseQuery] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDatabaseQuery('');
    try {
      const converterResponse = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ naturalLanguageQuery }),
      });

      if (converterResponse.status !== 200) {
        const parsedError: { err: string } = await converterResponse.json();
        setError(parsedError.err);
      } else {
        const parsedConverterResponse =
          await converterResponse.json();
        setDatabaseQuery(parsedConverterResponse.databaseResponse);
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
        <textarea
          value={naturalLanguageQuery}
          onChange={(e) => setNaturalLanguageQuery(e.target.value)}
          placeholder="Enter your natural language query here..."
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Converting...' : 'Convert and Execute'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {databaseQuery && (
        <div className="result">
          <h2>Story</h2>
          <pre>{databaseQuery}</pre>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
