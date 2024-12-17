## Reactive storage

- Typesafe in mind.
- Least priviledge principle, your app should only set/get/remove/clear values that under your control.
  - Useful for micro-frontends, where you don't want to storage data of other micro-frontends.
  - Useful for multi-projects development in localhost with same domain, example: Do not clear token of other projects.
- No dependency, just pure TS.
- Write your own adaptor to support other storage, e.g. IndexedDB, Firebase, etc.

### Install

```bash
npm install @phi0411141/reactive-storage
```

### Usage

- Only local storage adaptor is provided, you can write your own adaptor to support other storage, e.g. IndexedDB, Firebase, etc.

1. Init the storage instance

```ts
    // createLocalStorageAdaptor: use localStorage to store data
    import {
      ReactiveStorage,
      createLocalStorageAdaptor,
      createStorageOption
    } from "@phi0411141/reactive-storage";

    // define your storage option, remember to pass the generic type
    const ACCESS_TOKEN = createStorageOption<string>({
       persistent: false
     })

    // value other than string need to define "serialize" & "deserialize" function, else TS will complain
    const USER_PROFILE = createStorageOption<{name: string, age: number}>({
       serialize: (val) => JSON.stringify(val),
       deserialize: (val) => JSON.parse(val),
       persistent: false
    })

    // will keep this value when storage.clear()
    const USER_TIMEZONE = createStorageOption<string>({
       persistent: true
    })

    // new and recommended way, for explicit reason
    const reactiveStorage = new ReactiveStorage(createLocalStorageAdaptor(), {
        ACCESS_TOKEN,
        USER_PROFILE,
        USER_TIMEZONE
    });

    // use
    reactiveStorage.get("ACCESS_TOKEN"); // string | null
    reactiveStorage.set("ACCESS_TOKEN", "newToken")
    reactiveStorage.remove("ACCESS_TOKEN")
    reactiveStorage.clear() // clear all non-persistent keys
```

2. React to value changes

Value changes will be propagated through listener.

```ts
import reactiveStorage from './reactiveStorage';

function MyComponent() {
  useEffect(() => {
    // listen to "LANGUAGE" changed
    const unsubcribe = reactiveStorage.registerListener('LANGUAGE', (newLanguage) => {
      console.log(`User has changed the language to: ${newLanguage}`);
    });

    // remember to unsubcribe to prevent mem-leak
    return () => unsubcribe;
  }, []);
}
```

### 3. Adaptor

- Only local storage adaptor is provided, you can write your own adaptor to support other storage, e.g. IndexedDB, Firebase, etc.

```ts
import { createLocalStorageAdaptor } from '@phi0411141/reactive-storage';

const adaptor = createLocalStorageAdaptor('myStorage', {crossTabs: true});
```

Options:
- `storageId`: The id of the storage, it will be used as the key prefix in localStorage.
- `crossTabs`: Whether to listen to other tabs' changes.
  - Default: `false`
  - If you want to listen to other tabs' changes, you need to set `crossTabs` to `true`.
  - This is useful when user logged out in one tab, other tabs should also be logged out.

For other adaptors, please refer to the [examples](https://github.com/phi0411141/reactive-storage/tree/main/examples).