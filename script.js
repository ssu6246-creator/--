const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const menuToggle = document.getElementById('menuToggle');
const closeSidebar = document.getElementById('closeSidebar');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const prizeListContainer = document.getElementById('prizeList');
const presetTagsContainer = document.getElementById('presetTags');
const addPrizeBtn = document.getElementById('addPrizeBtn');
const saveBtn = document.getElementById('saveBtn');

const resultModal = document.getElementById('resultModal');
const resultText = document.getElementById('resultText');
const closeModal = document.getElementById('closeModal');

// 快捷選項清單
const presetOptions = [
    "飯", "麵", "便當", "火鍋", "滷味", 
    "速食", "素食", "日式", "韓式", "義式", 
    "早餐", "炸物", "燒烤", "水餃", "甜點", 
    "健康餐", "飲料"
];

// 色彩庫
const colorPalette = [
    '#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', 
    '#3498db', '#1abc9c', '#2ecc71', '#e84393',
    '#fd79a8', '#00b894', '#00cec9', '#6c5ce7'
];

let prizes = [
    { text: '飯', color: '#f1c40f' },
    { text: '麵', color: '#e67e22' },
    { text: '火鍋', color: '#e74c3c' },
    { text: '日式', color: '#3498db' },
    { text: '韓式', color: '#9b59b6' },
    { text: '飲料', color: '#1abc9c' }
];

let numSegments = prizes.length;
let arcSize = (2 * Math.PI) / numSegments;
let startAngle = 0;
let isSpinning = false;
const cssSize = 300;

function setupCanvasHighDPI() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cssSize * dpr;
    canvas.height = cssSize * dpr;
    canvas.style.width = `${cssSize}px`;
    canvas.style.height = `${cssSize}px`;
}

function getRandomColor() {
    return colorPalette[Math.floor(Math.random() * colorPalette.length)];
}

function drawWheel() {
    numSegments = prizes.length;
    if (numSegments === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    arcSize = (2 * Math.PI) / numSegments;
    
    const outsideRadius = 140;
    const center = 150;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    const maxTextWidth = 100;

    for (let i = 0; i < numSegments; i++) {
        const angle = startAngle + i * arcSize;

        // 畫扇形
        ctx.beginPath();
        ctx.fillStyle = prizes[i].color;
        ctx.moveTo(center, center);
        ctx.arc(center, center, outsideRadius, angle, angle + arcSize, false);
        ctx.lineTo(center, center);
        ctx.fill();
        ctx.stroke();

        // 畫文字
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(angle + arcSize / 2);
        ctx.fillStyle = '#2c3e50';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        let rawText = prizes[i].text;
        let fontSize = 13;
        if (rawText.length > 8) fontSize = 10;
        else if (rawText.length > 6) fontSize = 11;
        
        ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

        let displayText = rawText;
        if (ctx.measureText(displayText).width > maxTextWidth) {
            while (displayText.length > 0 && ctx.measureText(displayText + '...').width > maxTextWidth) {
                displayText = displayText.slice(0, -1);
            }
            displayText += '...';
        }

        ctx.fillText(displayText, outsideRadius - 12, 0);
        ctx.restore();
    }

    // 外圓框
    ctx.beginPath();
    ctx.arc(center, center, outsideRadius, 0, 2 * Math.PI, false);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#34495e';
    ctx.stroke();

    // 中心蓋點
    ctx.beginPath();
    ctx.arc(center, center, 15, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#34495e';
    ctx.stroke();

    ctx.restore();
}

// 渲染快捷選項按鈕
function renderPresetTags() {
    presetTagsContainer.innerHTML = '';
    const currentPrizeNames = prizes.map(p => p.text);

    presetOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'tag-btn';
        btn.textContent = option;
        
        // 若該選項已在目前的轉盤清單中，呈現選取 (綠色) 狀態
        if (currentPrizeNames.includes(option)) {
            btn.classList.add('selected');
        }

        btn.addEventListener('click', () => {
            btn.classList.toggle('selected');
            if (btn.classList.contains('selected')) {
                // 新增至列表
                prizes.push({ text: option, color: getRandomColor() });
            } else {
                // 從列表中移除
                prizes = prizes.filter(p => p.text !== option);
            }
            renderSidebarInputs();
        });

        presetTagsContainer.appendChild(btn);
    });
}

function renderSidebarInputs() {
    prizeListContainer.innerHTML = '';
    prizes.forEach((prize, index) => {
        const item = document.createElement('div');
        item.className = 'prize-item';
        item.innerHTML = `
            <input type="text" value="${prize.text}" data-index="${index}" class="prize-text-input">
            <input type="color" value="${prize.color}" data-index="${index}" class="prize-color-input">
            <button class="delete-btn" onclick="removePrize(${index})">刪除</button>
        `;
        prizeListContainer.appendChild(item);
    });
}

window.removePrize = function(index) {
    if (prizes.length <= 2) {
        alert('轉盤至少需要有 2 個獎項！');
        return;
    }
    prizes.splice(index, 1);
    renderSidebarInputs();
    renderPresetTags(); // 同步更新快捷標籤選取狀態
};

addPrizeBtn.addEventListener('click', () => {
    prizes.push({ text: '新獎項', color: getRandomColor() });
    renderSidebarInputs();
});

saveBtn.addEventListener('click', () => {
    const textInputs = document.querySelectorAll('.prize-text-input');
    const colorInputs = document.querySelectorAll('.prize-color-input');
    
    if (textInputs.length < 2) {
        alert('請至少保留 2 個選項！');
        return;
    }

    prizes = [];
    for (let i = 0; i < textInputs.length; i++) {
        prizes.push({
            text: textInputs[i].value || '未命名',
            color: colorInputs[i].value
        });
    }

    drawWheel();
    closeSidebarFunc();
});

function openSidebarFunc() {
    renderSidebarInputs();
    renderPresetTags();
    sidebar.classList.remove('closed');
    sidebarOverlay.classList.remove('closed');
}

function closeSidebarFunc() {
    sidebar.classList.add('closed');
    sidebarOverlay.classList.add('closed');
}

menuToggle.addEventListener('click', openSidebarFunc);
closeSidebar.addEventListener('click', closeSidebarFunc);
sidebarOverlay.addEventListener('click', closeSidebarFunc);

spinBtn.addEventListener('click', () => {
    if (isSpinning) return;
    if (prizes.length < 2) {
        alert('請先點擊左上角設定至少 2 個獎項！');
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;

    const winningIndex = Math.floor(Math.random() * numSegments);
    const targetAngle = 3 * Math.PI / 2 - (winningIndex * arcSize + arcSize / 2);
    const extraSpins = (Math.floor(Math.random() * 4) + 5) * 2 * Math.PI;
    const totalRotation = extraSpins + targetAngle - (startAngle % (2 * Math.PI));

    let currentRotation = 0;
    const spinDuration = 4000;
    const startTime = performance.now();

    function animateSpin(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        startAngle += (totalRotation * easeOut) - currentRotation;
        currentRotation = totalRotation * easeOut;

        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animateSpin);
        } else {
            isSpinning = false;
            spinBtn.disabled = false;
            
            resultText.textContent = prizes[winningIndex].text;
            resultModal.classList.remove('hidden');
        }
    }

    requestAnimationFrame(animateSpin);
});

closeModal.addEventListener('click', () => {
    resultModal.classList.add('hidden');
});

setupCanvasHighDPI();
drawWheel();