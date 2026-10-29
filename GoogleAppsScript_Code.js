/**
 * ========================================================
 * Google Apps Script - 行程倒數看板 即時日曆同步 API
 * ========================================================
 * 
 * 功能：
 * 當手機 Gemini App、Siri 或 Google 日曆新增/修改行程時，
 * 倒數網頁透過此 API 即時取得最新行程資料，無需手動更新。
 * 
 * 部署步驟（只需 1 分鐘）：
 * 1. 在瀏覽器登入 mrqtim@gmail.com，開啟 https://script.google.com/
 * 2. 點擊「新增專案」
 * 3. 清空編輯器原有內容，將本程式碼全部複製貼上
 * 4. 點擊右上角「部署」>「新增部署作業」
 * 5. 齒輪圖示選「網頁應用程式 (Web App)」
 *    - 說明：Calendar Sync API
 *    - 執行身分：我 (mrqtim@gmail.com)
 *    - 誰可以存取：所有人 (Anyone)
 * 6. 點擊「部署」，授權 Google 日曆讀取權限
 * 7. 複製產生的「網頁應用程式網址 (Web App URL)」，貼回對話給我即可！
 */

function doGet(e) {
  try {
    var now = new Date();
    // 預設抓取從今天起未來 2 年內的所有行程
    var twoYearsLater = new Date();
    twoYearsLater.setFullYear(now.getFullYear() + 2);

    var calendar = CalendarApp.getDefaultCalendar();
    var events = calendar.getEvents(now, twoYearsLater);
    
    var result = [];

    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      var title = ev.getTitle();
      
      // 排除無標題或私人標記的隱藏項目 (可自訂)
      if (!title) continue;

      var start = ev.getStartTime();
      var end = ev.getEndTime();
      var isAllDay = ev.isAllDayEvent();
      var location = ev.getLocation() || "未設定地點";
      var id = ev.getId().split('@')[0];

      // 自動依標題或日曆顏色判斷分類 (粉色: 拍攝工作 / 淺藍: 旅行)
      var category = "拍攝工作";
      var type = "work";

      var lowerTitle = title.toLowerCase();
      if (lowerTitle.indexOf("旅行") !== -1 || lowerTitle.indexOf("露營") !== -1 || lowerTitle.indexOf("度假") !== -1 || lowerTitle.indexOf("旅遊") !== -1 || lowerTitle.indexOf("出國") !== -1 || lowerTitle.indexOf("日本") !== -1) {
        category = "旅行";
        type = "travel";
      } else if (lowerTitle.indexOf("同學會") !== -1 || lowerTitle.indexOf("聚餐") !== -1 || lowerTitle.indexOf("聚會") !== -1) {
        category = "聚會活動";
        type = "work";
      }

      // 產生格式化日期字串
      var dateString = formatDateString(start, end, isAllDay);

      result.push({
        id: id,
        title: title,
        category: category,
        type: type,
        startDate: formatISO(start),
        endDate: formatISO(end),
        dateString: dateString,
        location: location,
        calLink: "https://calendar.google.com/calendar/r/eventedit/" + id
      });
    }

    // 依開始日期先後排序
    result.sort(function(a, b) {
      return new Date(a.startDate) - new Date(b.startDate);
    });

    var output = ContentService.createTextOutput(JSON.stringify({
      status: "success",
      updatedAt: new Date().toISOString(),
      count: result.length,
      events: result
    }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;

  } catch (err) {
    var errorOutput = ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    }));
    errorOutput.setMimeType(ContentService.MimeType.JSON);
    return errorOutput;
  }
}

function formatISO(date) {
  return Utilities.formatDate(date, "Asia/Taipei", "yyyy-MM-dd'T'HH:mm:ss");
}

function formatDateString(start, end, isAllDay) {
  var weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  var sYear = start.getFullYear();
  var sMonth = start.getMonth() + 1;
  var sDate = start.getDate();
  var sDay = weekdays[start.getDay()];

  if (isAllDay) {
    // 檢查是否跨日
    var realEnd = new Date(end.getTime() - 1000); // 扣除最後 1 秒以取得實際結束日
    var eMonth = realEnd.getMonth() + 1;
    var eDate = realEnd.getDate();

    if (sMonth === eMonth && sDate === eDate) {
      return sYear + "/" + pad(sMonth) + "/" + pad(sDate) + " (" + sDay + ")";
    } else {
      return sYear + "/" + pad(sMonth) + "/" + pad(sDate) + " – " + pad(eMonth) + "/" + pad(eDate) + " (跨日)";
    }
  } else {
    var sHours = pad(start.getHours());
    var sMins = pad(start.getMinutes());
    return sYear + "/" + pad(sMonth) + "/" + pad(sDate) + " (" + sDay + ") " + sHours + ":" + sMins;
  }
}

function pad(n) {
  return n < 10 ? "0" + n : n;
}
