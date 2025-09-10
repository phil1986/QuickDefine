document.addEventListener('dblclick', async (e) => {
  if (!e.ctrlKey) return;

  const selection = window.getSelection().toString().trim();
  if (!selection) return;

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${selection}`);
    const data = await response.json();

    const definitions = [];
    data[0]?.meanings.forEach(meaning => {
      const partOfSpeech = meaning.partOfSpeech;
      meaning.definitions.forEach((def, index) => {
        definitions.push(`
          <dt style="font-style: italic; margin-top: 8px;">${partOfSpeech} ${index + 1}.</dt>
          <dd style="margin-left: 24px; margin-bottom: 4px;">${def.definition}</dd>
        `);
      });
    });

    const formatted = definitions.length
      ? `<dl style="margin: 0;">${definitions.join('')}</dl>`
      : "No definition found.";

    showPopup(e.pageX, e.pageY, formatted, selection);
    window.getSelection().removeAllRanges();
  } catch (error) {
    console.error('Error fetching definition:', error);
  }
});

function showPopup(x, y, definitionHTML, word) {
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    background: #fdffe7ff;
    border: 1px solid #aaa;
    box-shadow: 2px 2px 6px rgba(0,0,0,0.2);
    padding: 24px 16px 12px 16px;
    max-width: 400px;
    font-family: 'Georgia', serif;
    font-size: 16px;
    line-height: 1.5;
    color: #222;
    z-index: 9999;
    border-radius: 4px;
    overflow: hidden;
    animation: scrollOpen 0.6s ease-out forwards;
  `;

  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="font-weight: bold; font-size: 18px;">${word}</div>
      <button style="
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
      " title="Close">&times;</button>
    </div>
    ${definitionHTML}
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      height: 4px;
      background: #ccc;
      width: 100%;
      overflow: hidden;
    ">
      <div class="progress-fill" style="
        height: 100%;
        background: #007acc;
        width: 0%;
      "></div>
    </div>
  `;

  document.body.appendChild(popup);

  const style = document.createElement('style');
  style.textContent = `
  @keyframes scrollOpen {
    0% {
      max-height: 0;
      opacity: 0;
      transform: translateY(-10px);
    }
    100% {
      max-height: 1000px;
      opacity: 1;
      transform: translateY(0);
    }
  }
  `;
  document.head.appendChild(style);


  const closeBtn = popup.querySelector('button');
  closeBtn.addEventListener('click', () => popup.remove());

  const progressFill = popup.querySelector('.progress-fill');

  let startTime = null;
  let paused = false;
  let elapsed = 0;
  const duration = 5000;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    if (!paused) {
      elapsed += timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      progressFill.style.width = `${progress * 100}%`;
      if (progress < 1) {
        startTime = timestamp;
        requestAnimationFrame(animate);
      } else {
        popup.remove();
      }
    } else {
      startTime = timestamp;
      requestAnimationFrame(animate);
    }
  }

  popup.addEventListener('mouseenter', () => {
    paused = true;
  });

  popup.addEventListener('mouseleave', () => {
    paused = false;
  });

  requestAnimationFrame(animate);
}