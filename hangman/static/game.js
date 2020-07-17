var socket = io();
socket.on('connect', function () {
  console.log('Joined the game!');
  socket.emit('fetch game state');
});

function Game() {
  const [chancesLeft, setChancesLeft] = React.useState(10);

  React.useEffect(() => {
    document.addEventListener('keyup', handleKeyUp);
    return () => document.removeEventListener('keyup', handleKeyUp);
  });

  function handleKeyUp() {
    setChancesLeft(c => c - 1);
  }

  const word = 'elephant';
  const letters = ['a', 'b', 'c', 'e', 'p', 'n'];

  return (
    <div className="game">
      <Drawing chancesLeft={chancesLeft} />
      <Word word={word} letters={letters} />
      <WrongLetters word={word} letters={letters} />
    </div>
  );
}

function Drawing({ chancesLeft }) {
  return (
    <div className="drawing">
      <h1 className="heading">{chancesLeft}</h1>
    </div>
  );
}

function Word({ word, letters }) {
  return (
    <div className="word">
      {word.split('').map((letter, idx) => (
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

function WrongLetters({ word, letters }) {
  return (
    <div className="wrong-letters">
      {letters.map(
        (letter, idx) =>
          !word.split('').includes(letter) && (
            <Letter letter={letter} wrong={true} key={idx} />
          )
      )}
    </div>
  );
}

ReactDOM.render(<Game />, document.getElementById('game'));
