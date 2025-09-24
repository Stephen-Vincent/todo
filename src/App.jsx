import { useState, useEffect } from "react";
import supabase from "./helper/supabaseClient";

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");

  // Modal state for updating a todo
  const [showModal, setShowModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching todos:", error);
      setTodos([]);
    } else {
      setTodos(data);
    }
  }

  async function addTodo() {
    if (!title.trim()) return;
    const { error } = await supabase
      .from("todos")
      .insert([{ title, is_completed: false }]); // align with schema
    if (error) {
      console.error("Error adding todo:", error);
    } else {
      setTitle("");
      fetchTodos();
    }
  }

  async function completeTodo(id) {
    const { error } = await supabase
      .from("todos")
      .update({ is_completed: true }) // align with schema
      .eq("id", id);
    if (error) console.error("Error completing todo:", error);
    fetchTodos();
  }

  async function deleteTodo(id) {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) console.error("Error deleting todo:", error);
    fetchTodos();
  }

  async function updateTodo(id, newTitle) {
    if (!newTitle || !newTitle.trim()) return;
    const { error } = await supabase
      .from("todos")
      .update({ title: newTitle })
      .eq("id", id);
    if (error) console.error("Error updating todo:", error);
    fetchTodos();
  }

  function openEditModal(todo) {
    setEditId(todo.id);
    setEditTitle(todo.title);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditId(null);
    setEditTitle("");
  }

  async function saveEdit() {
    await updateTodo(editId, editTitle);
    closeModal();
  }

  const incomplete = todos.filter((t) => !t.is_completed);
  const complete = todos.filter((t) => t.is_completed);

  return (
    <div>
      <h1>Todo List</h1>
      <div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new Todo"
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <h2>Incomplete Todos</h2>
      <div>
        {incomplete.map((todo) => (
          <div key={todo.id}>
            <span style={{ flex: 1 }}>{todo.title}</span>
            <button onClick={() => completeTodo(todo.id)}>Complete</button>
            <button onClick={() => openEditModal(todo)}>Update</button>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </div>
        ))}
      </div>

      <h2>Completed Todos</h2>
      <div>
        {complete.map((todo) => (
          <div key={todo.id}>
            <span style={{ flex: 1, textDecoration: "line-through" }}>
              {todo.title}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </div>
        ))}
      </div>

      {/* Simple modal popup for editing a title */}
      {showModal && (
        <div>
          <div>
            <h3>Edit Todo</h3>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="New title"
            />
            <div>
              <button onClick={closeModal}>Cancel</button>
              <button onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
