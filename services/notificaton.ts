export function requestNotificationPermission() {
  if (typeof window === "undefined") return;

  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}