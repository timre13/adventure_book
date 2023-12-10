export class InventoryGroup {
    name: string;
    items: Record<string, number> = {};

    constructor(name: string) {
        this.name = name;
    }
}

export class Inventory {
    groups: Array<InventoryGroup> = [];
}
