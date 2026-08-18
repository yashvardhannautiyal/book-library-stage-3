import { useState, useEffect } from "react";
import AddBookForm from "./components/AddBookForm/AddBookForm.jsx";
import BookList from "./components/BookList/BookList.jsx";
import Summary from "./components/Summary/Summary.jsx";
import SearchFilter from "./components/SearchFilter/SearchFilter.jsx";
import BookHelper from "./utils/BookHelper.js";


function App() {
  const [books, setBooks] = useState(() => {
  const savedBooks = localStorage.getItem("books");
  
  // does not save in local storage if not a saved book
  if (!savedBooks) return [];

  return JSON.parse(savedBooks).map((book) => BookHelper(book));
});

  //save books to local storage
  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  }, [books]);

  //add new book
  const handleAddBook = (newBook) => {
    setBooks((prevBooks) => [...prevBooks, newBook]);
  };

  //delete book
  const handleDelete = (id) => {
    setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
  };

  // edit books
  const handleEdit = (updatedBook) => {
    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.id === updatedBook.id ? updatedBook : book,
      ),
    );
  };

  // ---------------------SEARCH----------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  //filter
  const filteredBooks = books.filter((book) => {
    // Search
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());

    // Status
    const matchesStatus =
      statusFilter === "all" || book.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // -----------------------------summary count-----------------------
  const toReadCount = books.filter(
    (e) => e.status === "to-read"
  ).length;

  const readingCount = books.filter(
    (e) => e.status === "reading"
  ).length;

  const finishedCount = books.filter(
    (e) => e.status === "finished"
  ).length

  // for average rating 
  const finishedBooks = books.filter((book) => {
  const rating = Number(book.rating);

  return (
    book.status === "finished" &&
    !isNaN(rating) &&
    rating >= 1 &&
    rating <= 5
  );
});

  const averageRating = 
        finishedBooks.length > 0 ? 
        (
          finishedBooks.reduce(
            (sum, book) => sum + Number(book.rating),
            0
          ) / finishedBooks.length
        ).toFixed(1)
        : 0;

  return (
    <div>
      {/* form */}
      <AddBookForm onAddBook={handleAddBook} />

      {/* summary */}
      <Summary  
      toReadCount={toReadCount}
      readingCount = {readingCount}
      finishedCount = {finishedCount}
      averageRating = {averageRating} />

      {/* search filter  */}
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* booklist  */}
      <BookList
        books={filteredBooks}
        onDelete={handleDelete}
        onEdit={handleEdit}
        totalBooks = {books.length}
      />
    </div>
  );
}

export default App;
