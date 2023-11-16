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

export function conditionHandler(conString: string): void {
    console.log(eval(conString));


}
