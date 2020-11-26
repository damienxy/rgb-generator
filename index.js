const form = document.querySelector('form');
const rgba = document.getElementById('rgba');
const alphaSection = document.getElementById('alphaSection');
const alphaValue = document.getElementById('alphaValue');
const alpha = document.getElementById('alpha');
const reset = document.getElementById('reset');
const copy = document.getElementById('copy');
const settings = document.getElementById('settingsModal');
const info = document.getElementById('infoModal');
const copied = document.getElementById('copiedModal');
const settingsToggle = document.getElementById('settingsTriangle');
const infoToggle = document.getElementById('infoTriangle');
const colors = document.getElementById('colors');

const tileSize = 40;
const noConstraints = {
  redMin: '0',
  redMax: '255',
  greenMin: '0',
  greenMax: '255',
  blueMin: '0',
  blueMax: '255'
};

let currentTileWidth, currentTileHeight, currentConstraints, timeout;

window.onload = () => {
  resetDisplay();
};

// Form event listeners
form.addEventListener('input', e => {
  const constraints = getConstraints();
  const shouldUpdate =
    JSON.stringify(currentConstraints) !== JSON.stringify(constraints);
  if (shouldUpdate) {
    currentConstraints = constraints;
    fillTiles(constraints);
  }
});

// Checkbox listeners
const checkboxes = ['rgb', 'rgba'];
checkboxes.forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    alphaSection.style.visibility = rgba.checked ? 'visible' : 'hidden';
    updateTiles();
  });
});

// Slider listeners
const fieldIds = [
  'redMin',
  'redMax',
  'greenMin',
  'greenMax',
  'blueMin',
  'blueMax'
];

const events = ['input', 'mousedown'];

events.forEach(ev => {
  fieldIds.forEach(id => {
    document
      .getElementById(id)
      .addEventListener(ev, e => updateSliderValues(e, id));
  });
  alpha.addEventListener(ev, e => updateAlpha(e));
});

// Button event listeners
reset.addEventListener('click', e => {
  const shouldReset =
    JSON.stringify(currentConstraints) !== JSON.stringify(noConstraints) ||
    alpha.valueAsNumber != 1;
  if (shouldReset) {
    resetAlpha();
    resetForm();
    resetDisplay();
  }
});

copy.addEventListener('click', () => {
  const {
    redMin,
    redMax,
    greenMin,
    greenMax,
    blueMin,
    blueMax
  } = currentConstraints;
  const text = rgba.checked
    ? `RGBA ranges: Red: ${redMin}-${redMax}, Green: ${greenMin}-${greenMax}, Blue: ${blueMin}-${blueMax}, Alpha: ${alpha.value}`
    : `RGB ranges: Red: ${redMin}-${redMax}, Green: ${greenMin}-${greenMax}, Blue: ${blueMin}-${blueMax}`;
  copyToClipboard(text);
});

// Modal event listeners
settingsToggle.addEventListener('click', () => {
  toggleVisibility(settings);
});

infoToggle.addEventListener('click', () => {
  toggleVisibility(info);
});

// Form functions
const getConstraints = () => {
  const elements = form.elements;
  const redMin = elements['redMin'].value;
  const redMax = elements['redMax'].value;
  const greenMin = elements['greenMin'].value;
  const greenMax = elements['greenMax'].value;
  const blueMin = elements['blueMin'].value;
  const blueMax = elements['blueMax'].value;

  return { redMin, redMax, greenMin, greenMax, blueMin, blueMax };
};

const fillTiles = constraints => {
  const count = getCount();
  removeCurrentTiles();
  for (let i = 0; i < count; i++) {
    const rgb = getRandomRgb(constraints);
    addTile(rgb);
  }
};

const updateTiles = () => {
  const tiles = document.getElementsByClassName('tile');
  for (let tile of tiles) {
    const matches = tile.style.backgroundColor.match(/[0-9]{1,3}[.]*[0-9]*/g);
    const [r, g, b] = matches;
    const newBackground = rgba.checked
      ? `rgba(${r},${g},${b},${alpha.value})`
      : `rgb(${r},${g},${b})`;
    tile.style.backgroundColor = newBackground;
  }
};

