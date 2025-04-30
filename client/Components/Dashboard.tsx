import React, { useState } from 'react';

const Dashboard = () => {
  const [form, setForm] = useState({
    name: '',
    age: '',
    trait: '',
    favoriteThing: '',
    favoriteColor: '',
    storyType: '',
   // storyElement: '',
    
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Updating form field: ${name} = ${value}`);
    setForm(prevForm => {
      const newForm = { ...prevForm, [name]: value };
      console.log('Updated form state:', newForm);
      return newForm;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      
      // Append form fields with correct names
      Object.entries(form).forEach(([key, value]) => {
        if (value) {  // Only append if value exists
          formData.append(key, value);
        }
      });
      
      // Append files if they exist
      if (files) {
        Array.from(files).forEach((file) => {
          formData.append('images', file);
        });
      }

      // Debug: Log form data contents
      console.log('Form fields:');
      for (const [key, value] of formData.entries()) {
        if (key !== 'images') {
          console.log(`${key}: ${value}`);
        }
      }
      
      console.log('Files:', files ? Array.from(files).map(f => f.name) : 'No files selected');

      const response = await fetch('/api', {
        method: 'POST',
        body: formData,
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
        {/* <input
          name='storyElement'
          value={form.storyElement}
          onChange={handleChange}
          placeholder='Element to include in story (optional)'
        /> */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          style={{ margin: '10px 0' }}
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
