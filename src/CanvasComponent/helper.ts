import { Vector2d } from 'konva/lib/types'
import { IStar } from './CanvasInterface';

export const calcDistance = (point1: Vector2d, point2: Vector2d) => {
    return Math.sqrt(
        Math.pow(point1.x - point2.x, 2) +
        Math.pow(point1.y - point2.y, 2)
    );
}

export const clamp = (val: number, minVal: number, maxVal: number): number => {
    return Math.min(Math.max(minVal, val), maxVal);
}

export const equalArrays = (a: any[], b: any[]): boolean => {
    if (a.length != b.length) return false;

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

export const scaledTarget = (
    x1: number,
    x2: number,
    distance: number,
    radius: number
) => {
    return x1 + ((distance - radius) / distance) * (x2 - x1);
};

export const scaledCoordinate = (pos: Vector2d, stagePos: Vector2d, scale: number) => {
    return { x: (pos.x - stagePos.x) / scale, y: (pos.y - stagePos.y) / scale }
}

export const getStarById = (stars: IStar[], id: string) => {
    return stars.filter((x) => x.id === id)[0];
  };