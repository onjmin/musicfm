<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>おぉんがくぷれぃやああ</title>
        <style>
            body {
                margin: 0;
                height: 100vh;
                background: linear-gradient(135deg, #0f0f0f, #1c1c1c);
                color: white;
                font-family: "Segoe UI", sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                overflow: hidden;
            }

            h1 {
                font-size: 3rem;
                margin-bottom: 40px;
                text-shadow: 0 0 20px #00ffff88;
                animation: glow 2s infinite alternate;
            }

            @keyframes glow {
                from {
                    text-shadow: 0 0 10px #00ffff44;
                }
                to {
                    text-shadow:
                        0 0 40px #00ffff,
                        0 0 60px #00ffff88;
                }
            }

            button {
                font-size: 5rem;
                padding: 1em 2em;
                border: none;
                border-radius: 50%;
                background: radial-gradient(circle at center, #00ffcc, #006666);
                color: black;
                font-weight: bold;
                cursor: pointer;
                box-shadow:
                    0 0 30px #00ffccaa,
                    0 0 60px #00ffcc66;
                transition:
                    transform 0.2s ease,
                    box-shadow 0.2s ease;
            }

            button:hover {
                transform: scale(1.1);
                box-shadow:
                    0 0 40px #00ffcc,
                    0 0 80px #00ffcc88;
            }

            audio {
                display: none;
            }
        </style>
    </head>
    <body>
        <h1>おぉんがくぷれぃやああ</h1>
        <button id="playBtn">▶</button>
        <audio id="player" src="your-music.mp3"></audio>

        <script>
            const btn = document.getElementById("playBtn");
            const audio = document.getElementById("player");

            btn.addEventListener("click", () => {
                if (audio.paused) {
                    audio.play();
                    btn.textContent = "⏸";
                } else {
                    audio.pause();
                    btn.textContent = "▶";
                }
            });
        </script>
    </body>
</html>
