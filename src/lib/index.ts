// place files you want to import through the `$lib` alias in this folder.

export class Memory {
    //static strings: { [id: string] : string; } = {"A":"B"};
    //static numbers: { [id: string] : string; } = {};
    //static bools: { [id: string] : string; } = {};
    //static lists: { [id: string] : []; } = {};
    // listák: id="listaNeve:0", id="listaNeve:1", stb
    static variables: { [id: string]: any } = {};
}
export let vars: { [id: string]: any } = {};


export function interpreter(XML: string){

    const parser = new DOMParser()
    let source = parser.parseFromString(XML, "text/xml");


    let gameConditions = source.querySelector('game > gameConditions')?.childNodes;
    let char_stats = source.querySelector('game > character > stats')?.childNodes;
    let char_invetory = source.querySelector('game > character > inventory')?.childNodes;
    let pages = source.querySelector('game > pages')?.childNodes;

    if (pages){
        for (let i = 0; i < pages.length; i++) {
            console.log(pages[i].nodeName)
            
            }
    }



}