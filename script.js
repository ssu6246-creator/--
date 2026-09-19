// ==========================================
// ⚠️ 請填入你的 LIFF ID 與 GAS 網頁應用程式網址
// ==========================================
const LIFF_ID = "YOUR_LIFF_ID"; // 例如: 1234567890-AbCdEfGh
const GAS_URL = "YOUR_GAS_WEB_APP_URL"; // 例如: https://script.google.com/macros/s/AKfycb.../exec

let currentUserId = "";
let isUsingLocation = false;
let userLat = "";
let userLng = "";

// 1. 初始化設定與綁定事件
window.onload = function() {
  // 綁定按鈕點擊事件 (取代原本 HTML 裡的 onclick)
  document.getElementById('btnLocation').addEventListener('click', getLocation);
  document.getElementById('btnSave').addEventListener('click', saveData);
  
  // 綁定下拉選單改變事件
  document.getElementById('school').addEventListener('change', function() {
    if (this.value !== 'location') {
      isUsingLocation = false;
      document.getElementById('locationStatus').style.display = 'none';
    }
  });

  // 啟動 LIFF 初始化
  initLIFF();
};

// 2. 初始化 LIFF
function initLIFF() {
  document.getElementById('loading').style.display = 'block';
  liff.init({ liffId: LIFF_ID })
    .then(() => {
      if (!liff.isLoggedIn()) {
        liff.login();
      } else {
        return liff.getProfile();
      }
    })
    .then(profile => {
      if (profile) {
        currentUserId = profile.userId;
        fetchUserSettings(); // 去 GAS 抓舊資料
      }
    })
    .catch(err => {
      console.error("LIFF 初始化失敗", err);
      alert("LIFF 初始化失敗，請確認在 LINE 內部開啟。");
      document.getElementById('loading').style.display = 'none';
    });
}

// 3. 獲取使用者舊設定
function fetchUserSettings() {
  const url = `${GAS_URL}?action=getUserSettings&userId=${currentUserId}`;
  fetch(url)
    .then(res => res.json())
    .then(result => {
      document.getElementById('loading').style.display = 'none';
      if (result.success && result.exists) {
        const data = result.data;
        
        // 如果上次存的是定位
        if (data.isCurrentLocation) {
          isUsingLocation = true;
          userLat = data.latitude;
          userLng = data.longitude;
          document.getElementById('optLocation').style.display = 'block';
          document.getElementById('school').value = 'location';
          document.getElementById('locationStatus').innerText = `已載入上次儲存的定位 (${userLat}, ${userLng})`;
          document.getElementById('locationStatus').style.display = 'block';
        } else {
          if (data.school) document.getElementById('school').value = data.school;
        }
        
        if (data.campusText) document.getElementById('campus').value = data.campusText;
        if (data.price) document.getElementById('price').value = data.price;
        if (data.distance) document.getElementById('distance').value = data.distance;
      }
    })
    .catch(err => {
      console.error("讀取設定失敗", err);
      document.getElementById('loading').style.display = 'none';
    });
}

// 4. HTML5 獲取手機定位
function getLocation() {
  if (navigator.geolocation) {
    document.getElementById('locationStatus').innerText = "定位中，請稍候...";
    document.getElementById('locationStatus').style.display = 'block';
    
    navigator.geolocation.getCurrentPosition(
      function(position) {
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;
        isUsingLocation = true;
        
        document.getElementById('locationStatus').innerText = `✅ 定位成功！(${userLat.toFixed(4)}, ${userLng.toFixed(4)})`;
        document.getElementById('optLocation').style.display = 'block';
        document.getElementById('school').value = 'location';
      },
      function(error) {
        alert("獲取定位失敗，請確認是否允許網頁取用位置權限。");
        document.getElementById('locationStatus').style.display = 'none';
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    alert("您的裝置不支援定位功能。");
  }
}

// 5. 儲存設定並傳送給 GAS
function saveData() {
  if (!currentUserId) {
    alert("無法獲取 User ID，請重新開啟視窗。");
    return;
  }

  document.getElementById('loading').innerText = "儲存中...";
  document.getElementById('loading').style.display = 'block';

  const schoolSelect = document.getElementById('school');
  const schoolText = schoolSelect.options[schoolSelect.selectedIndex].text;
  const campusText = document.getElementById('campus').value;
  
  const priceSelect = document.getElementById('price');
  const priceText = priceSelect.options[priceSelect.selectedIndex].text;
  
  const distanceSelect = document.getElementById('distance');
  const distanceText = distanceSelect.options[distanceSelect.selectedIndex].text;

  const payload = {
    action: "saveUserSettings",
    userId: currentUserId,
    schoolText: schoolText,
    campusText: campusText,
    priceText: priceText,
    distanceText: distanceText,
    isCurrentLocation: isUsingLocation,
    latitude: userLat,
    longitude: userLng
  };

  fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'text/plain;charset=utf-8' // GAS 建議使用 text/plain 避免 CORS preflight
    }
  })
  .then(res => res.json())
  .then(result => {
    if (result.success) {
      alert("✅ 設定儲存成功！");
      liff.closeWindow(); // 儲存完自動關閉 LIFF 視窗
    } else {
      alert("儲存失敗：" + result.message);
      document.getElementById('loading').style.display = 'none';
    }
  })
  .catch(err => {
    console.error("傳送失敗", err);
    alert("網路錯誤，請稍後再試。");
    document.getElementById('loading').style.display = 'none';
  });
}