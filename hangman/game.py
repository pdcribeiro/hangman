import random
from flask import Blueprint, g, session
from flask_socketio import ConnectionRefusedError, emit

from hangman import socketio
from hangman.auth import check_end_game, load_player
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

    if players == 1:
        game = start_round(new_game=True)
    else:
        game = get_game_state()

    emit('game state', game)


def start_round(new_game=False):
    db = get_db()

    if new_game:
        cursor = db.execute('INSERT INTO game DEFAULT VALUES')
        game_id = cursor.lastrowid
        session['game_id'] = game_id
    else:
        db.execute(
            'UPDATE game SET chances = 6,'
            ' letters = "",'
            ' rounds = rounds + 1'
            ' WHERE id = ?', (session['game_id'],)
        )

    word = get_word()

    db.execute(
        'INSERT INTO word (game_id, word)'
        ' VALUES (?, ?)', (session['game_id'], word)
    )
    db.commit()

    return {'word': list(word), 'chances': 6, 'letters': []}


def get_word():
    return random.choice([
        'elephant', 'giraffe', 'pig', 'bear', 'dog', 'cat'
    ]).upper()


def get_game_state():
    db = get_db()

    if 'game_id' in session:
        game = db.execute(
            'SELECT chances, letters FROM game WHERE id = ?',
            (session['game_id'],)
        ).fetchone()
    else:
        game = db.execute(
            'SELECT id, chances, letters FROM game ORDER BY id DESC'
        ).fetchone()
        session['game_id'] = game['id']

    word = db.execute(
        'SELECT word FROM word WHERE game_id = ? ORDER BY id DESC', (
            session['game_id'],)
    ).fetchone()

    return {
        'word': list(word['word']),
        'chances': game['chances'],
        'letters': list(game['letters']),
    }


@socketio.on('try letter')
def handle_try_letter(letter):
    parsed_letter = letter.upper()
    db = get_db()
    game = get_game_state()
    letters = game['letters']

    if parsed_letter not in letters:
        letters.append(parsed_letter)

        db.execute(
            'UPDATE game SET letters = ? WHERE id = ?',
            (''.join(letters), session['game_id'])
        )

        if parsed_letter not in game['word']:
            game['chances'] -= 1
            db.execute(
                'UPDATE game SET chances = ? WHERE id = ?',
                (game['chances'], session['game_id'])
            )

    db.commit()

    emit('game state', game, broadcast=True)

    load_player()
    winner = not any(
        [letter not in letters for letter in game['word']]
    ) and g.player['username']
    if winner or game['chances'] == 0:
        game = start_round()
        game['winner'] = winner or None
        emit('game state', game, broadcast=True)


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

    check_end_game()
