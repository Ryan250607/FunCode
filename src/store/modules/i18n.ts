import { defineStore } from "pinia";


const useLocaleStore = defineStore("locale", {
  state: () => {
    return {
      locale: localStorage.getItem("lang") || "en",
    };
  },
  actions: {
    setlocale(locale: any) {
      this.locale = locale;
      localStorage.setItem("lang", locale);
    },
  },
  getters: {},
});

export default useLocaleStore;
