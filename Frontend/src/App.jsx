import { useState, useEffect } from "react";
import AddBookForm from "./components/AddBookForm/AddBookForm.jsx";
import BookList from "./components/BookList/BookList.jsx";
import Summary from "./components/Summary/Summary.jsx";
import SearchFilter from "./components/SearchFilter/SearchFilter.jsx";
import BookHelper from "./utils/BookHelper.js";
import ShelfManagement from "./components/ShelfManagement/ShelfManagement.jsx";

// starter shelves
const STARTER_SHELVES = [
  {
    id: "to-read",
    name: "To Read",
    isFinishedShelf: false,
  },
  {
    id: "reading",
    name: "Reading",
    isFinishedShelf: false,
  },
  {
    id: "finished",
    name: "Finished",
    isFinishedShelf: true, //this makes only one starter shelf as finished
  },
];

//migrate(convert) status value as shelfId
const migrateBooks = (books) => {
  const statusToShelfId = {
    "To Read": "to-read",
    Reading: "reading",
    Finished: "finished",
  };

  return books.map((book) => {
    if (!book.status) {
      return BookHelper(book);
    }

    const { status, ...rest } = book;

    return BookHelper({
      ...rest,
      shelfId: statusToShelfId[status],
    });
  });
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

    if (!savedBooks) {
      return [];
    }

    const parsedBooks = JSON.parse(savedBooks);

    const needsMigration = parsedBooks.some((book) => book.status);

    if (needsMigration) {
      return migrateBooks(parsedBooks);
    }

    return parsedBooks.map((book) => BookHelper(book));
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

  //-----------------SHELF MANAGEMENT FUNCTIONS----------------
  // create a new shelf
  const handleCreateShelf = (shelfName) => {
    const newShelf = {
      id: Date.now().toString(),
      name: shelfName.trim(),
      isFinishedShelf: false,
    };

    setShelves((prevShelves) => [...prevShelves, newShelf]);
  };

  // rename an existing shelf
  const handleRenameShelf = (shelfId, newName) => {
    setShelves((prevShelves) =>
      prevShelves.map((shelf) =>
        shelf.id === shelfId ? { ...shelf, name: newName.trim() } : shelf,
      ),
    );
  };

  //handle finished shelf
  //marks a shelf as finished
  const handleSetFinishedShelf = (shelfId) => {
    setShelves((prev) =>
      prev.map((e) => ({
        ...e,
        isFinishedShelf: e.id === shelfId,
      })),
    );
  };

  //checks the finished shelf
  const finishedShelf = shelves.find((shelf) => shelf.isFinishedShelf);

  //optional chaining - "?"
  //only try to acces ".id" id "finishedShelf" actually exists
  //will not shrow error if we try to access .id of undefined
  //instead of crashing it becomes "undefined"
  const finishedShelfId = finishedShelf?.id;

  //delete a shelf
  const handleDeleteShelf = (shelfId, destination) => {
    //1. move all books from deleted shelf
    setBooks((prev) =>
      prev.map((book) =>
        book.shelfId === shelfId //finds book belonging to shelf deleting
          ? { ...book, shelfId: destination } // move books to destinition shelf
          : book,
      ),
    );

    //2. remove shelf
    setShelves(
      (prev) => prev.filter((shelf) => shelf.id !== shelfId), //filters only those books which are != the shelf we are deleting
    );
  };

  // ---------------------SEARCH----------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [shelfFilter, setShelfFilter] = useState("all");

  //filter
  const filteredBooks = books.filter((book) => {
    // Search
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());

    // match shelf
    const matchesShelf = shelfFilter === "all" || book.shelfId === shelfFilter;

    return matchesSearch && matchesShelf;
  });

  // -----------------------------summary count-----------------------
  const toReadCount = books.filter((e) => e.shelfId === "to-read").length;

  const readingCount = books.filter((e) => e.shelfId === "reading").length;

  const finishedCount = books.filter((e) => e.shelfId === finishedShelfId).length;

  // for average rating
  const finishedBooks = books.filter((book) => {
    const rating = Number(book.rating);

    return (
      book.shelfId === finishedShelfId &&
      !isNaN(rating) &&
      rating >= 1 &&
      rating <= 5
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

      <ShelfManagement
        shelves={shelves}
        onCreateShelf={handleCreateShelf}
        onRenameShelf={handleRenameShelf}
        onDeleteShelf={handleDeleteShelf}
        onSetFinishedShelf={handleSetFinishedShelf}
      />
      <AddBookForm onAddBook={handleAddBook} shelves={shelves} />

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
        shelfFilter={shelfFilter}
        setShelfFilter={setShelfFilter}
        shelves={shelves}
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
