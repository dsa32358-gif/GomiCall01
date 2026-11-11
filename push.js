// ============================================================
// プッシュ通知の登録（ページ側）
//
// 「通知を受け取る」ボタン → 通知の許可 → 端末の購読情報を作成
// → 通知時刻と一緒にサーバー(Cloudflare Worker)へ登録する。
// ============================================================


// ============================================================
// ★ 設定（セットアップ手順書の手順で書き換えてください）
// ============================================================

// Cloudflare Worker のURL（末尾の / は付けない）
const PUSH_API_URL = "https://gomicall-push.dsa32358.workers.dev";

// VAPID公開鍵（キー生成ツールで作った「公開鍵」）
const VAPID_PUBLIC_KEY = "BCrTwF7bJ9Uiq7iKN_hKJ-6TzAPcXiYFQH1huaBTFtNG7JugHb1knVSdGUf5P1HRlSnLDocJ2QSgaMfyFX2q9hc";


// ============================================================
// 端末の状態を調べる
// ============================================================

function isIosDevice() {

	return /iPhone|iPad|iPod/.test(navigator.userAgent) ||
		(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone() {

	return window.navigator.standalone === true ||
		window.matchMedia("(display-mode: standalone)").matches;
}

function pushIsSupported() {

	return "serviceWorker" in navigator &&
		"PushManager" in window &&
		"Notification" in window;
}


// ============================================================
// 小さな道具
// ============================================================

// 公開鍵(base64url) → Uint8Array
function urlBase64ToUint8Array(base64String) {

	const padding = "=".repeat((4 - base64String.length % 4) % 4);

	const base64 = (base64String + padding)
		.replace(/-/g, "+")
		.replace(/_/g, "/");

	const raw = atob(base64);
	const output = new Uint8Array(raw.length);

	for (let i = 0; i < raw.length; i++) {
		output[i] = raw.charCodeAt(i);
	}

	return output;
}

async function postToServer(path, body) {

	const response = await fetch(PUSH_API_URL + path, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		throw new Error("server " + response.status);
	}
}

function pad2(number) {

	return String(number).padStart(2, "0");
}


// ============================================================
// 画面部品の取得
// ============================================================

const pushBox = document.getElementById("push-box");
const pushMessage = document.getElementById("push-message");
const pushEnableButton = document.getElementById("push-enable");
const pushTestButton = document.getElementById("push-test");
const pushDisableButton = document.getElementById("push-disable");

let pushRegistration = null;


// ============================================================
// 画面の更新
// ============================================================

function showMessage(text) {

	pushMessage.textContent = text;
}

function showButtons(enable, test, disable) {

	pushEnableButton.hidden = !enable;
	pushTestButton.hidden = !test;
	pushDisableButton.hidden = !disable;
}

async function refreshPushUi() {

	// --- 通知に対応していない端末・ブラウザ ---
	if (!pushIsSupported()) {

		showButtons(false, false, false);

		if (isIosDevice() && !isStandalone()) {
			showMessage(
				"iPhone・iPadで通知を受け取るには、先にこのサイトをホーム画面に追加してください。" +
				"Safariの共有ボタン（□に↑のマーク）→「ホーム画面に追加」を選び、" +
				"ホーム画面にできたGomiCallのアイコンから開き直すと、ここに「通知を受け取る」ボタンが表示されます。"
			);
		} else {
			showMessage("このブラウザは通知に対応していません。");
		}

		return;
	}

	// --- 通知がブロックされている ---
	if (Notification.permission === "denied") {

		showButtons(false, false, false);

		showMessage(
			"通知がブロックされています。端末の設定で、このサイト（GomiCall）の通知を許可してから、ページを開き直してください。"
		);

		return;
	}

	// --- 購読中かどうか ---
	let subscription = null;

	if (pushRegistration) {
		subscription = await pushRegistration.pushManager.getSubscription();
	}

	if (subscription && Notification.permission === "granted") {

		showButtons(false, true, true);

		showMessage(
			`通知は有効です。毎日 ${pad2(shiftHour)}:${pad2(shiftMinute)} に、今日と明日のごみをお知らせします。`
		);

		return;
	}

	showButtons(true, false, false);

	showMessage(
		`上で設定した時刻（${pad2(shiftHour)}:${pad2(shiftMinute)}）に、今日と明日のごみをスマートフォンへお知らせします。`
	);
}


// ============================================================
// 通知を受け取る
// ============================================================

async function enablePush() {

	pushEnableButton.disabled = true;

	try {

		const permission = await Notification.requestPermission();

		if (permission !== "granted") {
			await refreshPushUi();
			return;
		}

		const registration = await navigator.serviceWorker.ready;

		pushRegistration = registration;

		let subscription = await registration.pushManager.getSubscription();

		if (!subscription) {

			subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
			});
		}

		try {

			await sendSubscription(subscription);

		} catch (error) {

			// サーバーに登録できなかった場合は、端末側も元に戻す
			await subscription.unsubscribe();
			throw error;
		}

		await refreshPushUi();

	} catch (error) {

		console.error(error);

		showMessage("通知の登録に失敗しました。電波の良い場所で、もう一度お試しください。");

	} finally {

		pushEnableButton.disabled = false;
	}
}

