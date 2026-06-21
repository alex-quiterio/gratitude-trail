self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Gratitude Token", body: event.data.text() };
  }

  const title = data.title ?? "Gratitude Token";
  const options = {
    body: data.body ?? "Someone just passed it forward ✦",
    icon: "/icon.png",
    tag: data.token ?? "gratitude",
    renotify: true,
    data: { token: data.token },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const token = event.notification.data?.token;
  const url = token ? `/c/${token}` : "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      }),
  );
});
