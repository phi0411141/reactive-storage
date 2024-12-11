
import { test } from 'vitest'
import { ReactiveStorage } from '../ReactiveStorage'
import {Adaptor} from '../reactive-storage-types';
import {createStorageOption} from '../utils';

type Expect<T extends true> = T
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

test('It should achieve type safety when get/set/register a key', () => {
    const KEY_1 = createStorageOption<string>({
        persistent: false
    })

    const st = new ReactiveStorage({
        get: ()=>{},
        set: ()=>{},
    } as unknown as Adaptor, {
        KEY_1
    })

    const f = st.get('KEY_1')

    type ArgType = Parameters<typeof st.set<'KEY_1'>>[1]

    type Cases = [
        Expect<Equal<typeof f, string | null>>,
        Expect<Equal<ArgType, string>>,
    ]
})