// 購読情報と通知時刻をサーバーへ送る
async function sendSubscription(subscription) {

	await postToServer("/subscribe", {
		endpoint: subscription.endpoint,
		hour: shiftHour,
		minute: shiftMinute
	});

	try {
		localStorage.setItem("pushSyncedOn", formatDateKey(new Date()));
	} catch (e) {
		// 保存できなくても動作は続ける
	}
}


// ============================================================
// 通知を解除
// ============================================================

async function disablePush() {

	pushDisableButton.disabled = true;

	try {

		const subscription = pushRegistration
			? await pushRegistration.pushManager.getSubscription()
			: null;

		if (subscription) {

			const endpoint = subscription.endpoint;

			await subscription.unsubscribe();

			try {
				await postToServer("/unsubscribe", { endpoint });
			} catch (e) {
				// サーバーへの連絡に失敗しても、端末側は解除済み
				// （サーバーは次回の送信時に無効な宛先として自動削除する）
			}
		}

	} finally {

		pushDisableButton.disabled = false;
		await refreshPushUi();
	}
}


// ============================================================
// テスト通知（サーバーを通さず、この端末だけで表示を確認する）
// ============================================================

async function showTestNotification() {

	if (!pushRegistration) {
		return;
	}

	const notification = buildDailyNotification(new Date());

	await pushRegistration.showNotification(notification.title, {
		body: notification.body,
		icon: notification.icon,
		badge: "icons/icon-192.png",
		tag: "gomicall-test",
		data: { url: "./" }
	});
}


// ============================================================
// 通知時刻を変更したとき・ページを開いたとき
// ============================================================

async function syncSubscription() {

	if (!pushRegistration) {
		return;
	}

	const subscription = await pushRegistration.pushManager.getSubscription();

	if (subscription && Notification.permission === "granted") {

		try {
			await sendSubscription(subscription);
		} catch (error) {
			console.error(error);
		}
	}

	await refreshPushUi();
}

document.addEventListener("notification-time-changed", syncSubscription);


// ============================================================
// 起動
// ============================================================

async function initPush() {

	// 設定が未入力のときは、通知の欄ごと隠す
	if (!PUSH_API_URL || !VAPID_PUBLIC_KEY) {
		return;
	}

	if (!pushBox) {
		return;
	}

	pushBox.hidden = false;

	pushEnableButton.addEventListener("click", enablePush);
	pushDisableButton.addEventListener("click", disablePush);
	pushTestButton.addEventListener("click", showTestNotification);

	if ("serviceWorker" in navigator) {

		try {

			pushRegistration = await navigator.serviceWorker.register("sw.js");

			await navigator.serviceWorker.ready;

		} catch (error) {
			console.error(error);
		}
	}

	await refreshPushUi();

	// 1日1回、ページを開いたときにサーバーの登録内容を最新に保つ
	// （端末側で購読情報が更新された場合に備える）
	let syncedOn = null;

	try {
		syncedOn = localStorage.getItem("pushSyncedOn");
	} catch (e) {
		syncedOn = null;
	}

	if (syncedOn !== formatDateKey(new Date())) {
		await syncSubscription();
	}
}

initPush();
