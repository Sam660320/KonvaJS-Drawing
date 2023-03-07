export interface IStar {
    id: string
    x: number
    y: number
    rotation: number
    isDragging: boolean
}

export interface ILink {
    srcNodeID: number;
    targetNodeID: number;
    linkID: number;
}

export interface IHistory {
    links: ILink[],
    stars: IStar[]
}

export enum CanvasState {
    DrawingLink,
    Idle,
    ContextMenu,
    EditNode,
    Select,
    Panning,
    Copy,
}



export const createStar = (id: string) => {
    return {
        id: id,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        rotation: Math.random() * 180,
        isDragging: false,
    }
}