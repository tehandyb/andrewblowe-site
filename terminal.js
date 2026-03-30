const LINES = [
  "Hello interweb traveler.",
  "My name is Andrew Blowe, and this is my personal website.",
  "Ready to find out more?",
];

const LETTER_DELAY = 25;

function typeLine(text, onDone) {
  const div = document.createElement('div');
  div.className = 'terminal-line';
  document.getElementById('terminal').appendChild(div);

  let i = 0;
  function tick() {
    if (i < text.length) {
      div.textContent += text[i++];
      setTimeout(tick, LETTER_DELAY);
    } else {
      onDone();
    }
  }
  tick();
}

function showButtons() {
  const div = document.createElement('div');
  div.className = 'buttons';
  div.innerHTML = `
    <a href="portfolio.html" class="go-btn btn">Go</a>
    <button class="back-btn btn" onclick="window.history.back()">Take me back</button>
  `;
  document.getElementById('terminal').appendChild(div);
}

function runTerminal(lines, index) {
  if (index >= lines.length) {
    showButtons();
    return;
  }
  typeLine(lines[index], () => runTerminal(lines, index + 1));
}

document.addEventListener('DOMContentLoaded', () => runTerminal(LINES, 0));
