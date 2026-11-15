import { expect, it, vi } from 'vitest';
import { isProjectOrder, loadProjectOrder, orderStorageKey, slotPoint, studioOrder, swapProject } from '../../src/state/studioLayout';
import { initialWindowState, windowReducer } from '../../src/state/windows';

it('migrates spatial order, preserves old keys, and never resurrects malformed new storage', () => {
 const old = { champ: { x: 33.333, y: 0 }, eau: { x: 0, y: 0 }, silences: { x: 66.666, y: 0 }, revolte: {x:0,y:50}, lisiere:{x:33.333,y:50},elan:{x:66.666,y:50} };
 localStorage.setItem('favour.shortcut-layout.v3', JSON.stringify(old));
 expect(loadProjectOrder('desktop')).toEqual(['eau','champ',...studioOrder.slice(2)]);
 expect(localStorage.getItem('favour.shortcut-layout.v3')).toEqual(JSON.stringify(old));
 localStorage.setItem(orderStorageKey('desktop'), '{bad');
 expect(loadProjectOrder('desktop')).toEqual(studioOrder);
 localStorage.setItem(orderStorageKey('desktop'), JSON.stringify(['champ','champ']));
 expect(loadProjectOrder('desktop')).toEqual(studioOrder);
 const denied = vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw Error('Denied'); });
 expect(loadProjectOrder('desktop')).toEqual(studioOrder); denied.mockRestore();
});
it('uses responsive slots and swaps without collisions or missing projects', () => {
 expect(slotPoint(4,6)).toEqual({x:400/6,y:0});
 expect(slotPoint(4,3)).toEqual({x:100/3,y:50});
 const swapped = swapProject(studioOrder,'champ',{x:500/6,y:0},6);
 expect(swapped).toEqual(['elan',...studioOrder.slice(1,5),'champ']);
 expect(isProjectOrder(swapped)).toBe(true);
 expect(swapProject(studioOrder,'champ',{x:-200,y:-200},3)).toEqual(studioOrder);
});
it('reuses the case window geometry and expansion while retaining unrelated windows', () => {
 let state = windowReducer(initialWindowState,{type:'open',key:'notes'});
 state = windowReducer(state,{type:'open',key:'project:champ',projectKey:'champ'});
 state = windowReducer(state,{type:'move',key:'project:champ',position:{x:123,y:45}});
 state = windowReducer(state,{type:'expand',key:'project:champ'});
 state = windowReducer(state,{type:'replace-project',key:'project:champ',projectKey:'eau'});
 expect(state.windows).toHaveLength(2);
 expect(state.windows.find(w=>w.projectKey)).toMatchObject({key:'project:eau',instanceKey:'project:champ',expanded:true,position:{x:123,y:45}});
 state = windowReducer(state,{type:'replace-project',key:'project:eau',projectKey:'champ'});
 expect(state.windows.find(w=>w.projectKey)?.instanceKey).toBe('project:champ');
});
