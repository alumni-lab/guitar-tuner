import React, { useState } from "react";

const Note = ({ note, pitch }) => {
  return (
    <div>
      <div className="pitch">
        <span id="pitch">frequency: {pitch}</span>Hz
      </div>
      <div className="note">
        <span id="note">Note: {note}</span>
      </div>
    </div>
  );
};

export default Note;
