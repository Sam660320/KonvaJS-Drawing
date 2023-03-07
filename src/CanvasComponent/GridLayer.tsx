import { Layer, Line } from 'react-konva';

const GridLayer = (props: {width: number, height: number}) => {
    const stepSize = 30;
    const multiple = 8;
    const xSize = props.width;
    const ySize = props.height;
    const xSteps = xSize / stepSize;
    const ySteps = ySize / stepSize;
    return (
      <>
        <Layer>
          {[...Array(Math.round(xSteps * multiple * 2)).keys()].map((i) => {
            return (
              <Line
                key={`v${i}`}
                x={i * stepSize}
                points={[
                  -multiple * xSize,
                  -multiple * ySize,
                  -multiple * xSize,
                  (multiple + 1) * ySize,
                ]}
                stroke='rgba(0, 0, 0, 0.2)'
                strokeWidth={1}
              />
            );
          })}
          {[...Array(Math.round(ySteps * multiple * 2)).keys()].map((i) => {
            return (
              <Line
                key={`h${i}`}
                y={i * stepSize}
                points={[
                  -multiple * xSize,
                  -multiple * ySize,
                  (multiple + 1) * xSize,
                  -multiple * ySize,
                ]}
                stroke='rgba(0, 0, 0, 0.2)'
                strokeWidth={1}
              />
            );
          })}
        </Layer>
      </>
    );
  };

  export default GridLayer;