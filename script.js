// シフト時の通知音
const music = new Audio('sounds/sound01.mp3');
music.preload = "auto";

// ごみのデータ・日付の判定は calendar-data.js にあります
// （index.html で先に読み込みます）


// ============================================================
// 切り替え時刻（＝通知時刻）の設定
// ============================================================

const DEFAULT_SHIFT_HOUR = 14;
const DEFAULT_SHIFT_MINUTE = 26;

// localStorageが使えない環境（プライベートモード等）でも止まらないようにする
function loadSetting(key, fallback, max) {

	try {
		const value = localStorage.getItem(key);

		if (value === null) {
			return fallback;
		}

		const number = Number(value);

		return (Number.isInteger(number) && number >= 0 && number <= max)
			? number
			: fallback;

	} catch (e) {
		return fallback;
	}
}

function saveSetting(key, value) {

	try {
		localStorage.setItem(key, String(value));
	} catch (e) {
		// 保存できなくても動作は続ける
	}
}

// 最初の描画より前に、保存済みの設定を読み込む
let shiftHour = loadSetting("notificationHour", DEFAULT_SHIFT_HOUR, 23);
let shiftMinute = loadSetting("notificationMinute", DEFAULT_SHIFT_MINUTE, 59);


// ============================================================
// 日付まわりの関数
// ============================================================

const weekNames = ["日", "月", "火", "水", "木", "金", "土"];

// 日付を表示用（月/日）に変換
function formatDateText(date) {

	return `${date.getMonth() + 1}/${date.getDate()}`;
}

// n日後の0時の日付を返す
function addDays(date, days) {

	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate() + days
	);
}


// ============================================================
// 表示
// ============================================================

function createImage(src, alt) {

	const image = document.createElement("img");

	image.src = src;
	image.alt = alt;

	return image;
}

// 1日分のデータを表示（Box1～7・Box8 共通）
// textTag … ごみ名を入れる要素（Box8は横並びなので span）
function renderDay(dataElement, date, textTag) {

	const result = lookupDay(date);

	dataElement.replaceChildren();

	// ごみの収集あり
	if (result.status === "garbage") {

		const garbage = result.garbage;

		if (garbage.image) {
			// 隣に文字があるので、画像のaltは空（読み上げの重複を防ぐ）
			dataElement.appendChild(createImage(garbage.image, ""));
		}

		const text = document.createElement(textTag);
		text.textContent = garbage.name;
		dataElement.appendChild(text);

		return;
	}

	// 収集なし
	if (result.status === "none") {
		dataElement.appendChild(createImage(NOTHING_IMAGE, ""));
	}

	const note = document.createElement("div");
	note.className = "no-data";
	note.textContent =
		result.status === "none" ? "回収なし" : "未登録";

	dataElement.appendChild(note);
}

// Box1～7（日付ごと）を描画
function renderBox(box, date) {

	const dayIndex = date.getDay();

	box.querySelector(".boxtext").textContent = weekNames[dayIndex];
	box.querySelector(".boxdate").textContent = formatDateText(date);

	box.classList.toggle("sunday", dayIndex === 0);
	box.classList.toggle("saturday", dayIndex === 6);

	renderDay(box.querySelector(".boxdata"), date, "div");
}

// Box8（「今日は」）を描画。date が null なら空欄
function renderToday(date) {

	const dataElement = document.querySelector(".box-8 .boxdata");

	if (!dataElement) {
		return;
	}

	if (!date) {
		dataElement.replaceChildren();
		return;
	}

	renderDay(dataElement, date, "span");
}


// ============================================================
// 音と読み上げ
// ============================================================

function playSound() {

	try {
		music.currentTime = 0;

		const promise = music.play();

		// 自動再生がブロックされても、エラーを出さずに続ける
		if (promise && promise.catch) {
			promise.catch(() => {});
		}

	} catch (e) {
		// 再生できなくても動作は続ける
	}
}

function speakSummary(today, tomorrow) {

	if (!("speechSynthesis" in window)) {
		return;
	}

	function describe(label, date) {

		const result = lookupDay(date);

		if (result.status === "garbage") {
			return `${label}は${result.garbage.name}の回収びです。`;
		}

		if (result.status === "none") {
			return `${label}はごみの回収はありません。`;
		}

		return `${label}のごみ収集日はまだ登録されていません。`;
	}

	const speechText =
		describe("今日", today) +
		"また、" +
		describe("明日", tomorrow);

	window.speechSynthesis.cancel();

	const utterance = new SpeechSynthesisUtterance(speechText);

	utterance.lang = "ja-JP";
	utterance.rate = 1.0;
	utterance.pitch = 1.0;
	utterance.volume = 1.0;

	window.speechSynthesis.speak(utterance);
}


// ============================================================
// 画面の更新
//
// 表示内容は「今日の日付」と「切り替え時刻を過ぎたか」だけで決まる。
//
//   切り替え前 … Box1 = 今日 / Box8 = 空欄
//   切り替え後 … Box1 = 明日 / Box8 = 今日
//
// 状態を保存せず毎回その場で計算するので、
// ページを開きっぱなしでも、日をまたいでも、
// スリープから復帰しても表示がずれない。
// ============================================================

