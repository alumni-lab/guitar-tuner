import React from "react";

const Note = ({ note, pitch }) => {
  return (
    <>
      <div className="note">{note}</div>
      <div className="pitch">{pitch} Hz</div>
    </>
  );
};

export default Note;
