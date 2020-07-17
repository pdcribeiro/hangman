from flask import Blueprint, g, session
from flask_socketio import ConnectionRefusedError

from hangman import socketio
from hangman.auth import load_player
from hangman.db import get_db

bp = Blueprint('game', __name__)


@socketio.on('connect')
def connect():
    print('helloooo')
    load_player()

    if g.player is None:
        raise ConnectionRefusedError()

    db = get_db()
    db.execute(
        'UPDATE player SET active = 1 WHERE id = ?', (g.player['id'],)
    )
    db.commit()
    print(f"Player '{g.player['username']}' is active")


@socketio.on('disconnect')
def disconnect():
    load_player()

    if g.player is not None:
        db = get_db()
        db.execute(
            'UPDATE player SET active = 0 WHERE id = ?', (g.player['id'],)
        )
        db.commit()
        print(f"Player '{g.player['username']}' is inactive")

    # if only inactive players remaining:
        # leave()
