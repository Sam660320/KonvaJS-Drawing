import { Vector2d } from 'konva/lib/types';
import React from 'react';
import { Arrow } from 'react-konva';
import { CanvasState, IStar, ILink } from './CanvasInterface';
import {
  calcDistance,
  getStarById,
  scaledCoordinate,
  scaledTarget,
} from './helper';

const linkMenuOptions = ['Edit Link', 'Remove Link'];

function Links(props: {
  stars: IStar[];
  links: ILink[];
  radius: number;
  mousePos: Vector2d;
  stagePos: Vector2d & { scale: number };
  selectedNodes: number[];
  canvasState: CanvasState;
  setCanvasState: (state: CanvasState) => void;
  setSelectedLink: (link: number) => void;
  setContextMenuPos: (pos: Vector2d) => void;
  setContextMenuOptions: (options: string[]) => void;
  handleMouseMove: (e: any) => void;
}) {
  const {
    stars,
    links,
    mousePos,
    stagePos,
    canvasState,
    selectedNodes,
    setCanvasState,
    setContextMenuPos,
    setContextMenuOptions,
    handleMouseMove,
    setSelectedLink,
  } = props;

  const handleContextMenu = (e: any) => {
    e.evt.preventDefault(true);
    setSelectedLink(+e.target.id());
    setContextMenuOptions(linkMenuOptions);
    setContextMenuPos({ ...mousePos });
    setCanvasState(CanvasState.ContextMenu);
  };

  return (
    <>
      {links.map((link) => {
        const srcNode = getStarById(stars, link.srcNodeID.toString());
        const targetNode = getStarById(stars, link.targetNodeID.toString());
        const distance = calcDistance(
          { x: srcNode.x, y: srcNode.y },
          { x: targetNode.x, y: targetNode.y }
        );

        const points = [
          srcNode.x,
          srcNode.y,
          scaledTarget(srcNode.x, targetNode.x, distance, props.radius),
          scaledTarget(srcNode.y, targetNode.y, distance, props.radius),
        ];

        return (
          <Arrow
            points={points}
            fill='black'
            stroke='black'
            strokeWidth={5}
            pointerLength={10}
            pointerWidth={10}
            id={`${link.linkID}`}
            key={`link${link.linkID}`}
            onContextMenu={handleContextMenu}
          />
        );
      })}

      {canvasState === CanvasState.DrawingLink &&
        selectedNodes.length > 0 &&
        selectedNodes.map((node) => {
          return (
            <Arrow
              points={[
                getStarById(stars, node.toString()).x,
                getStarById(stars, node.toString()).y,
                scaledCoordinate(mousePos, stagePos, stagePos.scale).x,
                scaledCoordinate(mousePos, stagePos, stagePos.scale).y,
              ]}
              fill='black'
              stroke='black'
              strokeWidth={2}
              pointerLength={10}
              pointerWidth={10}
              onMouseMove={handleMouseMove}
              key={`mouseLink${node}`}
            />
          );
        })}
    </>
  );
}

export default Links;
