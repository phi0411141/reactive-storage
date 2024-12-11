export type UnregisterFn = () => void;

export interface Adaptor {
    get: (key: string) => string | null;
    set: (key: string, newValue: string) => void;
    remove: (key: string) => void;
    clear?: () => void;
    onValueChanged<Value>(key: string, callback: (val: Value) => void): UnregisterFn;
}

export interface IStorageOptions<T = any> {
    // format before save to storage
    serialize?: (value: any) => string;
    // format after get from storage
    deserialize?: (value: string) => T;
    // if true, the value will not be cleared when the storage is cleared
    persistent: boolean;
}

export interface IStorageOptionsWithSerializeAndDeserialize<T = any> {
    // format before save to storage
    serialize: (value: any) => string;
    // format after get from storage
    deserialize: (value: string) => T;
    // if true, the value will not be cleared when the storage is cleared
    persistent: boolean;
}


export type StorageKeyMap<T extends Record<string, IStorageOptions>> = {
    [K in keyof T]: IStorageOptionsWithSerializeAndDeserialize<T[K]>;
};

export type ListenerFn<Value> = (newVal: Value) => void;

export interface RegisterOptions {}

export type StorageKey<T = any> = T extends string
    ? IStorageOptions<T>
    : IStorageOptionsWithSerializeAndDeserialize<T>;

export type InferStorageType<
    T extends IStorageOptions | IStorageOptionsWithSerializeAndDeserialize,
> = T extends IStorageOptionsWithSerializeAndDeserialize<infer P>
    ? P
    : T extends IStorageOptions<infer F>
        ? F
        : unknown;

export type OnlyStringKeys<T> = keyof T & string;