let lastState = null;

function render() {

	const now = new Date();

	const dateKey = formatDateKey(now);

	const shifted =
		now.getHours() * 60 + now.getMinutes() >=
		shiftHour * 60 + shiftMinute;

	// 前回と同じ状態なら何もしない
	if (
		lastState &&
		lastState.dateKey === dateKey &&
		lastState.shifted === shifted
	) {
		return;
	}

	// 開いたまま切り替え時刻を迎えた時だけ、音と読み上げを行う
	const announce =
		lastState !== null &&
		lastState.dateKey === dateKey &&
		!lastState.shifted &&
		shifted;

	lastState = { dateKey, shifted };

	const today = addDays(now, 0);
	const tomorrow = addDays(now, 1);
	const start = shifted ? tomorrow : today;

	getBoxes().forEach((box, index) => {
		renderBox(box, addDays(start, index));
	});

	renderToday(shifted ? today : null);

	if (announce) {
		playSound();
		speakSummary(today, tomorrow);
	}
}

function getBoxes() {

	return document.querySelectorAll(".table-container .box");
}


// ============================================================
// 通知時刻の設定欄
// ============================================================

function fillSelect(select, count) {

	for (let i = 0; i < count; i++) {

		const option = document.createElement("option");

		option.value = i;
		option.textContent = String(i).padStart(2, "0");

		select.appendChild(option);
	}
}

function setupNotificationSettings() {

	const hourSelect = document.getElementById("notification-hour");
	const minuteSelect = document.getElementById("notification-minute");
	const saveButton = document.getElementById("save-notification-time");
	const status = document.getElementById("notification-status");

	if (!hourSelect || !minuteSelect || !saveButton || !status) {
		return;
	}

	fillSelect(hourSelect, 24);
	fillSelect(minuteSelect, 60);

	hourSelect.value = shiftHour;
	minuteSelect.value = shiftMinute;

	function showStatus() {

		const hour = String(shiftHour).padStart(2, "0");
		const minute = String(shiftMinute).padStart(2, "0");

		status.textContent = `現在の通知時刻：${hour}:${minute}`;
	}

	showStatus();

	saveButton.addEventListener("click", () => {

		shiftHour = Number(hourSelect.value);
		shiftMinute = Number(minuteSelect.value);

		saveSetting("notificationHour", shiftHour);
		saveSetting("notificationMinute", shiftMinute);

		showStatus();

		// 新しい時刻で表示をすぐ更新
		render();

		// 通知の購読中なら、サーバー側の時刻も更新する（push.js が受け取る）
		document.dispatchEvent(new CustomEvent("notification-time-changed"));
	});
}


// ============================================================
// ページ読み込み
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

	setupNotificationSettings();

	render();

	// 30秒ごとに、切り替え時刻・日付が変わったか確認
	setInterval(render, 30 * 1000);

	// スマホのスリープやタブ切り替えから戻った時にも確認
	document.addEventListener("visibilitychange", () => {

		if (!document.hidden) {
			render();
		}
	});
});


// ============================================================
// カレンダーのフルスクリーン表示
// （Fullscreen APIが使えない端末ではページいっぱいの表示に切り替え）
// ============================================================

(function () {

    const frame =
        document.getElementById("calendar-frame");

    const button =
        document.getElementById("fullscreen-button");

    const label =
        document.getElementById("fullscreen-label");

    if (!frame || !button) {
        return;
    }

    const canFullscreen =
        !!(frame.requestFullscreen ||
           frame.webkitRequestFullscreen);

    function isNativeFullscreen() {
        return !!(document.fullscreenElement ||
                  document.webkitFullscreenElement);
    }

    function applyState(on) {

        frame.classList.toggle("is-fullscreen", on);

        document.body.style.overflow =
            on ? "hidden" : "";

        button.setAttribute("aria-pressed", String(on));

        label.textContent =
            on ? "全画面を終了" : "全画面表示";
    }

    function enter() {

        if (canFullscreen) {

            const request =
                frame.requestFullscreen ||
                frame.webkitRequestFullscreen;

            Promise.resolve(request.call(frame))
                .catch(function () {
                    // 失敗してもページいっぱいの表示は維持
                });
        }

        applyState(true);
    }

    function exit() {

        if (isNativeFullscreen()) {

            const close =
                document.exitFullscreen ||
                document.webkitExitFullscreen;

            close.call(document);
        }

        applyState(false);
    }

    button.addEventListener("click", function () {

        if (frame.classList.contains("is-fullscreen")) {
            exit();
        } else {
            enter();
        }
    });

    // Escキーなどでフルスクリーンが解除されたとき
    function onChange() {

        if (!isNativeFullscreen()) {
            applyState(false);
        }
    }

    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);

    // ページいっぱい表示のときのEscキー
    document.addEventListener("keydown", function (e) {

        if (e.key === "Escape" &&
            frame.classList.contains("is-fullscreen") &&
            !isNativeFullscreen()) {

            applyState(false);
        }
    });

})();
