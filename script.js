// State Variables
let count = 0;
let settings = {
    increment: 1,
    limit: 0,
    bgColor: '#000000',
    textColor: '#ffffff',
    vibration: true,
    sound: false
};

// DOM Elements
const counterDisplay = document.getElementById('counterValue');
const clickArea = document.getElementById('clickArea');
const menuBtn = document.getElementById('menuBtn');
const closeMenu = document.getElementById('closeMenu');
const modal = document.getElementById('settingsModal');
const soundBtn = document.getElementById('soundBtn');
const shareBtn = document.getElementById('shareBtn');

// Inputs
const bgColorInput = document.getElementById('bgColor');
const textColorInput = document.getElementById('textColor');
const incrementInput = document.getElementById('incrementVal');
const limitInput = document.getElementById('limitVal');
const vibrateInput = document.getElementById('vibrateToggle');
const setValInput = document.getElementById('setVal');

// --- Initialization ---
function loadData() {
    const savedCount = localStorage.getItem('simpleCounter_count');
    const savedSettings = localStorage.getItem('simpleCounter_settings');

    if (savedCount !== null) count = parseInt(savedCount);
    if (savedSettings !== null) settings = JSON.parse(savedSettings);

    updateDisplay();
    applySettingsUI();
}

function saveData() {
    localStorage.setItem('simpleCounter_count', count);
    localStorage.setItem('simpleCounter_settings', JSON.stringify(settings));
}

function updateDisplay() {
    counterDisplay.innerText = count;
    document.body.style.backgroundColor = settings.bgColor;
    document.body.style.color = settings.textColor;
    
    // Update Sound Icon
    soundBtn.innerText = settings.sound ? '🔊' : '🔇';
}

function applySettingsUI() {
    bgColorInput.value = settings.bgColor;
    textColorInput.value = settings.textColor;
    incrementInput.value = settings.increment;
    limitInput.value = settings.limit;
    vibrateInput.checked = settings.vibration;
}

// --- Core Logic ---
function increment() {
    if (settings.limit > 0 && count + settings.increment > settings.limit) {
        alert("Limit reached!");
        return;
    }

    count += parseInt(settings.increment);
    
    // Effects
    if (settings.vibration && navigator.vibrate) navigator.vibrate(30); // Short vibe
    if (settings.sound) playClickSound();

    updateDisplay();
    saveData();
}

// Simple Beep using Web Audio API (No files needed)
function playClickSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // Pitch
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Volume
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1); // Play for 0.1 seconds
}

// --- Event Listeners ---

// 1. Click to Count (Ignore clicks on menu)
clickArea.addEventListener('click', (e) => {
    // Only count if the menu is hidden
    if (modal.classList.contains('hidden')) {
        increment();
    }
});

// 2. Menu Handling
menuBtn.addEventListener('click', () => modal.classList.remove('hidden'));
closeMenu.addEventListener('click', () => modal.classList.add('hidden'));

// 3. Settings Changes
bgColorInput.addEventListener('input', (e) => { settings.bgColor = e.target.value; updateDisplay(); saveData(); });
textColorInput.addEventListener('input', (e) => { settings.textColor = e.target.value; updateDisplay(); saveData(); });
incrementInput.addEventListener('change', (e) => { settings.increment = parseInt(e.target.value); saveData(); });
limitInput.addEventListener('change', (e) => { settings.limit = parseInt(e.target.value); saveData(); });
vibrateInput.addEventListener('change', (e) => { settings.vibration = e.target.checked; saveData(); });

// Set specific number
document.getElementById('applySet').addEventListener('click', () => {
    const val = parseInt(setValInput.value);
    if (!isNaN(val)) {
        count = val;
        updateDisplay();
        saveData();
        modal.classList.add('hidden');
    }
});

// Reset
document.getElementById('resetBtn').addEventListener('click', () => {
    if(confirm('Reset counter to 0?')) {
        count = 0;
        updateDisplay();
        saveData();
        modal.classList.add('hidden');
    }
});

// About (?)
document.getElementById('aboutBtn').addEventListener('click', () => {
    alert("Simple Counter App.\nTap screen to count.\nAuto-saves on exit.");
});

// 4. Sound Button
soundBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent counting when clicking button
    settings.sound = !settings.sound;
    updateDisplay();
    saveData();
});

// 5. Share Button
shareBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Current Count',
                text: `I am currently at count: ${count}`,
                url: window.location.href
            });
        } catch (err) {
            console.log('Share canceled');
        }
    } else {
        alert(`Count: ${count}`);
    }
});

// Start
loadData();
