// 預設食物選項
let options = ["拉麵", "火鍋", "滷味", "麥當勞", "炒飯", "便當", "義大利麵", "水餃"];

// 色彩計畫 (交替顯示)
const colors = ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#B5EAD7", "#C7CEEA", "#F3D8F5"];

// 取得 DOM 元素
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const resultText = document.getElementById("resultText");

// 側邊欄 DOM
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const openSidebarBtn = document.getElementById("openSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");
const itemList = document.getElementById("itemList");
const newItemInput = document.getElementById("newItemInput");
const addItemBtn = document.getElementById("addItemBtn");

// 轉盤物理狀態變數
let currentAngle = 0; // 目前角度
let isSpinning = false; // 是否正在旋轉
let spinAnimation; // requestAnimationFrame 的 ID

// ----------------------------------------------------
// 1. Canvas 繪製轉盤功能
// ----------------------------------------------------
function drawWheel() {
  const numOptions = options.length;
  const arcSize = (2 * Math.PI) / numOptions;
  const radius = canvas.width / 2;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // 清空畫布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < numOptions; i++) {
    const angle = currentAngle + i * arcSize;

    // 繪製扇形
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, angle, angle + arcSize, false);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.save();

    // 繪製文字
    ctx.fillStyle = "#333333";
    ctx.font = "bold 18px sans-serif";
    
    // 將中心點移到轉盤中心並旋轉文字
    ctx.translate(centerX, centerY);
    ctx.rotate(angle + arcSize / 2);
    ctx.textAlign = "right";
    
    // 繪製文字 (稍微往內縮一點)
    ctx.fillText(options[i], radius - 20, 6);
    ctx.restore();
    
    // 畫分隔線
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, angle, angle + arcSize, false);
    ctx.lineTo(centerX, centerY);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// ----------------------------------------------------
// 2. 旋轉邏輯與動畫 (Ease-out 緩動)
// ----------------------------------------------------
function spinWheel() {
  if (isSpinning || options.length === 0) return;
  isSpinning = true;
  resultText.innerText = "轉動中...";

  // 隨機決定要轉的總角度 (基礎多轉 5-8 圈 + 隨機角度)
  const spinTimeTotal = 4000 + Math.random() * 2000; // 總旋轉時間 4~6 秒
  let spinTimeCurrent = 0;
  
  // 決定目標速度
  const spinVelocity = 0.5 + Math.random() * 0.2; // 初始旋轉速度

  function animateSpin(timestamp) {
    if (!spinTimeCurrent) spinTimeCurrent = timestamp;
    const progress = timestamp - spinTimeCurrent;

    if (progress < spinTimeTotal) {
      // Ease-out 公式：速度隨時間遞減
      const easeOutProgress = 1 - Math.pow(1 - progress / spinTimeTotal, 3);
      currentAngle += spinVelocity * (1 - easeOutProgress);
      drawWheel();
      spinAnimation = requestAnimationFrame(animateSpin);
    } else {
      // 旋轉結束
      isSpinning = false;
      cancelAnimationFrame(spinAnimation);
      determineWinner();
    }
  }

  requestAnimationFrame(animateSpin);
}

// 計算最終停在那個選項 (上方指針位置)
function determineWinner() {
  const numOptions = options.length;
  const arcSize = (2 * Math.PI) / numOptions;
  
  // 計算目前角度的餘數，並反轉 (因為轉盤順時針轉，但選項是順時針畫的)
  const normalizedAngle = currentAngle % (2 * Math.PI);
  
  // 因為指針在正上方 (-90度 或 270度)，我們需要計算偏移
  // 指針相對於右方(0度)是 270度 (1.5 * PI)
  const pointerAngle = 1.5 * Math.PI;
  
  // 計算指針指到的扇形索引
  const offsetAngle = (pointerAngle - normalizedAngle + 2 * Math.PI) % (2 * Math.PI);
  const winningIndex = Math.floor(offsetAngle / arcSize);

  resultText.innerText = `🎉 決定了！去吃：${options[winningIndex]}`;
}

// ----------------------------------------------------
// 3. 側邊欄 (Sidebar) 控制邏輯
// ----------------------------------------------------
function toggleSidebar(show) {
  if (show) {
    sidebar.classList.add("open");
    overlay.classList.add("active");
    renderItemList(); // 打開時更新列表
  } else {
    sidebar.classList.remove("open");
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
      drawWheel(); // 即時重繪轉盤
    };
    
    li.appendChild(delBtn);
    itemList.appendChild(li);
  });
}

function addNewItem() {
  const val = newItemInput.value.trim();
  if (val) {
    options.push(val);
    newItemInput.value = "";
    renderItemList();
    drawWheel(); // 即時重繪轉盤
  }
}

// ----------------------------------------------------
// 4. 事件綁定與初始化
// ----------------------------------------------------
spinBtn.addEventListener("click", spinWheel);
openSidebarBtn.addEventListener("click", () => toggleSidebar(true));
closeSidebarBtn.addEventListener("click", () => toggleSidebar(false));
overlay.addEventListener("click", () => toggleSidebar(false));

addItemBtn.addEventListener("click", addNewItem);
newItemInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addNewItem();
});

// 初始化畫面
drawWheel();