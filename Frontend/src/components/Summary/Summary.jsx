import React from "react";
import "./Summary.css";

function Summary({ toReadCount, readingCount, finishedCount, averageRating }) {
  return (
    <div id="main-container">
      {/* heading container  */}
      <div id="heading-container">
        <p>SUMMARY</p>
      </div>

      {/* summary container  */}
    <div id="summary-container">
      <div className="count-container">
        <h3>To read</h3>
        <p>{toReadCount}</p>
      </div>
      <div className="count-container">
        <h3>Reading</h3>
        <p>{readingCount}</p>
      </div>
      <div className="count-container">
        <h3>Finished</h3>
        <p>{finishedCount}</p>
      </div>
      <div className="count-container">
        <h3>Average rating</h3>
        <p>{averageRating}</p>
      </div>
    </div>
    </div>
  );
}

export default Summary;
