import React, { useState } from "react";

const Meter = ({ detune }) => {
  //make 10 scale marks rotated(with css) across -45 degree to +45 degree
  let scales = [];
  for (let i = 0; i <= 10; i++) {
    let styles = {
      transform: `rotate(${i * 9 - 45}deg)`
    };
    scales[i] = <div className="meter__scale" style={styles}></div>;
  }
  //make pointer that changes position depending on detune amount
  const pointerStyle = {
    transform: `rotate(${(detune / 50) * 45}deg)`
  };
  return (
    <div className="meter">
      {scales}
      <div className="meter__pointer" style={pointerStyle} />
    </div>
  );
};

export default Meter;
