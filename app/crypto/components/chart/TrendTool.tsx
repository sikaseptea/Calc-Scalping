import { TrendLine } from "./types";

    export default function TrendTool({ lines }: { lines: TrendLine[] }) {
      return (
        <>
          {lines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#3b82f6"
              strokeWidth="2"
            />
          ))}
        </>
      );
    }