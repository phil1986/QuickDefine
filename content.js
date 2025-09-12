document.addEventListener('dblclick', async (e) => {
  if (!e.ctrlKey) return;

  const selection = window.getSelection().toString().trim();
  if (!selection) return;

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${selection}`);
    const data = await response.json();

    const dl = document.createElement('dl');
    dl.style.margin = '0';

    data[0]?.meanings.forEach(meaning => {
      const partOfSpeech = meaning.partOfSpeech;
      meaning.definitions.forEach((def, index) => {
        const dt = document.createElement('dt');
        dt.textContent = `${partOfSpeech} ${index + 1}.`;
        dt.style.cssText = 'font-style: italic; margin-top: 8px;';

        const dd = document.createElement('dd');
        dd.textContent = def.definition;
        dd.style.cssText = 'margin-left: 24px; margin-bottom: 4px;';

        dl.appendChild(dt);
        dl.appendChild(dd);
      });
    });

    const definitionNode = dl.childNodes.length > 0
      ? dl
      : document.createTextNode("No definition found.");

    showPopup(e.pageX, e.pageY, definitionNode, selection);
    window.getSelection().removeAllRanges();
  } catch (error) {
    console.error('Error fetching definition:', error);
  }
});



function showPopup(x, y, definitionNode, word) {
  const popup = document.createElement('div');
  popup.style.cssText = `/* your styles */`;

  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';

  const wordElem = document.createElement('div');
  wordElem.textContent = word;
  wordElem.style.cssText = 'font-weight: bold; font-size: 18px;';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.title = 'Close';
  closeBtn.style.cssText = 'background: none; border: none; font-size: 24px; font-weight: 900; cursor: pointer; color: #971111ff;';
  closeBtn.addEventListener('click', () => popup.remove());

  header.appendChild(wordElem);
  header.appendChild(closeBtn);
  popup.appendChild(header);

  popup.appendChild(definitionNode);

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
    font-size: 14px;
    line-height: 1.5;
    color: #222;
    z-index: 9999;
    border-radius: 4px;
    overflow: hidden;
    animation: scrollOpen 0.6s ease-out forwards;
  `;
    
  const style = document.createElement('style');
  style.textContent = `
    @keyframes scrollOpen {
      0% {
        max-height: 0;
        transform: translateY(-10px);
      }
      100% {
        max-height: 1000px;
        transform: translateY(0);
      }
    }
  `;

  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    height: 4px;
    background: #ccc;
    width: 100%;
    overflow: hidden;
  `;

  const progressFill = document.createElement('div');
  progressFill.className = 'progress-fill';
  progressFill.style.cssText = `
    height: 100%;
    background: #007acc;
    width: 0%;
  `;

  progressBar.appendChild(progressFill);
  popup.appendChild(progressBar);

  document.head.appendChild(style);

  document.body.appendChild(popup);

  let startTime = null;
  let paused = false;
  let elapsed = 0;
  const duration = 3000;

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