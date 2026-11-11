// ============================================================
// カレンダーデータ（ページと通知用Service Workerの共通ファイル）
//
// 毎年、地区のごみ出しカレンダーが公開されたら
// このファイルの calendarData だけを書き換えてください。
// ============================================================

// ============================================================
// 「ゴミ収集なし」のアイコン
// ============================================================

const NOTHING_IMAGE = "images/nothing.png";


// ============================================================
// ゴミの種類とアイコン
// ============================================================

const garbageTypes = {

	// --------------------------------------------------------
	// 燃えるごみ
	// --------------------------------------------------------

	fire: {
		name: "燃えるゴミ",
		image: "images/fire.png"
	},


	// --------------------------------------------------------
	// プラスチック
	// --------------------------------------------------------

	plastic: {
		name: "資源ゴミ",
		image: "images/plastic.png"
	},


	// --------------------------------------------------------
	// 埋立・特定
	// --------------------------------------------------------

	land: {
		name: "埋立ゴミ",
		image: "images/land.png"
	},


	// --------------------------------------------------------
	// 金属
	// --------------------------------------------------------

	metal: {
		name: "資源ゴミ",
		image: "images/metal.png"
	},


	// --------------------------------------------------------
	// 紙
	// --------------------------------------------------------

	paper: {
		name: "資源ゴミ",
		image: "images/paper.png"
	},


	// --------------------------------------------------------
	// リサイクルステーション
	// --------------------------------------------------------

	recycleA: {
		name:"リサイクル",
		image: "images/nothingA.png"
	},

	recycleI: {
		name: "リサイクル",
		image: "images/nothingI.png"
	},

	recycleU: {
		name: "リサイクル",
		image: "images/nothingU.png"
	},

	recycleE: {
		name: "リサイクル",
		image: "images/nothingE.png"
	},

	recycleO: {
		name: "リサイクル",
		image: "images/nothingO.png"
	},

	recycleKa: {
		name: "リサイクル",
		image: "images/nothingKA.png"
	},

	recycleKi: {
		name: "リサイクル",
		image: "images/nothingKI.png"
	},

	recycleKu: {
		name: "リサイクル",
		image: "images/nothingKU.png"
	}
};


// ============================================================
// カレンダー
//
// 「日付 : ゴミの種類」
//
// データがない日
// ↓
// ゴミ収集なし
// ============================================================

