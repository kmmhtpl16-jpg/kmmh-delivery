// sw.js — ตัวรับแจ้งเตือน (Web Push) ของแอปจัดส่ง KMMH · 30 ก.ย.69
// ⚠️ ไฟล์นี้ "ไม่แคชอะไรเลย" (ไม่มี fetch handler) — หน้าเว็บโหลดของใหม่จากเซิร์ฟเวอร์ทุกครั้งเหมือนเดิม
//    ถ้าวันหน้าจะเพิ่มแคช ต้องคิดเรื่องของเก่าค้างให้ดีก่อน (เคยเจอปัญหาของเก่ากระพริบในหน้าจองคิวมาแล้ว)

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: 'KMMH จัดส่ง', body: e.data ? e.data.text() : '' }; }
  var title = d.title || 'KMMH จัดส่ง';
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || '',
    tag: d.tag || undefined,          // คันเดียวกัน ข้อความใหม่ทับอันเก่า
    renotify: !!d.tag,                // ทับแล้วยังดัง/สั่นอีกรอบ
    icon: 'icon-app-192.png',
    badge: 'icon-app-192.png',
    data: { url: d.url || 'index.html' }
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var target = new URL((e.notification.data && e.notification.data.url) || 'index.html', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if (c.url.split('?')[0] === target.split('?')[0] && 'focus' in c) return c.focus();
    }
    for (var j = 0; j < list.length; j++) {
      if ('navigate' in list[j]) return list[j].navigate(target).then(function (c) { return c && c.focus(); });
    }
    return self.clients.openWindow(target);
  }));
});
