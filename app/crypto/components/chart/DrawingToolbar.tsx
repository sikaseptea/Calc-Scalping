"use client";

// Menambahkan Tool type yang sesuai dengan Chart.tsx
type Tool = "NONE" | "LINE" | "TRENDLINE" | "FIB" | "RECTANGLE" | "ARROW" | "TEXT";

interface DrawingToolbarProps {
  tool: Tool;
  setTool: (v: Tool) => void;
  onUndo: () => void;
  onClear: () => void;
}

export default function DrawingToolbar({
  tool,
  setTool,
  onUndo,
  onClear,
}: DrawingToolbarProps) {
  
  const btnClass = (name: Tool | "ACTION") =>
    `
      w-10 h-10
      rounded-lg
      border border-white/20
      backdrop-blur-sm
      transition-all
      cursor-pointer
      font-semibold
      text-sm
      flex items-center justify-center
      ${
        tool === name
          ? "bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/50"
          : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:border-white/40"
      }
    `;

  return (
    <div className="absolute left-4 top-4 z-50 flex flex-col gap-2 pointer-events-auto">
      {/* Tool: Pointer/None */}
      <button
        type="button"
        className={btnClass("NONE")}
        onClick={() => setTool("NONE")}
        title="Select (Pointer)"
      >
        ↖
      </button>

      {/* Tool: Trend Line */}
      <button
        type="button"
        className={btnClass("LINE")}
        onClick={() => setTool("LINE")}
        title="Trend Line"
      >
        ／
      </button>

      {/* Tool: Fibonacci */}
      <button
        type="button"
        className={btnClass("FIB")}
        onClick={() => setTool("FIB")}
        title="Fibonacci"
      >
        F
      </button>

      {/* Tool: Arrow */}
      <button
        type="button"
        className={btnClass("ARROW")}
        onClick={() => setTool("ARROW")}
        title="Arrow"
      >
        →
      </button>

      {/* Tool: Text */}
      <button
        type="button"
        className={btnClass("TEXT")}
        onClick={() => setTool("TEXT")}
        title="Text"
      >
        T
      </button>

      {/* Separator visual */}
      <div className="w-8 h-[1px] bg-white/10 mx-auto my-1" />

      {/* ACTION: Undo */}
      <button
        type="button"
        className={btnClass("ACTION")}
        onClick={onUndo}
        title="Undo (Ctrl+Z)"
      >
        ↶
      </button>

      {/* ACTION: Clear All */}
      <button
        type="button"
        className={`${btnClass("ACTION")} hover:bg-red-500/40 hover:text-red-200`}
        onClick={onClear}
        title="Clear All Drawings"
      >
        🗑️
      </button>
    </div>
  );
}