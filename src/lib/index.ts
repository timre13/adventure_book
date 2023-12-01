// place files you want to import through the `$lib` alias in this folder.

import { gameState } from "./stores/gameState"


export let vars: { [id: string]: any } = {};

export function interpreter(XML: string) {
    const parser = new DOMParser();
    let source = parser.parseFromString(XML, "text/xml");

    let gameConditions = source.querySelector("game > gameConditions")?.childNodes;
    let char_stats = source.querySelector("game > character > stats")?.childNodes;
    let char_invetory = source.querySelector("game > character > inventory")?.childNodes;
    let pages = source.querySelector("game > pages")?.childNodes;

    let currentState;

    


    currentState = {
        apple: "alma"
    }
    gameState.set(currentState)
}
