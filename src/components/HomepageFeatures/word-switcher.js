import React, { useState, useEffect, useRef } from 'react';

const WordSwitcher = ({ wordsList, interval = 2000, originalSentence }) => {
  const [maxWordWidth, setMaxWordWidth] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const maxLen = Math.max(...wordsList.map((word) => word.length));
    const maxWordWidth = maxLen;
    setMaxWordWidth(maxWordWidth);

    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) =>
        prevIndex === wordsList.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(intervalId);
  }, [wordsList, interval]);

  return (
    <div style={{ textAlign: 'centre' }}>
      <div
        style={{
          display: 'inline-block',
          maxWidth: maxWordWidth,
          textAlign: 'center',
        }}
      >
        <span style={{ whiteSpace: 'nowrap' }}>{originalSentence}</span>
        <span
          style={{
            whiteSpace: 'nowrap',
            transition: 'opacity 0.5s ease',
            opacity: currentWordIndex !== 0 ? 1 : 0,
            display: 'inline-block',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {wordsList[currentWordIndex]}
        </span>
      </div>
    </div>
  );
};

export default WordSwitcher;
