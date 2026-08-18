import { useState } from "react";
import "./AddBookForm.css";
import BookHelper from "../../utils/BookHelper";
import BookValidation from "../../utils/BookValidation";

function AddBookForm({ onAddBook }) {
  //   user data change
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("to-read");
  const [rating, setRating] = useState("");

  //error
  const [errors, setErrors] = useState({
    title: "",
    author: "",
    rating: "",
  });

  //   status change
  const handleStatusChange = (e) => {
  const value = e.target.value;
  setStatus(value);

  if (value !== "finished") {
    setRating("");

    setErrors((prevErrors) => ({
      ...prevErrors,
      rating: "",
    }));
  }
};

  //   submit button
  const handleSubmit = (e) => {
  e.preventDefault();

  //creates a newBook object
  const newBook = {
    id: Date.now(),
    title: title.trim(),
    author: author.trim(),
    status,
    rating,
  };

  //check for error in the newBook with help of BookValidation helper function
  const newErrors = BookValidation(newBook);

  //sets new errors that are or not found
  setErrors(newErrors);

  
  if (Object.keys(newErrors).length > 0) return;

  const validBook = BookHelper(newBook);

  onAddBook(validBook);

  setTitle("");
  setAuthor("");
  setStatus("to-read");
  setRating("");

  setErrors({
    title: "",
    author: "",
    rating: "",
  });
};
  return (
    <div id="form-component">
      <div id="heading-container">
        {/* heading  */}
        <h1 id="heading">Book Library</h1>
        <p id="heading-text">
          Keep track of what you want to read, what you're reading, and what you
          finished.
        </p>
      </div>

      {/* form  */}
      <div id="form-container">
        <h4>ADD A BOOK</h4>

        <form onSubmit={handleSubmit}>
          {/* title  */}
          <div>
            <label>TITLE</label>
            <input
              type="text"
              placeholder="book title"
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);

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
          {/* author  */}
          <div>
            <label>AUTHOR</label>
            <input
              type="text"
              placeholder="author's name"
              id="author"
              value={author}
              onChange={(e) => {
                setAuthor(e.target.value);

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
            <label htmlFor="status">STATUS</label>
            <select id="status" value={status} onChange={handleStatusChange}>
              <option value="to-read">To Read</option>
              <option value="reading">Reading</option>
              <option value="finished">Finished</option>
            </select>
          </div>
          {/* rating  */}
          <div>
            <label htmlFor="rating">RATING</label>
            <select
              id="rating"
              value={rating}
              disabled={status !== "finished"}
              onChange={(e) => {
                setRating(e.target.value);

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

          <button type="submit">Add Book</button>
        </form>
      </div>
    </div>
  );
}

export default AddBookForm;
