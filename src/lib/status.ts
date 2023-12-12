export class Stat {
    isSeparator = false;
    name: string;
    value: number;
    minValue: number;
    maxValue: number;

    constructor(name: string, value: number, minValue: number, maxValue: number) {
        this.name = name;
        this.value = value;
        this.minValue = minValue;
        this.maxValue = maxValue;
    }
}

export class StatSeparator extends Stat {
    constructor() {
        super("", 0, 0, 0);
        this.isSeparator = true;
    }
}
