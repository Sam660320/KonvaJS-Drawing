import { Vector2d } from 'konva/lib/types';
import { useEffect, useRef, useState } from 'react';
import { CanvasState, IStar, ILink } from './CanvasInterface';
import ContextMenu from './ContextMenu';
import PopUpWindow from './PopUpWindow';
import { scaledCoordinate } from './helper';
import KonvaStage from './KonvaStage';

const CANVAS_WIDTH = window.innerWidth * 0.8;
const CANVAS_HEIGHT = window.innerHeight * 0.7;

interface KonvaDesign {}

const stageMenuOptions = [
  'Add Node',
  'Add Link(s)',
  'Remove Node(s)',
  'Undo',
  'Redo',
];

export const KonvaDesign = () => {
  const nodeCounter = useRef<number>(0);
  const linkCounter = useRef<number>(0);

  const [stars, setStars] = useState<IStar[]>([]);
  const [links, setLinks] = useState<ILink[]>([]);
  const [canvasState, setCanvasState] = useState<CanvasState>(CanvasState.Idle);
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const [selectedLink, setSelectedLink] = useState<number>(-1);
  const [copiedNodes, setCopiedNodes] = useState<number[]>([]);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0, scale: 1 });
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [contextMenuOptions, setContextMenuOptions] =
    useState(stageMenuOptions);

  const [histories, setHistories] = useState<any>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  useEffect(() => {
    console.log(CanvasState[canvasState]);
  }, [canvasState]);

  const updateHistories = () => {
    if (historyIndex == histories.length) {
      setHistories([...histories, { stars: stars, links: links }]);
    } else {
      setHistories([
        ...histories.slice(0, historyIndex),
        { stars: stars, links: links },
      ]);
    }
  };

  const handleAddNode = () => {
    const newNode = {
      id: (nodeCounter.current++).toString(),
      x: scaledCoordinate(contextMenuPos, stagePos, stagePos.scale).x,
      y: scaledCoordinate(contextMenuPos, stagePos, stagePos.scale).y,
      rotation: Math.random() * 180,
      isDragging: false,
    };
    updateHistories();
    setHistoryIndex(historyIndex + 1);
    setStars([...stars, newNode]);
  };

  const handleUndo = () => {
    if (historyIndex === 0) {
      alert('No Move to Undo!');
      return;
    }
    if (historyIndex === histories.length) {
      updateHistories();
    }
    setStars(histories[historyIndex - 1].stars);
    setLinks(histories[historyIndex - 1].links);
    setHistoryIndex(historyIndex - 1);
  };

  const handleRedo = () => {
    if (historyIndex + 1 >= histories.length) {
      alert('No Move to Redo!');
    } else {
      setStars(histories[historyIndex + 1].stars);
      setLinks(histories[historyIndex + 1].links);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleRemoveNode = () => {
    updateHistories();
    setHistoryIndex(historyIndex + 1);
    setStars(stars.filter((star) => !selectedNodes.includes(+star.id)));
    setLinks(
      links.filter(
        (link) =>
          !selectedNodes.includes(link.srcNodeID) &&
          !selectedNodes.includes(link.targetNodeID)
      )
    );
    setSelectedNodes([]);
  };

  const handleRemoveLink = () => {
    updateHistories();
    setHistoryIndex(historyIndex + 1);
    setLinks(links.filter((link) => link.linkID !== selectedLink));
  };

  const handleCopy = () => {
    if (selectedNodes.length <= 0) return;
    setCopiedNodes(selectedNodes);
  };

  const handlePaste = () => {
    // if (canvasState !== CanvasState.Copy) return;
    const nodes = stars.filter((star) => copiedNodes.includes(+star.id));
    const newNodes: IStar[] = nodes.map((node) => {
      return {
        ...node,
        id: (nodeCounter.current++).toString(),
        x: node.x + 50,
        y: node.y + 50,
      };
    });
    const newLinks: ILink[] = [];
    for (const link of links) {
      for (let i = 0; i < nodes.length; i++) {
        if (+nodes[i].id !== link.srcNodeID) continue;
        console.log('Link exist');
        for (let j = 0; j < nodes.length; j++) {
          if (+nodes[j].id === link.targetNodeID) {
            newLinks.push({
              srcNodeID: +newNodes[i].id,
              targetNodeID: +newNodes[j].id,
              linkID: linkCounter.current++,
            });
          }
        }
      }
    }
    updateHistories();
    setHistoryIndex(historyIndex + 1);
    setStars([...stars, ...newNodes]);
    setLinks([...links, ...newLinks]);
    setCopiedNodes(newNodes.map((star) => +star.id));
    setSelectedNodes(newNodes.map((star) => +star.id));
  };

  const handleContextMenuSelection = (option: string) => {
    if (option === 'Add Node') handleAddNode();
    else if (option === 'Undo') handleUndo();
    else if (option === 'Redo') handleRedo();
    else if (option === 'Remove Node(s)') handleRemoveNode();
    else if (option === 'Remove Link') handleRemoveLink();
    else if (option === 'Copy') {
      handleCopy();
      return;
    } else if (option === 'Paste') handlePaste();
    else if (option === 'Add Link(s)') {
      setCanvasState(CanvasState.DrawingLink);
      return;
    } else if (option === 'Edit Node' || option === 'Edit Link') {
      setCanvasState(CanvasState.EditNode);
      return;
    }
    setCanvasState(CanvasState.Idle);
  };

  const handleKeyEvent = (e: any) => {
    if (e.ctrlKey && canvasState === CanvasState.Idle) {
      setCanvasState(CanvasState.Panning);
    }
    if (e.ctrlKey && e.key === 'z') {
      handleContextMenuSelection('Undo');
    } else if (e.ctrlKey && e.key === 'y') {
      handleContextMenuSelection('Redo');
    } else if (e.ctrlKey && e.key === 'c') {
      handleContextMenuSelection('Copy');
    } else if (e.ctrlKey && e.key === 'v') {
      handleContextMenuSelection('Paste');
    } else if (e.key === 'Escape') {
      setCanvasState(CanvasState.Idle);
      setSelectedNodes([]);
    } else if (['Delete', 'Backspace'].includes(e.key)) {
      handleRemoveNode();
    }
  };

  const handleKeyUp = (e: any) => {
    // ctrl key code
    if (e.keyCode === 17 && canvasState === CanvasState.Panning)
      setCanvasState(CanvasState.Idle);
  };

  const getContextMenuAbsolutePos = (pos: Vector2d) => {
    const container = document
      .getElementById("konva-container")!
      .getBoundingClientRect();
    const body = document.body.getBoundingClientRect();
    return {
      x: container.left - body.left + pos.x,
      y: container.top - body.top + pos.y,
    };
  };


  return (
    <div
      id='konva-container'
      tabIndex={1}
      onKeyDownCapture={handleKeyEvent}
      onKeyUp={handleKeyUp}
    >
      {canvasState === CanvasState.ContextMenu && (
        <>
          <ContextMenu
            position={{
              x: getContextMenuAbsolutePos(contextMenuPos).x,
              y: getContextMenuAbsolutePos(contextMenuPos).y,
            }}
            options={contextMenuOptions}
            onOptionSelected={handleContextMenuSelection}
          />
        </>
      )}
      {canvasState === CanvasState.EditNode && <PopUpWindow />}
      <KonvaStage
        linkCounter={linkCounter}
        links={links}
        stars={stars}
        historyIndex={historyIndex}
        canvasState={canvasState}
        selectedNodes={selectedNodes}
        stagePos={stagePos}
        setLinks={setLinks}
        setStars={setStars}
        setHistoryIndex={setHistoryIndex}
        setCanvasState={setCanvasState}
        setSelectedNodes={setSelectedNodes}
        setSelectedLink={setSelectedLink}
        setStagePos={setStagePos}
        setContextMenuOptions={setContextMenuOptions}
        setContextMenuPos={setContextMenuPos}
        updateHistories={updateHistories}
      />
    </div>
  );
};
