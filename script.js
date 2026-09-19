// 預設食物選項
let options = ["拉麵", "火鍋", "滷味", "麥當勞", "炒飯", "便當"];

// 色彩計畫
const colors = ["#FF5A5F", "#FF8A65", "#4CAF50", "#2196F3", "#9C27B0", "#FFC107", "#00BCD4", "#E91E63"];

const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");

// 處理高解析度 Canvas，避免手機上模糊
const size = 300;
canvas.style.width = size + "px";
canvas.style.height = size + "px";
const scale = window.devicePixelRatio || 1;
canvas.width = size * scale;
canvas.height = size * scale;
ctx.scale(scale, scale);

const centerX = size / 2;
const centerY = size / 2;
const radius = size / 2;

let currentAngle = 0;
let isSpinning = false;
let spinAnimation;
let winnerText = "";

// 取得 DOM
const spinBtn = document.getElementById("spinBtn");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const itemList = document.getElementById("itemList");
const newItemInput = document.getElementById("newItemInput");

const modal = document.getElementById("resultModal");
const resultText = document.getElementById("resultText");

// 繪製轉盤 (白色字體優化 + 直書排列)
function drawWheel() {
  const numOptions = options.length;
  const arcSize = (2 * Math.PI) / numOptions;

  ctx.clearRect(0, 0, size, size);

  for (let i = 0; i < numOptions; i++) {
    const angle = currentAngle + i * arcSize;

    // 繪製扇形
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, angle, angle + arcSize, false);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();

    // 繪製分隔線
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 繪製直書文字
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle + arcSize / 2);
    
    ctx.fillStyle = "#FFFFFF"; // 白色字體
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const text = options[i];
    // 逐字繪製，將文字從外側往內排列 (直書效果)
    for (let j = 0; j < text.length; j++) {
       // radius-35 是外圍留白，每個字間距 24px
       ctx.fillText(text[j], radius - 35 - (j * 24), 0);
    }
    ctx.restore();
  }
}

// 旋轉邏輯
function spinWheel() {
  if (isSpinning || options.length === 0) return;
  isSpinning = true;

  const spinTimeTotal = 3000 + Math.random() * 2000;
  let spinTimeCurrent = 0;
  const spinVelocity = 0.4 + Math.random() * 0.2;

  function animateSpin(timestamp) {
    if (!spinTimeCurrent) spinTimeCurrent = timestamp;
    const progress = timestamp - spinTimeCurrent;

    if (progress < spinTimeTotal) {
      const easeOutProgress = 1 - Math.pow(1 - progress / spinTimeTotal, 3);
      currentAngle += spinVelocity * (1 - easeOutProgress);
      drawWheel();
      spinAnimation = requestAnimationFrame(animateSpin);
    } else {
      isSpinning = false;
      cancelAnimationFrame(spinAnimation);
      determineWinner();
    }
  }
  requestAnimationFrame(animateSpin);
}

// 決定中獎者並打開彈窗
function determineWinner() {
  const arcSize = (2 * Math.PI) / options.length;
  const normalizedAngle = currentAngle % (2 * Math.PI);
  // 轉盤上方正中央的指針位置是 270 度
  const pointerAngle = 1.5 * Math.PI;
  const offsetAngle = (pointerAngle - normalizedAngle + 2 * Math.PI) % (2 * Math.PI);
  const winningIndex = Math.floor(offsetAngle / arcSize);

  winnerText = options[winningIndex];
  resultText.innerText = winnerText;
  
  // 顯示彈窗
  modal.classList.add("show");
}

// --- 側邊欄控制 ---
function toggleDrawer(show) {
  if (show) {
    drawer.classList.add("open");
    overlay.classList.add("active");
    renderItemList();
  } else {
    drawer.classList.remove("open");
    overlay.classList.remove("active");
  }
}

function renderItemList() {
  itemList.innerHTML = "";
  options.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerText = item;
    const delBtn = document.createElement("button");
    delBtn.innerText = "刪除";
    delBtn.className = "delete-btn";
    delBtn.onclick = () => {
      options.splice(index, 1);
      renderItemList();
      drawWheel();
    };
    li.appendChild(delBtn);
    itemList.appendChild(li);
  });
}

document.getElementById("addItemBtn").addEventListener("click", () => {
  const val = newItemInput.value.trim();
  if (val) {
    options.push(val);
    newItemInput.value = "";
    renderItemList();
    drawWheel();
  }
});

// --- 基礎事件綁定 ---
spinBtn.addEventListener("click", spinWheel);
document.getElementById("openDrawer").addEventListener("click", () => toggleDrawer(true));
document.getElementById("closeDrawer").addEventListener("click", () => toggleDrawer(false));
overlay.addEventListener("click", () => toggleDrawer(false));

// --- 彈窗按鈕邏輯 ---
// 1. 搜尋店家
document.getElementById("searchBtn").addEventListener("click", () => {
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(winnerText)}`, "_blank");
});

// 2. 再轉一次
document.getElementById("spinAgainBtn").addEventListener("click", () => {
  modal.classList.remove("show"); // 先關閉彈窗
  spinWheel(); // 直接觸發旋轉
});

// 3. 返回
document.getElementById("returnBtn").addEventListener("click", () => {
  modal.classList.remove("show"); // 關閉彈窗回到原畫面
});

// 初始化
drawWheel();