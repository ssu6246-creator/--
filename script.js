const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const menuToggle = document.getElementById('menuToggle');
const closeSidebar = document.getElementById('closeSidebar');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const presetTagsContainer = document.getElementById('presetTags');
const saveBtn = document.getElementById('saveBtn');

const resultModal = document.getElementById('resultModal');
const resultText = document.getElementById('resultText');
const closeModal = document.getElementById('closeModal');

// 已移除：水餃、速食
let presetOptions = [
    "飯", "麵", "便當", "火鍋", "滷味", 
    "素食", "日式", "韓式", "義式", 
    "早餐", "炸物", "燒烤", "甜點", 
    "健康餐", "飲料"
];

// 預設已選取的選項名稱
let selectedNames = ["飯", "麵", "火鍋", "日式", "韓式", "飲料"];

// 顏色庫
const colorPalette = [
    '#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', 
    '#3498db', '#1abc9c', '#2ecc71', '#e84393',
    '#fd79a8', '#00b894', '#00cec9', '#6c5ce7',
    '#ff7675', '#74b9ff', '#a29bfe', '#ffeaa7'
];

let prizes = [];
let numSegments = 0;
let arcSize = 0;
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

// 根據名稱列表生成帶有顏色的獎項資料
function updatePrizesFromSelected() {
    prizes = selectedNames.map((name, index) => {
        return {
            text: name,
            color: colorPalette[index % colorPalette.length]
        };
    });
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

// 渲染快捷選項按鈕（含 + 號新增按鈕）
function renderPresetTags() {
    presetTagsContainer.innerHTML = '';

    // 渲染一般選項按鈕
    presetOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'tag-btn';
        btn.textContent = option;
        
        // 若該選項已選取，顯示綠色 (.selected)
        if (selectedNames.includes(option)) {
            btn.classList.add('selected');
        }

        btn.addEventListener('click', () => {
            if (selectedNames.includes(option)) {
                selectedNames = selectedNames.filter(name => name !== option);
                btn.classList.remove('selected');
            } else {
                selectedNames.push(option);
                btn.classList.add('selected');
            }
        });

        presetTagsContainer.appendChild(btn);
    });

    // 新增「+」按鈕
    const addBtn = document.createElement('button');
    addBtn.className = 'add-tag-btn';
    addBtn.textContent = '+ 新增';
    
    addBtn.addEventListener('click', () => {
        const newOption = prompt('請輸入要新增的選項名稱：');
        if (newOption && newOption.trim() !== '') {
            const cleanName = newOption.trim();
            if (!presetOptions.includes(cleanName)) {
                presetOptions.push(cleanName);
                selectedNames.push(cleanName); // 新增後預設直接選取 (綠色)
                renderPresetTags(); // 重新繪製標籤列表
            } else {
                alert('該選項已經存在囉！');
            }
        }
    });

    presetTagsContainer.appendChild(addBtn);
}

saveBtn.addEventListener('click', () => {
    if (selectedNames.length < 2) {
        alert('請至少點擊選取 2 個選項才能產生轉盤！');
        return;
    }

    updatePrizesFromSelected();
    drawWheel();
    closeSidebarFunc();
});

function openSidebarFunc() {
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
        alert('請點擊左上角按鈕，選擇至少 2 個選項！');
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
updatePrizesFromSelected();
drawWheel();