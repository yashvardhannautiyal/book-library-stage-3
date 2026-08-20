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
const migrateBooks = (books, finishedShelfId) => {
  const statusToShelfId = {
    "To Read": "to-read",
    Reading: "reading",
    Finished: "finished",
  };

  return books.map((book) => {
    if (!book.status) {
      return BookHelper({
        ...book,
        finishedAt: book.finishedAt ?? null,
      },
    finishedShelfId);
    }

    const { status, ...rest } = book;

    const shelfId = statusToShelfId[status];

    return BookHelper({
      ...rest,
      shelfId,
      finishedAt: shelfId === finishedShelfId ? (book.finishedAt ?? null) : null,
    }, finishedShelfId);
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

  //checks the finished shelf
  const finishedShelf = shelves.find((shelf) => shelf.isFinishedShelf);

  //optional chaining - "?"
  //only try to acces ".id" id "finishedShelf" actually exists
  //will not shrow error if we try to access .id of undefined
  //instead of crashing it becomes "undefined"
  const finishedShelfId = finishedShelf?.id;


  //takes the book from books with status and migrate books to shelf (then remove status and add shelfID)
  const [books, setBooks] = useState(() => {
    const savedBooks = localStorage.getItem("books");

    if (!savedBooks) {
      return [];
    }

    const parsedBooks = JSON.parse(savedBooks);

    const needsMigration = parsedBooks.some((book) => book.status);

    if (needsMigration) {
      return migrateBooks(parsedBooks, finishedShelfId);
    }

    return parsedBooks.map((book) =>
      BookHelper({
        ...book,
        finishedAt: book.finishedAt ?? null,
      },
    finishedShelfId),
    );
  });

  //save books to local storage
  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  }, [books]);

  //add new book
  const handleAddBook = (newBook) => {
    const targetShelf = shelves.find((shelf) => shelf.id === newBook.shelfId);

    const bookFinishDate = {
      ...newBook,
      finishedAt: targetShelf?.isFinishedShelf
        ? new Date().toISOString()
        : null,
    };

    setBooks((prevBooks) => [...prevBooks, bookFinishDate]);
  };

  //delete book
  const handleDelete = (id) => {
    setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
  };

  // edit books
  const handleEdit = (updatedBook) => {
    setBooks((prevBooks) =>
      prevBooks.map((book) => {
        if (book.id !== updatedBook.id) {
          return book;
        }

        // older version of shelf
        const oldShelf = shelves.find((shelf) => shelf.id === book.shelfId);

        //updated version of shelf
        const newShelf = shelves.find(
          (shelf) => shelf.id === updatedBook.shelfId,
        );

        //check if shelf was finished
        const wasFinished = oldShelf?.isFinishedShelf === true;
        const isFinished = newShelf?.isFinishedShelf === true;

        let finishedAt = book.finishedAt ?? null;

        // Moving INTO finished shelf
        if (!wasFinished && isFinished) {
          finishedAt = new Date().toISOString();
        }

        // Moving OUT OF finished shelf
        if (wasFinished && !isFinished) {
          finishedAt = null;
        }

        return {
          ...updatedBook,
          finishedAt,
        };
      }),
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

  
  //delete a shelf
  const handleDeleteShelf = (shelfId, destination) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.shelfId === shelfId ? { ...book, shelfId: destination } : book,
      ),
    );

    setShelves((prev) => prev.filter((shelf) => shelf.id !== shelfId));
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

  const finishedCount = books.filter(
    (e) => e.shelfId === finishedShelfId,
  ).length;

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

  //-----------finished this year----------------
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const finishedThisYear = books.filter((book) => {
    if (!book.finishedAt) {
      return false;
    }

    const finishedYear = new Date(book.finishedAt).getFullYear();

    return finishedYear === selectedYear;
  }).length;

  const booksPerShelf = shelves.map((shelf) => ({
    shelfId: shelf.id,
    shelfName: shelf.name,
    count: books.filter((book) => book.shelfId === shelf.id).length,
  }));

  // ------------yearly goal -------------------
  const [yearlyGoal, setYearlyGoal] = useState(() => {
    const savedGoal = localStorage.getItem("yearlyGoal");

    if (!savedGoal) {
      return 12;
    }

    const parsedGoal = Number(savedGoal);

    return Number.isFinite(parsedGoal) && parsedGoal >= 0 ? parsedGoal : 12;
  });

  // update and save every time yearly goal changes
  useEffect(() => {
    localStorage.setItem("yearlyGoal", String(yearlyGoal));
  }, [yearlyGoal]);

  //--------------goal percentage-----------------
  const goalPercentage =
    yearlyGoal > 0
      ? Math.min(100, Math.round((finishedThisYear / yearlyGoal) * 100))
      : 0;

  //-----------------PAGINATION------------
  const [currentPage, setCurrentPage] = useState(1);

  const BOOKS_PER_PAGE = 5;

  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);

  const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;

  const paginatedBooks = filteredBooks.slice(
    startIndex,
    startIndex + BOOKS_PER_PAGE,
  );

  // reset pages when filtering change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, shelfFilter]);

  return (
    <div>
      {/* form */}
      <AddBookForm onAddBook={handleAddBook} shelves={shelves} />
    {/* pass shelves as prop so that AddBookForm can access the shelves */}

      <ShelfManagement
        shelves={shelves}
        onCreateShelf={handleCreateShelf}
        onRenameShelf={handleRenameShelf}
        onDeleteShelf={handleDeleteShelf}
        onSetFinishedShelf={handleSetFinishedShelf}
      />
      {/* summary */}
      <Summary
        booksPerShelf={booksPerShelf}
        finishedThisYear={finishedThisYear}
        averageRating={averageRating}
        yearlyGoal={yearlyGoal}
        goalPercentage={goalPercentage}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        setYearlyGoal={setYearlyGoal}
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
        books={paginatedBooks}
        onDelete={handleDelete}
        onEdit={handleEdit}
        totalBooks={books.length}
        shelves={shelves}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default App;
