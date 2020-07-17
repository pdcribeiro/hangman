import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

from hangman.db import get_db

bp = Blueprint('auth', __name__)


@bp.before_app_request
def load_player():
    player_id = session.get('player_id')

    if player_id is None:
        g.player = None
    else:
        g.player = get_db().execute(
            'SELECT * FROM player WHERE id = ?', (player_id,)
        ).fetchone()
    
        # Clear invalid session.
        if g.player is None:
            session.clear()


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.player is None:
            return redirect(url_for('auth.lobby'))

        return view(**kwargs)

    return wrapped_view


@bp.route('/', methods=['GET', 'POST'])
def lobby():
    if g.player is not None:
        return redirect(url_for('auth.room'))

    db = get_db()
    
    if request.method == 'POST':
        username = request.form['username']
        error = None

        if not username:
            error = 'Please provide a username.'
        elif db.execute(
            'SELECT id FROM player WHERE username = ?', (username,)
        ).fetchone() is not None:
            error = f"Username '{username}' is already taken."

        if error is None:
            cursor = db.execute(
                'INSERT INTO player (username) VALUES (?)', (username,)
            )
            db.commit()
            session['player_id'] = cursor.lastrowid

            print(f"Player '{username}' joined the game.")
            return redirect(url_for('auth.room'))

        flash(error)

    players = db.execute(
        'SELECT COUNT(id) FROM player'
    ).fetchone()[0]

    return render_template('game/lobby.html', players=players)


@bp.route('/game', methods=['GET'])
@login_required
def room():
    return render_template('game/room.html')


@bp.route('/leave', methods=['GET'])
@login_required
def leave():
    db = get_db()
    db.execute('DELETE FROM player WHERE id = ?', (g.player['id'],))
    db.commit()

    print(f"Player '{g.player['username']}' left the game.")

    # if last player to leave or only inactive players remaining:
        # set ended field in game
        # clear player table

    return redirect(url_for('auth.lobby'))
