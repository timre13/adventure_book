export interface OptionAction {}

export class ChangePageAction implements OptionAction {
    constructor(public toPage: string) {}
}

export class ChangeStatAction implements OptionAction {
    constructor(public statName: string) {}
}

export class ChangeItemAction implements OptionAction {
    constructor(public itemName: string) {}
}

export class RestartAction implements OptionAction {}
