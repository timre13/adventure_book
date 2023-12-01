import DiceBox from "@3d-dice/dice-box";

export class Dice {
    private currentRollComplete = false;
    private currentRollResult: number = 0;

    constructor(private diceBox: DiceBox) {
        this.diceBox.onRollComplete = this.onRollComplete;
    }
    private onRollComplete = (result: any) => {
        this.currentRollComplete = true;
        this.currentRollResult = result[0].value;
    };
    async roll(amount: string) {
        this.diceBox.roll(amount);
        while (!this.currentRollComplete) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.currentRollComplete = false;
        return this.currentRollResult;
    }
}

export async function createDice(selector: string) {
    const diceBox = new DiceBox(selector, {
        assetPath: "/assets/",
        scale: 6,
        // theme: "wooden",
        mass: 3,
        gravity: 3,
        friction: 0.8,
        restition: 0.5,
        linearDamping: 0.4,
        angularDamping: 0.6,
        spinForce: 6,
        throwForce: 6,
        startingHeight: 10,
        settleTimeout: 5000,
        themeColor: "#9b9b9b",
        theme: "rock"
    });
    await diceBox.init();
    return new Dice(diceBox);
}
