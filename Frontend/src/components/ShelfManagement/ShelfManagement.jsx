import { useState } from "react";

function ShelfManagement({ shelves, onCreateShelf, onRenameShelf }) {
  const [newShelfName, setNewShelfName] = useState("");
  const [editingShelfId, setEditingShelfId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const handleCreate = () => {
    const name = newShelfName.trim();

    if (!name) {
      return;
    }

    onCreateShelf(name);
    setNewShelfName("");
  };

  const startRename = (shelf) => {
    setEditingShelfId(shelf.id);
    setEditingName(shelf.name);
  };

  const handleRename = () => {
    const name = editingName.trim();

    if (!name) {
      return;
    }
    onRenameShelf(editingShelfId, name);

    setEditingName("");
    setEditingShelfId(null);
  };
  return (
    <div>
      <h2>Shelves</h2>

      {/* create shelf  */}
      <div>
        <input type="text" placeholder="Enter new shelf name"
        value = {newShelfName}
        onChange = {(e) => setNewShelfName(e.target.value)} />
        
        <button onClick={handleCreate}>Create shelf</button>
      </div>

      {/* display existing shelves  */}
      <div>
        {shelves.map((shelf) => (
          <div key={shelf.id}>
            {editingShelfId === shelf.id ? (
            <div>
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
              />

              <button onClick={handleRename}>Save</button>

              <button
                onClick={() => {
                  setEditingShelfId(null);
                  setEditingName("");
                }}
              >
                Cancel
              </button>
            </div>
            ) : (
            <div>
              <p>{shelf.name}</p>
              <button onClick={() => startRename(shelf)}>Rename</button>
            </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShelfManagement;
