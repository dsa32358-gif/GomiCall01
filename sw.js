// ============================================================
// GomiCall 通知用 Service Worker
//
// サーバーからの「時刻になりました」という合図（中身なしのプッシュ）を
// 受け取ったら、カレンダーデータから今日・明日のごみを調べて通知を表示する。
// ============================================================

importScripts("calendar-data.js");


// 更新したら、すぐ新しいService Workerに切り替える
self.addEventListener("install", () => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim());
});


// ------------------------------------------------------------
// プッシュを受信 → 通知を表示
// （iPhoneでは、受信したら必ず通知を表示する必要がある）
// ------------------------------------------------------------

self.addEventListener("push", (event) => {

	const notification = buildDailyNotification(new Date());

	event.waitUntil(
		self.registration.showNotification(notification.title, {
			body: notification.body,
			icon: notification.icon,
			badge: "icons/icon-192.png",
			tag: "gomicall-daily",   // 同じ日の通知は1件にまとめる
			renotify: true,
			data: { url: "./" }
		})
	);
});


// ------------------------------------------------------------
// 通知をタップ → サイトを開く
// ------------------------------------------------------------

self.addEventListener("notificationclick", (event) => {

	event.notification.close();

	const target = new URL(event.notification.data.url, self.registration.scope).href;

	event.waitUntil(
		self.clients.matchAll({ type: "window", includeUncontrolled: true })
			.then((clients) => {

				for (const client of clients) {
					if (client.url.startsWith(self.registration.scope) && "focus" in client) {
						return client.focus();
					}
				}

				return self.clients.openWindow(target);
			})
	);
});
