function useAPI() {
  const [webSocket, setWebSocket] = React.useState(null);
  const [gameState, setGameState] = React.useState(null);

  React.useEffect(() => {
    const socket = io();
    // const socket = io(`ws://${window.location.host}/game`);
    setWebSocket(socket);

    socket.on('connect_error', error => {
      console.error('Failed to connect WebSocket :(', error);
    });

    socket.on('connect', () => socket.emit('fetch game state'));

    socket.on('game state', state => {
      if (state.winner !== undefined) {
        setGameState(oldState => ({ ...oldState, winner: state.winner }));
        setTimeout(() => setGameState({ ...state, winner: undefined }), 3000);
      } else {
        setGameState(state);
      }
    });

    socket.on('error', error => {
      console.error('WebSocket error :(', error);
    });

    return () => socket.close();
  }, []);

  function tryLetter(letter) {
    webSocket.emit('try letter', letter);
  }

  return { gameState, tryLetter };
}
