import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

function App() {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');

  // Load all lists when component mounts
  useEffect(() => {
    axios.get(`${API_BASE}/lists`).then((res) => {
      setLists(res.data);
    });
  }, []);

  const addList = async () => {
    if (!newListName.trim()) return;
    const res = await axios.post(`${API_BASE}/lists`, { name: newListName });
    setLists([...lists, res.data]);
    setNewListName('');
  };

  const deleteList = async (id) => {
    await axios.delete(`${API_BASE}/lists/${id}`);
    setLists(lists.filter((l) => l._id !== id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>📝 To-Do Lists</h1>
      <input
        placeholder="New list name"
        value={newListName}
        onChange={(e) => setNewListName(e.target.value)}
      />
      <button onClick={addList}>Add List</button>

      <ul>
        {lists.map((list) => (
          <li key={list._id}>
            {list.name}{' '}
            <button onClick={() => deleteList(list._id)}>🗑 Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
