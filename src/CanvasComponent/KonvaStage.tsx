import Konva from 'konva';
import { Vector2d } from 'konva/lib/types';
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import { Stage, Layer, Transformer, Rect } from 'react-konva';
import { CanvasState, ILink, IStar } from './CanvasInterface';
import GridLayer from './GridLayer';
import { scaledCoordinate } from './helper';
import Links from './Links';
import Stars from './Stars';

const CANVAS_WIDTH = window.innerWidth * 0.8;
const CANVAS_HEIGHT = window.innerHeight * 0.7;
const STAR_RADIUS = 40;
const stageMenuOptions = [
  'Add Node',
  'Add Link(s)',
  'Remove Node(s)',
  'Undo',
  'Redo',
];

function KonvaStage(props: {
  linkCounter: MutableRefObject<number>;
  links: ILink[];
  stars: IStar[];
  selectedNodes: number[];
  historyIndex: number;
  canvasState: CanvasState;
  stagePos: Vector2d & { scale: number };
  setLinks: (links: ILink[]) => void;
  setStars: (stars: IStar[]) => void;
  setSelectedNodes: (selectedNodes: number[]) => void;
  setSelectedLink: (linkId: number) => void;
  setHistoryIndex: (index: number) => void;
  setCanvasState: (state: CanvasState) => void;
  setStagePos: (pos: Vector2d & { scale: number }) => void;
  setContextMenuOptions: (options: string[]) => void;
  setContextMenuPos: (pos: Vector2d) => void;
  updateHistories: () => void;
}) {
  const {
    linkCounter,
    links,
    stars,
    selectedNodes,
    historyIndex,
    canvasState,
    stagePos,
    setLinks,
    setStars,
    setSelectedNodes,
    setSelectedLink,
    setHistoryIndex,
    setCanvasState,
    setStagePos,
    setContextMenuOptions,
    setContextMenuPos,
    updateHistories,
  } = props;

  const stageRef = useRef<any>();
  const layerRef = useRef<any>();
  const trRef = useRef<any>();
  const selectionRectRef = useRef<any>();
  const selection = useRef({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e: any) => {
    if (canvasState === CanvasState.ContextMenu) return;
    e.evt.preventDefault(true);
    setContextMenuOptions(stageMenuOptions);
    setContextMenuPos({ ...mousePos });
    setCanvasState(CanvasState.ContextMenu);
  };

  // const handleClick = (e: any) => {
  //   console.log('click')
  //   setCanvasState(CanvasState.Select);
  // };

  useEffect(() => {
    const selected = layerRef.current.find('Star').filter((node: any) => {
      return selectedNodes.includes(+node.id());
    });
    trRef.current.nodes(selected);
  }, [selectedNodes]);

  const handleDragEnd = (e: any) => {
    setStagePos({
      ...e.currentTarget.position(),
      scale: stagePos.scale,
    });
  };

  const handleMouseMove = () => {
    const pos = stageRef.current.getPointerPosition();
    setMousePos(pos);

    if (canvasState === CanvasState.Select) {
      selection.current.x2 = scaledCoordinate(pos, stagePos, stagePos.scale).x;
      selection.current.y2 = scaledCoordinate(pos, stagePos, stagePos.scale).y;
      updateSelectionRect();
    }
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    let direction = e.evt.deltaY;
    if (e.evt.ctrlKey) {
      direction = -direction;
    }

    var mousePointTo = {
      x: scaledCoordinate(mousePos, stagePos, stagePos.scale).x,
      y: scaledCoordinate(mousePos, stagePos, stagePos.scale).y,
    };
    var newScale =
      direction > 0 ? stagePos.scale * scaleBy : stagePos.scale / scaleBy;

    var newPos = {
      x: mousePos.x - mousePointTo.x * newScale,
      y: mousePos.y - mousePointTo.y * newScale,
    };
    setStagePos({ ...newPos, scale: newScale });
  };

  const handleClick = (e: any) => {
    setCanvasState(CanvasState.Idle);
  }

  const handleMouseDown = (e: any) => {
    // early exit conditions
    if (
      e.evt.ctrlKey ||
      !(e.target instanceof Konva.Stage) ||
      canvasState !== CanvasState.Idle ||
      e.evt.button === 2
    ) {
      return;
    }
    setCanvasState(CanvasState.Select);
    selection.current.visible = true;
    selection.current.x1 = scaledCoordinate(
      mousePos,
      stagePos,
      stagePos.scale
    ).x;

    selection.current.y1 = scaledCoordinate(
      mousePos,
      stagePos,
      stagePos.scale
    ).y;
    selection.current.x2 = scaledCoordinate(
      mousePos,
      stagePos,
      stagePos.scale
    ).x;
    (selection.current.y2 = scaledCoordinate(
      mousePos,
      stagePos,
      stagePos.scale
    ).y),
      updateSelectionRect();
  };

  const handleMouseUp = (e: any) => {
    if (canvasState !== CanvasState.Select) return;
    selection.current.visible = false;
    const selBox = selectionRectRef.current.getClientRect();

    const elements = [];
    layerRef.current.find('.rectangle').forEach((elementNode: any) => {
      const elBox = elementNode.getClientRect();
      if (Konva.Util.haveIntersection(selBox, elBox)) {
        elements.push(elementNode);
      }
    });

    const intersects = layerRef.current.find('Star').filter((node: any) => {
      const elBox = node.getClientRect();
      return Konva.Util.haveIntersection(selBox, elBox);
    });
    setCanvasState(CanvasState.Idle);
    updateSelectionRect();
    trRef.current.nodes(intersects);
    const select = intersects.map((node: Konva.Star) => +node.id());
    setSelectedNodes(select);
  };

  const updateSelectionRect = () => {
    const node = selectionRectRef.current;
    node.setAttrs({
      visible: selection.current.visible,
      x: Math.min(selection.current.x1, selection.current.x2),
      y: Math.min(selection.current.y1, selection.current.y2),
      width: Math.abs(selection.current.x1 - selection.current.x2),
      height: Math.abs(selection.current.y1 - selection.current.y2),
      fill: 'rgba(0, 161, 255, 0.3)',
    });
    node.getLayer().batchDraw();
  };

  return (
    <Stage
      container={'konva-container'}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      ref={stageRef}
      onContextMenu={handleContextMenu}
      draggable={canvasState === CanvasState.Panning}
      onDragEnd={handleDragEnd}
      scale={{ x: stagePos.scale, y: stagePos.scale }}
      x={stagePos.x}
      y={stagePos.y}
      onWheel={handleWheel}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <GridLayer width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

      <Layer ref={layerRef}>
        <Links
          canvasState={canvasState}
          selectedNodes={selectedNodes}
          mousePos={mousePos}
          stagePos={stagePos}
          stars={stars}
          links={links}
          radius={STAR_RADIUS}
          setCanvasState={setCanvasState}
          setSelectedLink={setSelectedLink}
          setContextMenuPos={setContextMenuPos}
          setContextMenuOptions={setContextMenuOptions}
          handleMouseMove={handleMouseMove}
        />

        <Stars
          linkCounter={linkCounter}
          links={links}
          stars={stars}
          historyIndex={historyIndex}
          canvasState={canvasState}
          selectedNodes={selectedNodes}
          stagePos={stagePos}
          mousePos={mousePos}
          setLinks={setLinks}
          setStars={setStars}
          setHistoryIndex={setHistoryIndex}
          setCanvasState={setCanvasState}
          setSelectedNodes={setSelectedNodes}
          setStagePos={setStagePos}
          setMousePos={setMousePos}
          setContextMenuOptions={setContextMenuOptions}
          setContextMenuPos={setContextMenuPos}
          updateHistories={updateHistories}
          handleMouseMove={handleMouseMove}
        />

        <Transformer
          ref={trRef}
          boundBoxFunc={(
            oldBox: any,
            newBox: { width: number; height: number }
          ) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
          resizeEnabled={false}
          rotateEnabled={false}
        />

        <Rect
          fill='rgba(0,0,255,0.5)'
          ref={selectionRectRef}
          visible={canvasState === CanvasState.Select}
        />
      </Layer>
    </Stage>
  );
}

export default KonvaStage;
