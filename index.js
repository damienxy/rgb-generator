const form = document.querySelector('form');
const reset = document.getElementById('reset');
const copy = document.getElementById('copy');
const settings = document.getElementById('settingsModal');
const info = document.getElementById('infoModal');
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

let currentTileWidth, currentTileHeight, currentConstraints;

window.onload = () => {
  currentConstraints = getConstraints();
  fillTiles(currentConstraints);
  setSliderValues();
};

// Form event listeners
form.addEventListener('input', e => {
  const constraints = getConstraints();
  if (JSON.stringify(currentConstraints) !== JSON.stringify(constraints)) {
    currentConstraints = constraints;
    fillTiles(constraints);
  }
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

fieldIds.forEach(id => {
  events.forEach(ev => {
    document
      .getElementById(id)
      .addEventListener(ev, e => updateSliderValues(e, id));
  });
});

// Button event listeners
reset.addEventListener('click', e => {
  if (JSON.stringify(currentConstraints) !== JSON.stringify(noConstraints)) {
    location.reload();
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
  const text = `RGB ranges: Red: ${redMin}-${redMax}, Green: ${greenMin}-${greenMax}, Blue: ${blueMin}-${blueMax}`;
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
  colors.style.background = getRandomRgb(constraints);
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
  return `rgb(${red},${green},${blue})`;
};

const getRandomInt = (min, max) => {
  return Math.ceil(Math.random() * (max - min) + min);
};

const addTile = rgb => {
  let div = document.createElement('div');
  div.style.width = `${currentTileWidth}px`;
  div.style.height = `${currentTileHeight}px`;
  div.style.background = rgb;
  colors.appendChild(div);
};

// Slider functions
const setSliderValues = () => {
  fieldIds.forEach(id => {
    const elem = document.getElementById(id);
    const val = document.getElementById(id + 'Value');
    val.innerHTML = elem.value;
  });
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

// Button functions
const copyToClipboard = text => {
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
  console.log('Copied. ', text);
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
