import { defineStore } from "pinia";
import { ref } from "vue";

export const useToastStore = defineStore("toast", () => {
  const messages = ref([]);

  const notify = (text, type = "success") => {
    const id = crypto.randomUUID();
    messages.value.push({ id, text, type });
    window.setTimeout(() => dismiss(id), 3200);
  };

  const dismiss = (id) => {
    messages.value = messages.value.filter((message) => message.id !== id);
  };

  return { messages, notify, dismiss };
});
