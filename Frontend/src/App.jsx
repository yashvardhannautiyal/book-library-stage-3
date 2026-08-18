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
const migrateBooks = (books) => {
  return books.map((book) => {
    //accepts book array completely
    if (!book.status) {
      return BookHelper(book);
    }

    const { status, ...rest } = book;

    return BookHelper({
      ...rest,
      shelfId: status,
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

  //-----------------shelf management----------------
  // create a new shelf
  const handleCreateShelf = (shelfName) => {
    const newShelf = {
      id: Date.now().toString(),
      name: shelfName.trim(),
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
    setShelves((prev) => 
    prev.filter((shelf) => shelf.id !== shelfId) //filters only those books which are != the shelf we are deleting
  )
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

  const finishedCount = books.filter((e) => e.shelfId === "finished").length;

  // for average rating
  const finishedBooks = books.filter((book) => {
    const rating = Number(book.rating);

    return (
      book.shelfId === "finished" &&
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
        onDeleteShelf = {handleDeleteShelf}
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
