from flask import Blueprint, g, session
from flask_socketio import ConnectionRefusedError

from hangman import socketio
from hangman.auth import check_players_left, load_player
from hangman.db import get_db

bp = Blueprint('game', __name__)


@socketio.on('connect')
def connect():
    load_player()

    if g.player is None:
        raise ConnectionRefusedError()

    db = get_db()
    db.execute(
        'UPDATE player SET active = 1'
        ' WHERE id = ?', (g.player['id'],)
    )
    db.commit()
    print(f"Player '{g.player['username']}' is active.")


@socketio.on('fetch game state')
def handle_fetch_game_state():
    db = get_db()
    players = db.execute(
        'SELECT COUNT(id) FROM player'
    ).fetchone()[0]

    # Check if the game has already started
    if players == 1:
        print('start game')
    #     cursor = db.execute('INSERT INTO game VALUES (NULL)')
    #     db.commit()
    #     session['game_id'] = cursor.lastrowid
    elif players > 1:
        print('join game')

    # Send game state


@socketio.on('disconnect')
def disconnect():
    load_player()

    if g.player is not None:
        db = get_db()
        db.execute(
            'UPDATE player SET active = 0'
            ' WHERE id = ?', (g.player['id'],)
        )
        db.commit()
        print(f"Player '{g.player['username']}' is inactive.")

    check_players_left()
