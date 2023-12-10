export interface OptionCheck {}

export class OptionCheckGroup {
    public checks: Array<OptionCheck>;

    constructor(checks: Array<OptionCheck>) {
        this.checks = checks;
    }
}
