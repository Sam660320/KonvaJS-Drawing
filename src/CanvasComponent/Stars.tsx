import { Vector2d } from 'konva/lib/types';
import { MutableRefObject } from 'react';
import { Star } from 'react-konva';
import { CanvasState, ILink, IStar } from './CanvasInterface';
import { getStarById, scaledCoordinate } from './helper';

const STAR_RADIUS = 50;
const starMenuOptions = ['Edit Node', 'Remove Node(s)'];

function Stars(props: {
  linkCounter: MutableRefObject<number>;
  links: ILink[];
  stars: IStar[];
  historyIndex: number;
  canvasState: CanvasState;
  selectedNodes: number[];
  stagePos: Vector2d & { scale: number };
  mousePos: Vector2d;
  setLinks: (links: ILink[]) => void;
  setStars: (stars: IStar[]) => void;
  setHistoryIndex: (index: number) => void;
  setCanvasState: (state: CanvasState) => void;
  setSelectedNodes: (nodes: number[]) => void;
  setStagePos: (pos: Vector2d & { scale: number }) => void;
  setMousePos: (pos: Vector2d) => void;
  setContextMenuOptions: (options: string[]) => void;
  setContextMenuPos: (pos: Vector2d) => void;
  updateHistories: () => void;
  handleMouseMove: () => void;
}) {
  const {
    linkCounter,
    links,
    stars,
    historyIndex,
    canvasState,
    selectedNodes,
    mousePos,
    stagePos,
    setLinks,
    setStars,
    setHistoryIndex,
    setCanvasState,
    setSelectedNodes,
    setStagePos,
    setContextMenuOptions,
    setContextMenuPos,
    updateHistories,
    handleMouseMove,
  } = props;

  const handleClick = (e: any) => {
    const id = +e.target.id();
    if (canvasState == CanvasState.DrawingLink && !selectedNodes.includes(id)) {
      let newLinks = selectedNodes.map((node) => {
        return {
          srcNodeID: node,
          targetNodeID: id,
          linkID: linkCounter.current++,
        };
      });
      updateHistories();
      setHistoryIndex(historyIndex + 1);
      setLinks([...links, ...newLinks]);
      setCanvasState(CanvasState.Idle);
      setSelectedNodes([]);
    }

    if (e.evt.ctrlKey && selectedNodes.includes(id)) {
      setSelectedNodes(selectedNodes.filter((nodeID) => nodeID !== id));
    }

    else if (e.evt.ctrlKey && !selectedNodes.includes(id)) {
      setSelectedNodes([...selectedNodes, id]);
    }
    else {
      setSelectedNodes([id]); 
    }

  };

  const handleDoubleClick = (e: any) => {
    if ([CanvasState.Select, CanvasState.Idle].includes(canvasState)) {
      setCanvasState(CanvasState.DrawingLink);
      setSelectedNodes([+e.target.id()]);
    }
  };

  const handleContextMenu = (e: any) => {
    e.evt.preventDefault(true);
    setContextMenuOptions(starMenuOptions);
    setSelectedNodes([+e.target.id()]);
    setContextMenuPos({ ...mousePos });
    setCanvasState(CanvasState.ContextMenu);
  };

  const handleDragStart = (e: any) => {
    const id = +e.target.id();
    if (!selectedNodes.includes(id)) setSelectedNodes([id]);
    updateHistories();
    setHistoryIndex(historyIndex + 1);
  };

  const handleDragMove = (e: any) => {
    const id = e.target.id();
    const { x, y } = e.target.attrs;
    const currentStar = getStarById(stars, id);
    setStars(
      stars.map((star) => {
        const newStar = {
          ...star,
          isDragging: selectedNodes.includes(+star.id),
        };
        if (id === newStar.id) {
          newStar.x = x;
          newStar.y = y;
        } else if (selectedNodes.includes(+star.id)) {
          const xDiff = star.x - currentStar.x;
          const yDiff = star.y - currentStar.y;
          newStar.x = x + xDiff;
          newStar.y = y + yDiff;
        }
        return newStar;
      })
    );
  };

  const handleDragEnd = () => {
    setStars(
      stars.map((star) => {
        return {
          ...star,
          isDragging: false,
        };
      })
    );
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

  return (
    <>
      {stars.map((star) => (
        <Star
          key={star.id}
          id={star.id}
          x={star.x}
          y={star.y}
          numPoints={5}
          innerRadius={20}
          outerRadius={STAR_RADIUS}
          fill='#89b717'
          opacity={0.8}
          draggable
          rotation={star.rotation}
          shadowColor='black'
          shadowBlur={10}
          shadowOpacity={0.6}
          shadowOffsetX={star.isDragging ? 10 : 5}
          shadowOffsetY={star.isDragging ? 10 : 5}
          scaleX={star.isDragging ? 1.2 : 1}
          scaleY={star.isDragging ? 1.2 : 1}
          onClick={handleClick}
          onDblClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          onMouseMove={handleMouseMove}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onWheel={handleWheel}
        />
      ))}
    </>
  );
}

export default Stars;