const getCount = () => {
  const width = window.innerWidth;
  const columns = Math.floor(width / tileSize);
  const leftoverWidth = width % (columns * tileSize);
  currentTileWidth = tileSize + leftoverWidth / columns;

  const height = window.innerHeight;
  const rows = Math.floor(height / tileSize);
  const leftoverHeight = height % (rows * tileSize);
  currentTileHeight = tileSize + leftoverHeight / rows;

  const count = (width * height) / (currentTileWidth * currentTileHeight);
  const final = columns * rows;
  const finalWithBuffer = final + 10 * rows;
  return finalWithBuffer;
};

const removeCurrentTiles = () => {
  colors.innerHTML = '';
};

const getRandomRgb = constraints => {
  const { redMin, redMax, greenMin, greenMax, blueMin, blueMax } = constraints;
  const red = getRandomInt(redMin, redMax);
  const green = getRandomInt(greenMin, greenMax);
  const blue = getRandomInt(blueMin, blueMax);
  return rgba.checked
    ? `rgba(${red},${green},${blue},${alpha.value})`
    : `rgb(${red},${green},${blue})`;
};

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const addTile = rgb => {
  let div = document.createElement('div');
  div.classList.add('tile');
  div.style.width = `${currentTileWidth}px`;
  div.style.height = `${currentTileHeight}px`;
  div.style.backgroundColor = rgb;
  div.addEventListener('mousedown', () => {
    div.classList.add('copyCursor');
  });
  div.addEventListener('mouseup', () => {
    div.classList.remove('copyCursor');
  });
  div.addEventListener('click', () => {
    const currentColor = div.style.backgroundColor;
    copyToClipboard(currentColor);
  });
  colors.appendChild(div);
};

// Slider functions
const setSliderValues = () => {
  fieldIds.forEach(id => {
    const elem = document.getElementById(id);
    const val = document.getElementById(id + 'Value');
    val.innerHTML = elem.value;
  });
  alphaValue.innerHTML = alpha.value;
};

const updateSliderValues = (e, id) => {
  const elem = document.getElementById(id);
  const val = document.getElementById(id + 'Value');
  const color = id.slice(0, -3);
  const minmax = id.slice(-3);
  const otherMinmax = minmax === 'Min' ? 'Max' : 'Min';
  const other = document.getElementById(color + otherMinmax);

  const isWithinThreshold =
    (minmax === 'Min' && elem.valueAsNumber < other.valueAsNumber) ||
    (minmax === 'Max' && elem.valueAsNumber > other.valueAsNumber);

  if (isWithinThreshold) {
    elem.value = e.target.value;
    val.innerHTML = e.target.value;
  } else {
    elem.value = other.value;
    val.innerHTML = other.value;
  }
};

const updateAlpha = e => {
  alphaValue.innerHTML = e.target.value;
  updateTiles();
};

// Copy functions
const copyToClipboard = text => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
    copied.style.display = 'none';
  }
  let textArea = document.createElement('textarea');
  textArea.style.width = 0;
  textArea.style.height = 0;
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  textArea.setSelectionRange(0, 99999); // for mobile
  document.execCommand('copy');
  document.body.removeChild(textArea);
  console.log(text);
  showCopied();
};

const showCopied = () => {
  copied.style.display = 'block';
  timeout = setTimeout(() => (copied.style.display = 'none'), 1000);
};

// Reset functions
const resetForm = () => {
  form.reset();
};

const resetAlpha = () => {
  alpha.value = 1;
  alphaValue.innerHTML = 1;
};

const resetDisplay = () => {
  alphaSection.style.visibility = rgba.checked ? 'visible' : 'hidden';
  currentConstraints = getConstraints();
  fillTiles(currentConstraints);
  setSliderValues();
};

// Modal functions
const toggleVisibility = elem => {
  const invisible = elem.style.display === 'none';
  if (invisible) {
    elem.style.display = 'block';
  } else {
    elem.style.display = 'none';
  }
};
