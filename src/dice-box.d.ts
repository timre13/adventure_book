declare module "@3d-dice/dice-box" {
    export default class DiceBox {
        constructor(selector: string, options: any);
        init(): Promise<void>;
        roll(amount: string): void;
        onRollComplete(result: any): void;
    }
}
