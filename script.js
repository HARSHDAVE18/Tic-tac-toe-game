// ============================================
// Tic-Tac-Toe — Game Logic
// ============================================

const boardEl = document.getElementById("board");
const cells = Array.from(document.querySelectorAll(".cell"));
const statusText = document.getElementById("statusText");
const turnDot = document.getElementById("turnDot");
const winPath = document.getElementById("winPath");
const newRoundBtn = document.getElementById("newRoundBtn");
const resetMatchBtn = document.getElementById("resetMatchBtn");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDrawEl = document.getElementById("scoreDraw");

// All 8 possible winning combinations, by cell index
const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
];

// Matching line coordinates (300x300 viewBox) for each combo above,
// extended slightly past cell centers for a nice overhang.
const LINE_COORDS = [
  [20, 50, 280, 50],   [20, 150, 280, 150], [20, 250, 280, 250],
  [50, 20, 50, 280],   [150, 20, 150, 280], [250, 20, 250, 280],
  [20, 20, 280, 280],  [280, 20, 20, 280],
];

let board = Array(9).fill(null);
let currentPlayer = "X";
let roundStarter = "X";
let gameOver = false;
let scores = { X: 0, O: 0, draw: 0 };

function updateTurnUI() {
  statusText.textContent = `Player ${currentPlayer}'s turn`;
  turnDot.classList.toggle("o", currentPlayer === "O");
}

function renderScores() {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDrawEl.textContent = scores.draw;
}

function checkWinner() {
  for (let i = 0; i < WIN_COMBOS.length; i++) {
    const [a, b, c] = WIN_COMBOS[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo: WIN_COMBOS[i], comboIndex: i };
    }
  }
  return null;
}

function drawWinLine(comboIndex, color) {
  const [x1, y1, x2, y2] = LINE_COORDS[comboIndex];
  winPath.setAttribute("d", `M ${x1} ${y1} L ${x2} ${y2}`);
  winPath.setAttribute("stroke", color);
  // restart animation
  winPath.classList.remove("show");
  void winPath.getBoundingClientRect();
  winPath.classList.add("show");
}

function clearWinLine() {
  winPath.classList.remove("show");
  winPath.setAttribute("d", "");
}

function handleCellClick(e) {
  const index = Number(e.currentTarget.dataset.index);
  if (gameOver || board[index]) return;

  board[index] = currentPlayer;
  const cell = cells[index];
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase(), "filled", "pop");
  cell.disabled = true;
  cell.setAttribute("aria-label", `${cell.getAttribute("aria-label").split(",")[0]}, ${currentPlayer}`);

  const result = checkWinner();

  if (result) {
    gameOver = true;
    const color = result.winner === "X" ? "var(--x-color)" : "var(--o-color)";
    const resolvedColor = getComputedStyle(document.documentElement)
      .getPropertyValue(result.winner === "X" ? "--x-color" : "--o-color")
      .trim();

    result.combo.forEach((i) => cells[i].classList.add("win"));
    drawWinLine(result.comboIndex, resolvedColor);

    statusText.textContent = `Player ${result.winner} wins! 🎉`;
    turnDot.style.visibility = "hidden";
    scores[result.winner] += 1;
    renderScores();
    lockBoard();
    return;
  }

  if (board.every((v) => v !== null)) {
    gameOver = true;
    statusText.textContent = "It's a draw!";
    turnDot.style.visibility = "hidden";
    scores.draw += 1;
    renderScores();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnUI();
}

function lockBoard() {
  cells.forEach((cell) => (cell.disabled = true));
}

function startNewRound() {
  board = Array(9).fill(null);
  gameOver = false;
  roundStarter = roundStarter === "X" ? "O" : "X"; // alternate who opens each round
  currentPlayer = roundStarter;

  cells.forEach((cell, i) => {
    cell.textContent = "";
    cell.disabled = false;
    cell.className = "cell";
    cell.setAttribute("aria-label", `Row ${Math.floor(i / 3) + 1}, Column ${(i % 3) + 1}`);
  });

  clearWinLine();
  turnDot.style.visibility = "visible";
  updateTurnUI();
}

function resetMatch() {
  scores = { X: 0, O: 0, draw: 0 };
  renderScores();
  roundStarter = "O"; // startNewRound() will flip this back to X
  startNewRound();
}

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
newRoundBtn.addEventListener("click", startNewRound);
resetMatchBtn.addEventListener("click", resetMatch);

// Initial render
updateTurnUI();
renderScores();
