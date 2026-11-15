import {act,renderHook} from '@testing-library/react';
import {it,expect,vi} from 'vitest';
import {setEnabled,setVolume} from 'cuelume';
import {useInterfaceSounds,VOLUME_KEY} from '../../src/hooks/useInterfaceSounds';
vi.mock('cuelume',()=>({setEnabled:vi.fn(),setVolume:vi.fn()}));
it('persists volume without enabling muted sound and rejects corrupt values',()=>{
 localStorage.setItem(VOLUME_KEY,'"loud"');const view=renderHook(()=>useInterfaceSounds());
 expect(view.result.current.volume).toBe(.2);expect(view.result.current.enabled).toBe(false);
 act(()=>view.result.current.setVolume(.65));expect(setEnabled).toHaveBeenLastCalledWith(false);expect(setVolume).toHaveBeenLastCalledWith(.65);
 expect(localStorage.getItem(VOLUME_KEY)).toBe('0.65');
 act(()=>view.result.current.setVolume(NaN));expect(view.result.current.volume).toBe(.65);
 act(()=>view.result.current.setEnabled(true));act(()=>view.result.current.setVolume(0));expect(view.result.current.audible).toBe(false);
 act(()=>view.result.current.toggle());expect(view.result.current.audible).toBe(true);expect(view.result.current.volume).toBe(.2);
 view.unmount();const restored=renderHook(()=>useInterfaceSounds());expect(restored.result.current.volume).toBe(.2);
});
