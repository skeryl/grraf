export class FixedPool<T> {

    private readonly _elements: Array<T>;

    constructor(
        public readonly size: number,
        public readonly timeToLive: number
    ){
        this.size = Math.floor(size);
        this._elements = new Array<T>(this.size);
    }
    add(elem: T){

        while(this._elements.length >= this.size){
            this._elements.shift();
        }

        this._elements.push(elem);

        setTimeout(() => this._elements.shift(), this.timeToLive);
    }

    elements(): Array<T> {
        return this._elements;
    }
}