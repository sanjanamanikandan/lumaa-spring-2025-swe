import React, {useState, useEffect} from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';

//const API_URL = process.env.REACT_APP_API_URL;
const API_URL = "http://localhost:3001"

interface Task {
  id: number;
  title: string;
  description?: string;
  isComplete: boolean;
}

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const fetchTasks = async () => {
    const response = await axios.get(`${API_URL}/tasks`, {
      headers: {Authorization: token},
    });
    setTasks(response.data);
  };

  const createTask = async () => {
    console.log(`${title}`);
    await axios.post(
      `${API_URL}/tasks`,
      {title, description},
      {headers: {Authorization: token}}
    );
    fetchTasks();
  };

  const updateTask = async (id: number, isComplete: boolean) => {
    await axios.put(
      `${API_URL}/tasks/${id}`,
      {isComplete},
      {headers: {Authorization: token}}
    );
    fetchTasks();
  };

  const deleteTask = async (id: number) => {
    await axios.delete(`${API_URL}/tasks/${id}`,
      {headers: {Authorization: token},
    });
    fetchTasks();
  };

  if (!token) {
    return (
      <div>
        <h2>Register</h2>
        <form onSubmit={async (e) => {
          e.preventDefault();
          console.log(`${API_URL}`);
          const response = await axios.post(`http://localhost:3001/auth/register`, {
            username: e.currentTarget.username.value,
            password: e.currentTarget.password.value,
          });
          localStorage.setItem('token', response.data.token);
          setToken(response.data.token);
        }}>
          <input name="username" placeholder="Username" />
          <input name="password" type="password" placeholder="Password" />
          <button type="submit">Register</button>
        </form>

        <h2>Login</h2>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const response = await axios.post(`${API_URL}/auth/login`, {
            username: e.currentTarget.username.value,
            password: e.currentTarget.password.value,
          });
          localStorage.setItem('token', response.data.token);
          setToken(response.data.token);
        }}>
          <input name="username" placeholder="Username" />
          <input name="password" type="password" placeholder="Password" />
          <button type="submit">Login</button>
        </form>
      </div>
    );    
  }

  return (
    <div>
      <button onClick={() => {
        localStorage.removeItem('token');
        setToken(null);
      }}>Logout</button>

      <h2>Tasks</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.isComplete}
              onChange={(e) => updateTask(task.id, e.target.checked)}
            />
            {task.title} - {task.description}
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Create Task</h2>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={createTask}>Create</button>
    </div>
  );
};

export default App;

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
