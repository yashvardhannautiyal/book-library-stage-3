import React from "react";
import "./SearchFilter.css";

function SearchFilter({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div id="main-container">
      {/* heading container  */}
      <div id="heading-container">
        <p>SEARCH & FILTER</p>
      </div>

      {/* search-filter container  */}
      <div id="search-filter">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="to-read">To Read</option>
          <option value="reading">Reading</option>
          <option value="finished">Finished</option>
        </select>
      </div>
    </div>
  );
}

export default SearchFilter;
