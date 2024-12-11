## Reactive storage

### Usage

1. Init the storage instance

```
    // createLocalStorageAdaptor: use localStorage to store data
    import ReactiveStorage, {
      createLocalStorageAdaptor,
      StorageKey,
      createStorageOption
    } from "./reactiveStorage";

    const ACCESS_TOKEN = createStorageOption<string>({
       persistent: false
     })

    // value other than string need to define "serialize" & "deserialize" function
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
```

2. Get/Set/Clear value

```ts
import reactiveStorage from './reactive-storage';

// new
reactiveStorage.get('TOKEN');
reactiveStorage.set('TOKEN', 'newToken');

// clear, for both
reactiveStorage.remove('TOKEN'); // clear this key only
reactiveStorage.clear(); // clear all "non-persistent" key
```

3. React to value changes

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