const calendarData = {

  "2026-09-19": "recycleKi",

  "2026-09-21": "paper",
  "2026-09-22": "fire",
  "2026-09-24": "plastic",
  "2026-09-25": "fire",
  "2026-09-26": "recycleKu",

  "2026-09-28": "metal",
  "2026-09-29": "fire",

  "2026-10-01": "plastic",
  "2026-10-02": "fire",
  "2026-10-03": "recycleA",

  "2026-10-05": "paper",
  "2026-10-06": "fire",
  "2026-10-07": "land",
  "2026-10-08": "plastic",
  "2026-10-09": "fire",
  "2026-10-10": "recycleI",

  "2026-10-12": "metal",
  "2026-10-13": "fire",
  "2026-10-15": "plastic",
  "2026-10-16": "fire",
  "2026-10-17": "recycleU",

  "2026-10-19": "paper",
  "2026-10-20": "fire",
  "2026-10-21": "land",
  "2026-10-22": "plastic",
  "2026-10-23": "fire",
  "2026-10-24": "recycleE",

  "2026-10-26": "metal",
  "2026-10-27": "fire",
  "2026-10-29": "plastic",
  "2026-10-30": "fire",

  "2026-11-02": "paper",
  "2026-11-03": "fire",
  "2026-11-04": "land",
  "2026-11-05": "plastic",
  "2026-11-06": "fire",
  "2026-11-07": "recycleO",

  "2026-11-09": "metal",
  "2026-11-10": "fire",
  "2026-11-12": "plastic",
  "2026-11-13": "fire",
  "2026-11-14": "recycleKa",

  "2026-11-16": "paper",
  "2026-11-17": "fire",
  "2026-11-18": "land",
  "2026-11-19": "plastic",
  "2026-11-20": "fire",
  "2026-11-21": "recycleKi",

  "2026-11-23": "metal",
  "2026-11-24": "fire",
  "2026-11-26": "plastic",
  "2026-11-27": "fire",
  "2026-11-28": "recycleKu",

  "2026-12-01": "fire",
  "2026-12-02": "land",
  "2026-12-03": "plastic",
  "2026-12-04": "fire",
  "2026-12-05": "recycleA",

  "2026-12-07": "paper",
  "2026-12-08": "fire",
  "2026-12-10": "plastic",
  "2026-12-11": "fire",
  "2026-12-12": "recycleI",

  "2026-12-14": "metal",
  "2026-12-15": "fire",
  "2026-12-16": "land",
  "2026-12-17": "plastic",
  "2026-12-18": "fire",
  "2026-12-19": "recycleU",

  "2026-12-21": "paper",
  "2026-12-22": "fire",
  "2026-12-24": "plastic",
  "2026-12-25": "fire",
  "2026-12-26": "recycleE",

  "2026-12-28": "metal",
  "2026-12-29": "fire",
  "2026-12-31": "plastic",

  "2027-01-04": "paper",
  "2027-01-05": "fire",
  "2027-01-06": "land",
  "2027-01-07": "plastic",
  "2027-01-08": "fire",
  "2027-01-09": "recycleO",

  "2027-01-11": "metal",
  "2027-01-12": "fire",
  "2027-01-14": "plastic",
  "2027-01-15": "fire",
  "2027-01-16": "recycleKa",

  "2027-01-18": "paper",
  "2027-01-19": "fire",
  "2027-01-20": "land",
  "2027-01-21": "plastic",
  "2027-01-22": "fire",
  "2027-01-23": "recycleKi",

  "2027-01-25": "metal",
  "2027-01-26": "fire",
  "2027-01-28": "plastic",
  "2027-01-29": "fire",
  "2027-01-30": "recycleKu",

  "2027-02-01": "paper",
  "2027-02-02": "fire",
  "2027-02-03": "land",
  "2027-02-04": "plastic",
  "2027-02-05": "fire",
  "2027-02-06": "recycleA",

  "2027-02-08": "metal",
  "2027-02-09": "fire",
  "2027-02-11": "plastic",
  "2027-02-12": "fire",
  "2027-02-13": "recycleI",

  "2027-02-15": "paper",
  "2027-02-16": "fire",
  "2027-02-17": "land",
  "2027-02-18": "plastic",
  "2027-02-19": "fire",
  "2027-02-20": "recycleU",

  "2027-02-22": "metal",
  "2027-02-23": "fire",
  "2027-02-25": "plastic",
  "2027-02-26": "fire",
  "2027-02-27": "recycleE",

  "2027-03-01": "paper",
  "2027-03-02": "fire",
  "2027-03-03": "land",
  "2027-03-04": "plastic",
  "2027-03-05": "fire",
  "2027-03-06": "recycleO",

  "2027-03-08": "metal",
  "2027-03-09": "fire",
  "2027-03-11": "plastic",
  "2027-03-12": "fire",
  "2027-03-13": "recycleKa",

  "2027-03-15": "paper",
  "2027-03-16": "fire",
  "2027-03-17": "land",
  "2027-03-18": "plastic",
  "2027-03-19": "fire",
  "2027-03-20": "recycleKi",

  "2027-03-22": "metal",
  "2027-03-23": "fire",
  "2027-03-25": "plastic",
  "2027-03-26": "fire",
  "2027-03-27": "recycleKu",

  "2027-03-30": "fire"
	
};


// ============================================================
// カレンダーデータの登録範囲
// （範囲外の日は「回収なし」ではなく「未登録」と扱う）
// ============================================================

const registeredKeys = Object.keys(calendarData).sort();
const FIRST_KEY = registeredKeys[0];
const LAST_KEY = registeredKeys[registeredKeys.length - 1];


// ============================================================
// 日付を YYYY-MM-DD に変換
// ============================================================

function formatDateKey(date) {

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}


// ============================================================
// ある日のごみ情報を調べる
//
//   garbage      … ごみの収集あり
//   none         … 収集なし
//   unregistered … カレンダーデータの範囲外
// ============================================================

function lookupDay(date) {

	const key = formatDateKey(date);
	const type = calendarData[key];

	if (type && garbageTypes[type]) {
		return { status: "garbage", garbage: garbageTypes[type] };
	}

	if (key < FIRST_KEY || key > LAST_KEY) {
		return { status: "unregistered" };
	}

	return { status: "none" };
}


// ============================================================
// 通知の文面（今日と明日のごみ）
//
// サーバーは「通知してよい時刻になった」ことだけを知らせ、
// 文面はこの関数で端末側が作る。
// ============================================================

function describeDay(label, result) {

	if (result.status === "garbage") {
		return `${label}は${result.garbage.name}の回収日です。`;
	}

	if (result.status === "none") {
		return `${label}はごみの回収はありません。`;
	}

	return `${label}のごみ収集日はまだ登録されていません。`;
}

function buildDailyNotification(now) {

	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

	const todayResult = lookupDay(today);
	const tomorrowResult = lookupDay(tomorrow);

	return {
		title: describeDay("今日", todayResult),
		body: describeDay("明日", tomorrowResult),
		icon: todayResult.status === "garbage"
			? todayResult.garbage.image
			: NOTHING_IMAGE
	};
}
