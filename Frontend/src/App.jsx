import { useState, useEffect } from "react";
import AddBookForm from "./components/AddBookForm/AddBookForm.jsx";
import BookList from "./components/BookList/BookList.jsx";
import Summary from "./components/Summary/Summary.jsx";
import SearchFilter from "./components/SearchFilter/SearchFilter.jsx";
import BookHelper from "./utils/BookHelper.js";

// starter shelves
const STARTER_SHELVES = [
  {
    id: "to-read",
    name: "To Read",
  },
  {
    id: "reading",
    name: "Reading",
  },
  {
    id: "finished",
    name: "Finished",
  },
];

//migrate(convert) status value as shelfId
const migrateBooks = (book) => {
  const { status, ...newShelf } = book;

  return {
    ...newShelf,
    shelfId: status,
  };
};

function App() {
  // shelves state
  const [shelves, setShelves] = useState(() => {
    const savedShelves = localStorage.getItem("shelves");

    if (!savedShelves) {
      return STARTER_SHELVES;
    }

    return JSON.parse(savedShelves);
  });

  //save shelves to localstorage
  useEffect(() => {
    localStorage.setItem("shelves", JSON.stringify(shelves));
  }, [shelves]);

  //takes the book from books with status and migrate books to shelf (then remove status and add shelfID)
  const [books, setBooks] = useState(() => {
    const savedBooks = localStorage.getItem("books");

    if (!savedBooks) return [];

    const parsedBooks = JSON.parse(savedBooks);

    return parsedBooks.map((e) => {
      if (e.status) {
        return BookHelper(migrateBookToShelf(e));
      }

      return BookHelper(e);
    });
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
  const toReadCount = books.filter((e) => e.status === "to-read").length;

  const readingCount = books.filter((e) => e.status === "reading").length;

  const finishedCount = books.filter((e) => e.status === "finished").length;

  // for average rating
  const finishedBooks = books.filter((book) => {
    const rating = Number(book.rating);

    return (
      book.status === "finished" && !isNaN(rating) && rating >= 1 && rating <= 5
    );
  });

  const averageRating =
    finishedBooks.length > 0
      ? (
          finishedBooks.reduce((sum, book) => sum + Number(book.rating), 0) /
          finishedBooks.length
        ).toFixed(1)
      : 0;

  return (
    <div>
      {/* form */}
      {/* pass shelves as prop so that AddBookForm can access the shelves */}
      <AddBookForm onAddBook={handleAddBook}
      shelves = {shelves} />

      {/* summary */}
      <Summary
        toReadCount={toReadCount}
        readingCount={readingCount}
        finishedCount={finishedCount}
        averageRating={averageRating}
      />

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
        totalBooks={books.length}
        shelves={shelves}
      />
    </div>
  );
}

export default App;
