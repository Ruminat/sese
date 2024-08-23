import { map } from "nanostores";
import { TAppState } from "../../definitions";

const defaults: Record<string, unknown> = {};

const prefix = `se`;
const name = {
  app: (name: string) => `${prefix}.app.${name}`,
};

export const LocalStorage = {
  app: {
    state: setting<TAppState>(name.app("state"), { documents: [] }),
  },
};

export const localStorageKeys: string[] = Object.keys(defaults);

export type TEStoreSetting<TValue> = ReturnType<typeof setting<TValue>>;

function setting<TValue>(name: string, defaultValue: TValue) {
  if (name in defaults) {
    throw new Error(`KEY ${name} IS ALREADY TAKEN`);
  }

  defaults[name] = defaultValue;

  return {
    name,
    defaultValue,
    read: (): TValue => $LocalStorage.get()[name] as TValue,
    write: (value: TValue | undefined) => {
      $LocalStorage.setKey(name, value);
      localStorage.setItem(name, JSON.stringify(value));
    },
  };
}

export const $LocalStorage = map<Record<string, unknown>>(defaults);
