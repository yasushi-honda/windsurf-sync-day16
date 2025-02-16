import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import styles from '../styles/Tetris.module.css';

// テトリミノの形状とカラー定義
const TETROMINOS = {
  0: { shape: [[0]], color: '0, 0, 0' },
  I: {
    shape: [
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0]
    ],
    color: '80, 227, 230',
  },
  J: {
    shape: [
      [0, 'J', 0],
      [0, 'J', 0],
      ['J', 'J', 0]
    ],
    color: '36, 95, 223',
  },
  L: {
    shape: [
      [0, 'L', 0],
      [0, 'L', 0],
      [0, 'L', 'L']
    ],
    color: '223, 173, 36',
  },
  O: {
    shape: [
      ['O', 'O'],
      ['O', 'O'],
    ],
    color: '223, 217, 36',
  },
  S: {
    shape: [
      [0, 'S', 'S'],
      ['S', 'S', 0],
      [0, 0, 0]
    ],
    color: '48, 211, 56',
  },
  T: {
    shape: [
      [0, 0, 0],
      ['T', 'T', 'T'],
      [0, 'T', 0]
    ],
    color: '132, 61, 198',
  },
  Z: {
    shape: [
      ['Z', 'Z', 0],
      [0, 'Z', 'Z'],
      [0, 0, 0]
    ],
    color: '227, 78, 78',
  },
};

// ランダムなテトリミノを生成
const randomTetromino = () => {
  const tetrominos = 'IJLOSTZ';
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOS[randTetromino];
};

// 初期のゲームステージを作成
const createStage = () => 
  Array.from(Array(20), () => Array(10).fill([0, 'clear']));

// 衝突検出
const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
      // 1. テトリミノのセルをチェック
      if (player.tetromino[y][x] !== 0) {
        if (
          // 2. 移動が画面内に収まっているかチェック
          !stage[y + player.pos.y + moveY] ||
          !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
          // 3. 移動先のセルが'clear'でないかチェック
          stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear'
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

export default function Tetris() {
  const [dropTime, setDropTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOS[0].shape,
    collided: false,
  });
  const [stage, setStage] = useState(createStage());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [rows, setRows] = useState(0);

  // ステージの更新
  const updateStage = useCallback(() => {
    const newStage = stage.map(row =>
      row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
    );

    // プレイヤーのテトリミノを描画
    player.tetromino.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newStage[y + player.pos.y][x + player.pos.x] = [
            value,
            `${player.collided ? 'merged' : 'clear'}`,
          ];
        }
      });
    });

    // 衝突チェック
    if (player.collided) {
      resetPlayer();
      return sweepRows(newStage);
    }

    return newStage;
  }, [player]);

  // 行の削除
  const sweepRows = useCallback(newStage => {
    const sweepedStage = newStage.reduce((acc, row) => {
      if (row.findIndex(cell => cell[0] === 0) === -1) {
        setRows(prev => prev + 1);
        setScore(prev => prev + (level * 100));
        acc.unshift(new Array(newStage[0].length).fill([0, 'clear']));
        return acc;
      }
      acc.push(row);
      return acc;
    }, []);

    return sweepedStage;
  }, [level, setScore]);

  // プレイヤーの移動
  const movePlayer = dir => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      setPlayer(prev => ({
        ...prev,
        pos: { x: prev.pos.x + dir, y: prev.pos.y },
      }));
    }
  };

  // テトリミノの回転
  const rotate = matrix => {
    const rotated = matrix.map((_, index) =>
      matrix.map(col => col[index]).reverse()
    );
    return rotated;
  };

  const rotatePlayer = dir => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino = rotate(clonedPlayer.tetromino);

    // 回転後の位置調整
    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino[0].length) {
        rotate(clonedPlayer.tetromino);
        clonedPlayer.pos.x = pos;
        return;
      }
    }

    setPlayer(clonedPlayer);
  };

  // ドロップの処理
  const drop = () => {
    // レベルアップ
    if (rows > level * 10) {
      setLevel(prev => prev + 1);
      setDropTime(1000 / level);
    }

    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      setPlayer(prev => ({
        ...prev,
        pos: { x: prev.pos.x, y: prev.pos.y + 1 },
        collided: false,
      }));
    } else {
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
      }
      setPlayer(prev => ({
        ...prev,
        collided: true,
      }));
    }
  };

  // キー入力の処理
  const move = ({ keyCode }) => {
    if (!gameOver) {
      if (keyCode === 37) {
        movePlayer(-1);
      } else if (keyCode === 39) {
        movePlayer(1);
      } else if (keyCode === 40) {
        drop();
      } else if (keyCode === 38) {
        rotatePlayer(1);
      }
    }
  };

  // プレイヤーのリセット
  const resetPlayer = useCallback(() => {
    setPlayer({
      pos: { x: stage[0].length / 2 - 2, y: 0 },
      tetromino: randomTetromino().shape,
      collided: false,
    });
  }, []);

  // ゲームの開始
  const startGame = () => {
    setStage(createStage());
    setDropTime(1000);
    resetPlayer();
    setScore(0);
    setLevel(1);
    setRows(0);
    setGameOver(false);
  };

  useEffect(() => {
    let dropInterval;
    if (dropTime) {
      dropInterval = setInterval(() => {
        drop();
      }, dropTime);
    }
    return () => {
      clearInterval(dropInterval);
    };
  }, [dropTime, drop]);

  useEffect(() => {
    const updatedStage = updateStage();
    setStage(updatedStage);
  }, [updateStage]);

  useEffect(() => {
    document.addEventListener('keydown', move);
    return () => {
      document.removeEventListener('keydown', move);
    };
  }, [move]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Modern Tetris</title>
        <meta name="description" content="A modern implementation of Tetris" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.tetrisWrapper}>
        <div className={styles.tetris}>
          <div className={styles.display}>
            {gameOver ? (
              <div className={styles.gameOver}>
                <h2>Game Over</h2>
                <p>Score: {score}</p>
                <button onClick={startGame}>New Game</button>
              </div>
            ) : (
              <div className={styles.stats}>
                <div className={styles.score}>
                  <h2>Score</h2>
                  <p>{score}</p>
                </div>
                <div className={styles.level}>
                  <h2>Level</h2>
                  <p>{level}</p>
                </div>
                <div className={styles.rows}>
                  <h2>Rows</h2>
                  <p>{rows}</p>
                </div>
                {!dropTime && (
                  <button onClick={startGame}>Start Game</button>
                )}
              </div>
            )}
          </div>
          <div className={styles.stage}>
            {stage.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className={styles.cell}
                  style={{
                    backgroundColor: cell[0] === 0 ? 'transparent' : 
                      `rgba(${TETROMINOS[cell[0]].color}, 0.8)`,
                  }}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
