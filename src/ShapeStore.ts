import {Shape} from "./shapes/Shape";

export type Layer = Map<number, Shape>;

export class ShapeStore {

    private readonly layers: Map<number, Layer> = new Map<number, Layer>();

    public layerIndices = (): Array<number> => {
        return Array.from(this.layers.keys());
    };

    public getShape = (shapeId: number): Shape | undefined => {
        this.layers.forEach(layer => {
            const shape = layer.get(shapeId);
            if(shape){
                return shape;
            }
        });
        return undefined;
    };

    public set = (shape: Shape, layerIndex: number = 0): ShapeStore => {
        const currentLayer = this.layers.get(shape.layer);
        if(currentLayer){
            currentLayer.delete(shape.id);
        }

        let layer = this.layers.get(layerIndex);

        if (!layer) {
            layer = new Map<number, Shape>();
            this.layers.set(layerIndex, layer);
        }

        layer.set(shape.id, shape);
        return this;
    };

    public removeShape = (shape: Shape) => {
        const layer = this.layers.get(shape.layer);
        if(layer){
            layer.delete(shape.id);
        }
    };

    private shapeSorter = (shapeA: Shape, shapeB: Shape): number => {
        if (shapeA.hasClipping() === shapeB.hasClipping()) {
            return 0;
        }

        if (shapeA.hasClipping()) {
            return -1;
        }

        return 1;
    };

    public forEach = (action: (s: Shape) => void): void => {
        this.layerIndices()
            .sort((a, b) => Math.sign(a - b))
            .forEach(layerIndex => {
                const layer = this.layers.get(layerIndex);
                if(layer){
                    const shapes = layer.forEach(shape => {
                        action(shape);
                    });
                }
            });
    };

    public count = (): number => {
        return Array.from(this.layers.values())
            .reduce((result: number, shapes: Map<number, Shape>) => {
                return result + shapes.size;
            }, 0);
    };

    public getLayer = (layerIndex: number): Layer | undefined => {
        return this.layers.get(layerIndex);
    };


    public shapesOnLayer = (layerIndex: number): IterableIterator<Shape> => {
        const layer = this.layers.get(layerIndex);
        if (!layer) {
            throw new Error(`Layer with index ${layerIndex} does not exist.`);
        }
        return layer.values();
    };

    public clear() {
        this.layers.clear();
    }

    public log(message?: string, console: Console = window.console) {

        if (message) {
            console.groupCollapsed(`ShapeStore state [${message}]: `);
        }

        this.layerIndices().sort().forEach(layerIndex => {
            console.group(`Layer ${layerIndex}`);
            const layer = this.getLayer(layerIndex);
            if(layer){
                layer.forEach(shape => {
                    console.log(`${shape.constructor.name}[${shape.id}] (x: ${shape.position.x}, y: ${shape.position.y}) (color: ${shape.fill.toString()})`);
                });
            }
            console.groupEnd();
        });

        if (message) {
            console.groupEnd();
        }
    }
}