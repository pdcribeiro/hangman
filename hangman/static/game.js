function Game() {
  const { gameState, tryLetter } = useAPI();

  React.useEffect(() => {
    document.addEventListener('keyup', handleKeyUp);
    return () => document.removeEventListener('keyup', handleKeyUp);
  });

  function handleKeyUp(event) {
    if (
      event.keyCode >= 65 &&
      event.keyCode <= 90 &&
      (gameState === undefined || gameState.winner === undefined)
    ) {
      tryLetter(event.key.toUpperCase());
    }
  }

  return (
    gameState && (
      <React.Fragment>
        <Drawing chancesLeft={gameState.chances} />
        <Word gameState={gameState} />
        <WrongLetters gameState={gameState} />
        {gameState.winner !== undefined && (
          <GameOver winner={gameState.winner} />
        )}
      </React.Fragment>
    )
  );
}

function Drawing({ chancesLeft }) {
  return (
    <div className="drawing">
      <h1 className="heading">{chancesLeft}</h1>
    </div>
  );
}

function Word({ gameState: { word, letters } }) {
  return (
    <div className="word">
      {word.map((letter, idx) => (
        <Letter
          letter={letters.includes(letter) ? letter : '\u00A0'}
          key={idx}
        />
      ))}
    </div>
  );
}

function Letter({ letter, wrong }) {
  const styleWrong = {
    textDecoration: 'line-through',
    color: 'red',
  };

  return (
    <span className="letter" style={wrong && styleWrong}>
      {letter}
    </span>
  );
}

function WrongLetters({ gameState: { word, letters } }) {
  return (
    <div className="wrong-letters">
      {letters.map(
        (letter, idx) =>
          !word.includes(letter) && (
            <Letter letter={letter} wrong={true} key={idx} />
          )
      )}
    </div>
  );
}

function GameOver({ winner }) {
  return (
    <div className="gameover">
      {winner && <span className="winner">'{winner}'</span>}
      {winner ? '\u00A0is the winner!' : 'Better luck next time!'}
    </div>
  );
}

ReactDOM.render(<Game />, document.getElementById('game'));
