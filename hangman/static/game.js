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
  const [WIDTH, HEIGHT, THICK] = [400, 300, 6];
  const canvasRef = React.useRef();
  const [context, setContext] = React.useState();

  React.useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    setContext(ctx);
    drawGallows(ctx);
  }, []);

  function drawGallows(ctx) {
    ctx.lineWidth = THICK;

    ctx.moveTo(WIDTH, HEIGHT - THICK / 2);
    ctx.lineTo(0.66 * WIDTH, HEIGHT - THICK / 2);
    ctx.stroke();

    ctx.moveTo(0.83 * WIDTH, HEIGHT - THICK / 2);
    ctx.lineTo(0.83 * WIDTH, 0.2 * HEIGHT - THICK / 2);
    ctx.stroke();

    ctx.moveTo(0.83 * WIDTH, HEIGHT - THICK / 2);
    ctx.lineTo(0.83 * WIDTH, 0.2 * HEIGHT);
    ctx.stroke();

    ctx.lineTo(0.5 * WIDTH + THICK / 4, 0.2 * HEIGHT);
    ctx.stroke();

    ctx.lineWidth = THICK / 2;
    ctx.moveTo(0.5 * WIDTH + THICK / 2, 0.2 * HEIGHT);
    ctx.lineTo(0.5 * WIDTH + THICK / 2, 0.4 * HEIGHT);
    ctx.stroke();
  }

  React.useEffect(() => {
    drawFunctionMap[chancesLeft]();
  }, [chancesLeft]);

  const drawFunctionMap = {
    6: reset,
    5: drawHead,
    4: drawTorso,
    3: () => drawLimb('left', false),
    2: () => drawLimb('right', false),
    1: () => drawLimb('left', true),
    0: () => drawLimb('right', true),
  };

  function reset() {
    if (context) {
      context.clearRect(0, 0, WIDTH, HEIGHT);
      context.beginPath();
      drawGallows(context);
    }
  }

  function drawHead() {
    context.beginPath();
    context.arc(
      0.5 * WIDTH + THICK / 2,
      0.45 * HEIGHT,
      0.05 * HEIGHT,
      0,
      2 * Math.PI
    );
    context.stroke();
  }

  function drawTorso() {
    context.moveTo(0.5 * WIDTH + THICK / 2, 0.5 * HEIGHT);
    context.lineTo(0.5 * WIDTH + THICK / 2, 0.7 * HEIGHT);
    context.stroke();
  }

  function drawLimb(side, leg) {
    context.moveTo(
      0.5 * WIDTH + THICK / 2,
      0.5 * HEIGHT + (leg ? 0.2 * HEIGHT : 0)
    );
    context.lineTo(
      0.5 * WIDTH + THICK / 2 + (side === 'left' ? -1 : 1) * 20,
      0.7 * HEIGHT + (leg ? 0.2 * HEIGHT : 0)
    );
    context.stroke();
  }

  return (
    <div className="drawing">
      <canvas
        id="canvas"
        width={WIDTH}
        height={HEIGHT}
        ref={canvasRef}
      ></canvas>
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
    color: '#940000',
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
