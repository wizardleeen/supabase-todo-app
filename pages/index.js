// pages/index.js
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/login');
    } else {
      fetchTodos();
    }
  }, [session, router]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data);
    } catch (error) {
      alert('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('todos')
        .insert({ task: newTask, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setTodos([data, ...todos]);
      setNewTask('');
    } catch (error) {
      alert('Error adding todo: ' + error.message);
    }
  };

  const toggleComplete = async (id, is_complete) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ is_complete: !is_complete })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTodos(todos.map((todo) => (todo.id === id ? data : todo)));
    } catch (error) {
      alert('Error updating todo: ' + error.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (error) throw error;
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      alert('Error deleting todo: ' + error.message);
    }
  };

  if (!session) {
    return null; // or a loading indicator
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Todo List</h1>
          <p>Hello, {session.user.email}</p>
          <button onClick={handleSignOut} className={styles.button}>
            Sign Out
          </button>
        </div>

        <form onSubmit={addTodo} className={styles.form}>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What do you need to do?"
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            Add
          </button>
        </form>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className={styles.todoList}>
            {todos.length === 0 ? (
              <p>No todos yet! Add one above.</p>
            ) : (
              todos.map((todo) => (
                <li key={todo.id} className={styles.todoItem}>
                  <input
                    type="checkbox"
                    checked={todo.is_complete}
                    onChange={() => toggleComplete(todo.id, todo.is_complete)}
                    className={styles.checkbox}
                  />
                  <span className={todo.is_complete ? styles.completed : ''}>
                    {todo.task}
                  </span>
                  <button onClick={() => deleteTodo(todo.id)} className={styles.deleteButton}>
                    &times;
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </main>
    </div>
  );
}
