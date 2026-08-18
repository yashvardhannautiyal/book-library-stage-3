const BookValidation = (book) => {
  const errors = {};

  if (book.title.trim() === "") {
    errors.title = "Title is required";
  }

  if (book.author.trim() === "") {
    errors.author = "Author is required";
  }

  if (book.status === "finished" && book.rating.trim() === "") {
    errors.rating = "Rating is required for finished books.";
  }

  return errors;
};

export default BookValidation;