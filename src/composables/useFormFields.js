import { computed } from "vue";

export const useFormFields = (model, keys) =>
  Object.fromEntries(
    keys.map((key) => [
      key,
      computed({
        get: () => model.value[key],
        set: (value) => {
          model.value = { ...model.value, [key]: value };
        },
      }),
    ]),
  );
