import { defineStore } from "pinia";

interface Notification {
  title: string;
  message: string;
  color?: "green" | "red" | "yellow";
  time: Date;
}

const TIMEOUT = 5000;

const audio = new Audio("/notifications.mp3");
const emergencyAudio = new Audio("/emergency.mp3");
export const useNotificationsStore = defineStore("notifications", {
  state: () => ({
    notifications: [] as (Notification & { id: number; time: Date })[],
    critical: [] as (Notification & { id: number; time: Date })[],
    audio: audio,
    count: 1,
  }),
  actions: {
    add(value: Notification) {
      if (value.color && value.color === "red" && !value.title.endsWith("Offline")) {
        this.critical.push({ ...value, id: this.count++, time: new Date() });
        if (value.title.endsWith("Triggered")) {
          emergencyAudio.play();
        } else {
          audio.play();
        }
      } else {
        this.notifications.push({
          ...value,
          id: this.count++,
          time: new Date(),
        });
      }
    },
    clean() {
      const now = new Date().getTime();
      this.notifications = this.notifications.filter((n) =>
        n.color && n.color !== "green" ? true : now - n.time.getTime() < TIMEOUT
      );
    },
    remove(id: number) {
      this.notifications = this.notifications.filter((n) => n.id !== id);
      this.critical = this.critical.filter((n) => n.id !== id);
    },
  },
});
