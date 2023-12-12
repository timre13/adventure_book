import { Inventory } from "$lib/Inventory";
import type { Stat } from "$lib/status";
import { writable, type Writable } from "svelte/store";

export const stats: Writable<Array<Stat>> = writable([]);
export const inventory: Writable<Inventory> = writable(new Inventory());
