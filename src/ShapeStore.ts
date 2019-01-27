import {Shape} from "./shapes/Shape";
import has = Reflect.has;

export type Layer = Map<number, Shape>;

export class ShapeStore {

    private readonly store: Map<number, Layer> = new Map<number, Layer>();

    public layerIndices = (): Array<number> => {
        return Array.from(this.store.keys());
    };

    public layers = (): Layer[] => {
        return Array.from(this.store.values());
    };

    public get = (shapeId: number): Shape | undefined => {
        return this.layers()
            .map(layer => layer.get(shapeId))
            .find(shape => shape !== null && shape !== undefined);
    };

    public set = (shape: Shape, layerIndex: number = 0): ShapeStore => {
        let layer = this.store.get(layerIndex);

        if (!layer) {
            layer = new Map<number, Shape>();
            this.store.set(layerIndex, layer);
        }

        layer.set(shape.id, shape);
        return this;
    };

    public removeShape = (id: number) => {
        this.layerIndices().forEach(layer => {
            const layerShapes = this.store.get(layer);
            if(layerShapes){
                layerShapes.delete(id);
            }
        });
    };

    /*public shapesUnsorted(): Shape[] {
        return Array.from(this.store.values()).map(layer => layer.values())
    }*/

    private shapeSorter = (shapeA: Shape, shapeB: Shape): number => {
        if(shapeA.hasClipping() === shapeB.hasClipping()){
            return 0;
        }

        if(shapeA.hasClipping()){
            return -1;
        }

        return 1;
    };

    public forEach = (action: (s: Shape) => void): void => {
        this.layerIndices().sort((a, b) => {
            return a > b ? 1 : a < b ? -1 : 0;
        }).forEach(layerIndex => {
            const shapes = this.shapesOnLayer(layerIndex).sort(this.shapeSorter);
            shapes.forEach(shape => {
                action(shape);
            });

        });
    };

        public count = (): number => {
        return Array.from(this.store.values())
            .reduce((result: number, shapes: Map<number,Shape>) => {
                return result + shapes.size;
            }, 0);
    };

    public shapesOnLayer = (layerIndex: number): Shape[] => {
        const layer = this.store.get(layerIndex);
        if(!layer){
            throw new Error(`Layer with index ${layerIndex} does not exist.`);
        }
        return Array.from(layer.values());
    };

    public clear() {
        this.store.clear();
    }

    public log(message?: string, console: Console = window.console){

        if(message){
            console.groupCollapsed(`ShapeStore state [${message}]: `);
        }

        this.layerIndices().sort().forEach(layer => {
            console.group(`Layer ${layer}`);

            this.shapesOnLayer(layer).forEach(shape => {
                console.log(`${shape.constructor.name}[${shape.id}] (x: ${shape.x}, y: ${shape.y}) (color: ${shape.getColor().fillStyle()})`);
            });

            console.groupEnd();
        });

        if(message){
            console.groupEnd();
        }
    }
}