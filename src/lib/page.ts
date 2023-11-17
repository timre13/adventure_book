export class Button {
    constructor(public text: string) { }
}

export class Enemy {
    constructor(public name: string) { }
}

export class Page {
    constructor(public text: string, public enemies: Array<Enemy>, public buttons: Array<Button>) { }
}
