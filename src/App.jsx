import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

  return (
    <div className="bg-[url('/src/assets/background-image.jpg')] h-screen bg-cover bg-center flex justify-center items-center">
      <div className="flex flex-col items-center liquid-container liquid-animated min-h-[90%] w-[70%] scroll-auto">
        {/* Heading */}
        <h1 className="font-script text-4xl m-12">Todo List</h1>

        {/* Add TODO's */}
        <div className="w-[80%] flex mb-4 gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new Todo"
            className="bg-white/40 shadow-md rounded-xl px-4 py-2 focus:outline-none flex-1"
          />
          <button onClick={addTodo} className="btn bg-turquoise">
            Add
          </button>
        </div>

        {/* Container */}
        <div className="shadow-md mt-4 pt-4 w-[80%] min-h-[200px] overflow-y-auto rounded-xl">
          {todos.length === 0 && (
            <div className="mx-4 mb-4 opacity-70">
              No todos yet. Add your first one above.
            </div>
          )}
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={
                "flex justify-between mx-2 py-2 transition " +
                (todo.is_completed ? "opacity-80" : "")
              }
            >
              <span
                className={
                  todo.is_completed ? "line-through opacity-60" : undefined
                }
              >
                {todo.title}
              </span>
              <div className="flex gap-2">
                <button
                  className={
                    "btn " +
                    (todo.is_completed
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-turquoise")
                  }
                  onClick={() => completeTodo(todo.id)}
                  disabled={todo.is_completed}
                >
                  Complete
                </button>
                <button
                  className="btn bg-dutchWhite"
                  onClick={() => openEditModal(todo)}
                >
                  Update
                </button>
                <button
                  className="btn bg-coral"
                  onClick={() => deleteTodo(todo.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal (portal to body so fixed positioning truly centers in viewport) */}
        {showModal &&
          createPortal(
            <div
              className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
              onClick={closeModal}
            >
              <div
                className="w-full max-w-md rounded-xl bg-white shadow-2xl p-6 relative"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="editTodoTitle"
              >
                <h3 id="editTodoTitle" className="text-xl font-semibold mb-4">
                  Edit Todo
                </h3>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="New title"
                  className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-turquoise"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button onClick={closeModal} className="btn bg-dutchWhite">
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="btn bg-turquoise"
                    disabled={!editTitle || !editTitle.trim()}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
      {/* Filter */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="liquidGlass" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.009"
            numOctaves="3"
            seed="3"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="3" result="softNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softNoise"
            scale="20"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </div>
  );
}

export default App;
