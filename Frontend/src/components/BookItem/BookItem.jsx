import { useState, useEffect } from "react";
import "./BookItem.css";
import BookHelper from "../../utils/BookHelper";
import BookValidation from "../../utils/BookValidation";

function BookItem({ book, onDelete, onEdit }) {
  //edit mode
  const [isEditing, setIsEditing] = useState(false);

  //edited book data
  const [editedBook, setEditedBook] = useState({ ...book });

  //error
  const [errors, setErrors] = useState({
    title: "",
    author: "",
    rating: "",
  });

  //handle edit button func
  const handleEdit = () => {
    setEditedBook({ ...book });
    setErrors({
      title: "",
      author: "",
      rating: "",
    });
    setIsEditing(true);
  };

  //status change
  const handleStatusChange = (e) => {
    const value = e.target.value;

    setEditedBook({
      ...editedBook,
      status: value,
      rating: value === "finished" ? editedBook.rating : "",
    });

    if (value !== "finished") {
      setErrors({
        ...errors,
        rating: "",
      });
    }
  };

  //save
 const handleSave = () => {
  const newErrors = BookValidation(editedBook);

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) return;

  const validBook = BookHelper(editedBook);

  onEdit(validBook);

  setIsEditing(false);

  setErrors({
    title: "",
    author: "",
    rating: "",
  });
};

  // cancel
  const handleCancel = () => {
    setEditedBook({ ...book });

    setErrors({
      title: "",
      author: "",
      rating: "",
    });
    setIsEditing(false);
  };

  //sync editedBook with updated props
  useEffect(() => {
    setEditedBook({ ...book });
  }, [book]);

  return (
    <div id="book-item">
      {isEditing ? (
        // edit mode
        <>
          {/* edit title  */}
          <div>
            <label htmlFor="edit-title">Title</label>

            <input
              type="text"
              id="edit-title"
              value={editedBook.title}
              onChange={(e) => {
                setEditedBook({
                  ...editedBook,
                  title: e.target.value,
                });

                // Clear the error as the user types
                if (errors.title) {
                  setErrors({
                    ...errors,
                    title: "",
                  });
                }
              }}
            />

            {errors.title && <p className="error">{errors.title}</p>}
          </div>

          {/* edit author  */}
          <div>
            <label htmlFor="edit-author">Author</label>

            <input
              type="text"
              id="edit-author"
              value={editedBook.author}
              onChange={(e) => {
                setEditedBook({
                  ...editedBook,
                  author: e.target.value,
                });

                // Clear the error as the user types
                if (errors.author) {
                  setErrors({
                    ...errors,
                    author: "",
                  });
                }
              }}
            />

            {errors.author && <p className="error">{errors.author}</p>}
          </div>

          {/* status  */}
          <div>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={editedBook.status}
              onChange={handleStatusChange}
            >
              <option value="to-read">To Read</option>
              <option value="reading">Reading</option>
              <option value="finished">Finished</option>
            </select>
          </div>

          {/* rating  */}
          <div>
            <label htmlFor="rating">Rating</label>

            <select
              id="rating"
              value={editedBook.rating}
              disabled={editedBook.status !== "finished"}
              onChange={(e) => {
                setEditedBook({
                  ...editedBook,
                  rating: e.target.value,
                });

                if (errors.rating) {
                  setErrors({
                    ...errors,
                    rating: "",
                  });
                }
              }}
            >
              <option value="">Select Rating</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
            {errors.rating && <p className="error">{errors.rating}</p>}
          </div>

          <div className="btn-container">
            <button className="btn" onClick={handleSave}>
              Save
            </button>
            <button className="btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        // display mode
        <div id="details">
          {/* title  */}
          <h3 id="book-title">{book.title}</h3>
          {/* author  */}
          <p id="book-author">{book.author}</p>
          {/* status  */}
          <p id="book-status">Status: {book.status}</p>
          {/* rating  */}
          <p>Rating: {book.status === "finished" ? book.rating || "-" : "-"}</p>

          <div className="btn-container">
            <button className="edit-btn" onClick={handleEdit}>
              Edit
            </button>
            {/* delete  */}
            <button className="delete-btn" onClick={() => onDelete(book.id)}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookItem;
