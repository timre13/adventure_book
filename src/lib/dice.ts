import DiceBox from "@3d-dice/dice-box";

export class Dice {
    private currentRollComplete = false;
    private currentRollResult: number = 0;
    private buttonClicked = false;

    constructor(private diceBox: DiceBox, private selector: string) {
        this.diceBox.onRollComplete = this.onRollComplete;
    }
    private onRollComplete = (result: any) => {
        this.currentRollComplete = true;
        this.currentRollResult = result[0].value;
    };
    async roll(amount: string) {
        const container = document.querySelector(this.selector)! as HTMLElement;
        const prevResultBox = document.querySelector("#result-box");
        if (prevResultBox != null && prevResultBox.parentElement != null) {
            console.log("removing previous result box");
            prevResultBox.parentElement.removeChild(prevResultBox);
        }
        this.diceBox.roll(amount);
        container.style.pointerEvents = "all";

        container.style.opacity = "1";
        if (!container.parentElement) {
            throw new Error("Dice container has no parent");
        }
        while (!this.currentRollComplete) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        const button = document.createElement("button");
        button.innerText = "Folytatás";
        button.classList.add("accept-button");
        button.onclick = () => {
            // if (this.currentRollComplete) {
            container.style.opacity = "0";
            this.buttonClicked = true;
            button.parentElement!.removeChild(button);
            // }
        };
        container.parentElement.appendChild(button);
        container.classList.add("dice-box-end");
        const resultBox = document.createElement("div");
        resultBox.id = "result-box";
        resultBox.classList.add("result-box");
        resultBox.innerText = this.currentRollResult.toString();
        container.parentElement.appendChild(resultBox);
        while (!this.buttonClicked) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        resultBox.parentElement!.removeChild(resultBox);
        this.currentRollComplete = false;
        this.buttonClicked = false;
        container.style.pointerEvents = "none";
        container.classList.remove("dice-box-end");
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
    return new Dice(diceBox, selector);
}
