export class Stat {
    name: string = "";
    value: number = 0;
    maxValue: number | undefined = undefined;

    constructor(name: string, value: number, maxValue?: number) {
        this.name = name;
        this.value = value;
        this.maxValue = maxValue;
    }
}