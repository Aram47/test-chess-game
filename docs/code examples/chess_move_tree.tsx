import React, { useState, useMemo } from "react";
import { Chess, Move } from "chess.js";

// Small single-file React example demonstrating:
// - tree of moves (branching variations)
// - do move from current node (by clicking squares)
// - back to parent
// - create new variation when adding a move from a previous position
//
// How to run:
// 1) Create a Vite/CRA React + TypeScript project (or plain JS; convert types out).
// 2) npm install chess.js
// 3) Replace src/App.tsx with this file (or import the component).
// 4) npm run dev / start.

// ---------------------------
// Data structures
// ---------------------------

type NodeId = string;

interface MoveNode {
  id: NodeId;
  parentId: NodeId | null;
  children: NodeId[]; // order matters (mainline first)
  move?: string; // SAN (display)
  uci?: string; // uci from->to
  fen: string; // position AFTER this move
  ply: number;
}

// Utility to generate small unique ids
const genId = (() => {
  let n = 1;
  return (prefix = "n") => `${prefix}${n++}`;
})();

// ---------------------------
// Initial tree setup
// ---------------------------

const START_FEN = "startpos"; // chess.js supports 'start' by new Chess()

function makeInitialTree(): { nodes: Record<NodeId, MoveNode>; rootId: NodeId } {
  const rootId = genId("r");
  const root: MoveNode = {
    id: rootId,
    parentId: null,
    children: [],
    move: undefined,
    uci: undefined,
    fen: new Chess().fen(),
    ply: 0,
  };
  // return { nodes: { [rootId]: root }, rootId };
  return {
    nodes: {
			// Root - starting position
			'r1': {
				id: 'r1',
				parentId: null,
				children: ['n1', 'v1'], // Mainline: e4, Variation: c5 (Sicilian)
				move: undefined,
				uci: undefined,
				fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
				ply: 0
			},

			// Mainline: 1. e4
			'n1': {
				id: 'n1',
				parentId: 'r1',
				children: ['n2', 'v2'], // Mainline: e5, Variation: d4
				move: 'e4',
				uci: 'e2e4',
				fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
				ply: 1
			},

			// Mainline: 1... e5
			'n2': {
				id: 'n2',
				parentId: 'n1',
				children: ['n3'],
				move: 'e5',
				uci: 'e7e5',
				fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
				ply: 2
			},

			// Mainline: 2. Nf3
			'n3': {
				id: 'n3',
				parentId: 'n2',
				children: ['n4'],
				move: 'Nf3',
				uci: 'g1f3',
				fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
				ply: 3
			},

			// Mainline: 2... Nc6
			'n4': {
				id: 'n4',
				parentId: 'n3',
				children: ['n5', 'v3'], // Mainline: Bb5, Variation: Bb5 Nf6 (Berlin)
				move: 'Nc6',
				uci: 'b8c6',
				fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
				ply: 4
			},

			// Mainline: 3. Bb5 (Ruy Lopez)
			'n5': {
				id: 'n5',
				parentId: 'n4',
				children: ['n6'],
				move: 'Bb5',
				uci: 'f1b5',
				fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
				ply: 5
			},

			// Mainline: 3... a6
			'n6': {
				id: 'n6',
				parentId: 'n5',
				children: ['n7'],
				move: 'a6',
				uci: 'a7a6',
				fen: 'r1bqkbnr/1ppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
				ply: 6
			},

			// Mainline: 4. Ba4
			'n7': {
				id: 'n7',
				parentId: 'n6',
				children: ['n8'],
				move: 'Ba4',
				uci: 'b5a4',
				fen: 'r1bqkbnr/1ppp1ppp/2n5/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 1 4',
				ply: 7
			},

			// Mainline: 4... Nf6
			'n8': {
				id: 'n8',
				parentId: 'n7',
				children: ['n9'],
				move: 'Nf6',
				uci: 'g8f6',
				fen: 'r1bqkb1r/1ppp1ppp/2n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 5',
				ply: 8
			},

			// Mainline: 5. O-O
			'n9': {
				id: 'n9',
				parentId: 'n8',
				children: [],
				move: 'O-O',
				uci: 'e1g1',
				fen: 'r1bqkb1r/1ppp1ppp/2n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 3 5',
				ply: 9
			},

			// ===== VARIATIONS =====

			// Variation 1: 1... c5 (Sicilian Defense)
			'v1': {
				id: 'v1',
				parentId: 'r1',
				children: ['v1a', 'v1b'], // Mainline: Nf3, Variation: d4
				move: 'c5',
				uci: 'c7c5',
				fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
				ply: 1
			},

			// Variation 1a: 2. Nf3 (mainline from Sicilian)
			'v1a': {
				id: 'v1a',
				parentId: 'v1',
				children: ['v1a1'],
				move: 'Nf3',
				uci: 'g1f3',
				fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
				ply: 2
			},

			// Variation 1a1: 2... d6
			'v1a1': {
				id: 'v1a1',
				parentId: 'v1a',
				children: [],
				move: 'd6',
				uci: 'd7d6',
				fen: 'rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3',
				ply: 3
			},

			// Variation 1b: 2. d4 (from Sicilian)
			'v1b': {
				id: 'v1b',
				parentId: 'v1',
				children: [],
				move: 'd4',
				uci: 'd2d4',
				fen: 'rnbqkbnr/pp1ppppp/8/2p5/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2',
				ply: 2
			},

			// Variation 2: 2. d4 (from 1. e4 e5)
			'v2': {
				id: 'v2',
				parentId: 'n1',
				children: ['v2a'],
				move: 'd4',
				uci: 'd2d4',
				fen: 'rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2',
				ply: 2
			},

			// Variation 2a: 2... exd4
			'v2a': {
				id: 'v2a',
				parentId: 'v2',
				children: ['v2a1'],
				move: 'exd4',
				uci: 'e5d4',
				fen: 'rnbqkbnr/pppp1ppp/8/8/3pP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
				ply: 3
			},

			// Variation 2a1: 3. Nc3
			'v2a1': {
				id: 'v2a1',
				parentId: 'v2a',
				children: [],
				move: 'Nc3',
				uci: 'b1c3',
				fen: 'rnbqkbnr/pppp1ppp/8/8/3pP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3',
				ply: 4
			},

			// Variation 3: 3... Nf6 (Berlin Defense from Ruy Lopez)
			'v3': {
				id: 'v3',
				parentId: 'n4',
				children: ['v3a'],
				move: 'Nf6',
				uci: 'g8f6',
				fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
				ply: 4
			},

			// Variation 3a: 4. d4 (from Berlin)
			'v3a': {
				id: 'v3a',
				parentId: 'v3',
				children: [],
				move: 'd4',
				uci: 'd2d4',
				fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 4',
				ply: 5
			}
		},
		rootId: 'r1'
  };
}

// ---------------------------
// Helpers for chess board UI (simple Unicode pieces)
// ---------------------------

const pieceUnicode: Record<string, string> = {
  p: "♟",
  r: "♜",
  n: "♞",
  b: "♝",
  q: "♛",
  k: "♚",
  P: "♙",
  R: "♖",
  N: "♘",
  B: "♗",
  Q: "♕",
  K: "♔",
};

function fenToMatrix(fen: string) {
  const [piecePlacement] = fen.split(" ");
  const ranks = piecePlacement.split("/");
  const board: (string | null)[][] = [];
  for (let r = 0; r < 8; r++) {
    const rank = ranks[r];
    const row: (string | null)[] = [];
    for (let i = 0; i < rank.length; i++) {
      const ch = rank[i];
      if (/[1-8]/.test(ch)) {
        const count = parseInt(ch, 10);
        for (let k = 0; k < count; k++) row.push(null);
      } else {
        row.push(ch);
      }
    }
    board.push(row);
  }
  return board; // board[0] = 8th rank (top)
}

function idxToSquare(row: number, col: number) {
  const file = String.fromCharCode("a".charCodeAt(0) + col);
  const rank = 8 - row;
  return `${file}${rank}`;
}

// ---------------------------
// React component
// ---------------------------

export default function ChessBranchingExample(): any {
  const initial = useMemo(() => makeInitialTree(), []);
  const [nodes, setNodes] = useState<Record<NodeId, MoveNode>>(initial.nodes);
  const [rootId] = useState<NodeId>(initial.rootId);
  const [currentId, setCurrentId] = useState<NodeId>(rootId);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("Click a piece, then a destination to make a move.");

  const currentNode = nodes[currentId];

  // create a chess.js instance loaded with current node's FEN
  function chessFromNode(node: MoveNode) {
    const c = new Chess();
    c.load(node.fen);
    return c;
  }

  // navigate to an arbitrary node
  function gotoNode(id: NodeId) {
    setCurrentId(id);
    setSelectedSquare(null);
    setStatusMsg("");
  }

  // go back to parent
  function goBack() {
    const cur = nodes[currentId];
    if (!cur.parentId) return setStatusMsg("Already at root.");
    setCurrentId(cur.parentId);
    setSelectedSquare(null);
  }

  // add a move as a child of current node
  function addMoveUci(from: string, to: string, promotion: string | undefined = undefined) {
    const cur = nodes[currentId];
    const c = chessFromNode(cur);
    const mv: any = { from, to };
    if (promotion) mv.promotion = promotion;
    const res = c.move(mv);
    if (!res) {
      setStatusMsg(`Illegal move: ${from}-${to}`);
      return;
    }
    const newFen = c.fen();
    const newId = genId("n");
    const node: MoveNode = {
      id: newId,
      parentId: currentId,
      children: [],
      move: res.san,
      uci: `${from}${to}${promotion ? promotion : ""}`,
      fen: newFen,
      ply: cur.ply + 1,
    };

    setNodes((prev) => {
      // append child
      const copy = { ...prev, [newId]: node };
      const parent = { ...copy[currentId] };
      parent.children = [...parent.children, newId];
      copy[currentId] = parent;
      return copy;
    });

    setCurrentId(newId);
    setSelectedSquare(null);
    setStatusMsg(`Played ${res.san}`);
  }

  // click handler for board squares: select source then destination
  function onSquareClick(row: number, col: number) {
    const sq = idxToSquare(row, col);
    const cur = nodes[currentId];
    const c = chessFromNode(cur);

    if (!selectedSquare) {
      // first click: must be a piece of the side to move
      const moves = c.moves({ square: sq, verbose: true }) as Move[] | null;
      if (!moves || moves.length === 0) {
        setStatusMsg("No legal moves from that square");
        return;
      }
      setSelectedSquare(sq);
      setStatusMsg(`Selected ${sq}. Now pick destination.`);
      return;
    }

    // second click: attempt move from selectedSquare to sq
    const from = selectedSquare;
    const to = sq;
    // try promotions automatically if needed (to 8th/1st rank)
    const rank = to[1];
    const isPawnPromotion = (from[1] === "7" && rank === "8") || (from[1] === "2" && rank === "1");
    if (isPawnPromotion) {
      // default to queen promotion
      addMoveUci(from, to, "q");
    } else {
      addMoveUci(from, to);
    }
  }

  // render board from current node's fen
  const boardMatrix = useMemo(() => fenToMatrix(currentNode.fen), [currentNode.fen]);

  // recursively render tree UI
  function renderNode(nodeId: NodeId) {
    const node = nodes[nodeId];
    const isCurrent = nodeId === currentId;
    return (
      <div key={nodeId} style={{ marginLeft: node.parentId ? 12 : 0, padding: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => gotoNode(nodeId)}
            style={{ fontWeight: isCurrent ? "700" : "400" }}
          >
            {node.move ? node.move : "start"}
          </button>
          <small style={{ color: "#666" }}>{node.ply > 0 ? `(${node.ply})` : ""}</small>
        </div>
        <div>
          {node.children.map((cid) => (
            <div key={cid}>{renderNode(cid)}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 16, padding: 16, fontFamily: "sans-serif" }}>
      <div>
        <div style={{ marginBottom: 8 }}>
          <strong>Position (FEN):</strong> <code>{currentNode.fen}</code>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 48px)",
            gridTemplateRows: "repeat(8, 48px)",
            border: "2px solid #333",
          }}
        >
          {boardMatrix.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              const isLight = (rIdx + cIdx) % 2 === 0;
              const bg = isLight ? "#f0d9b5" : "#b58863";
              const sq = idxToSquare(rIdx, cIdx);
              const piece = cell ? pieceUnicode[cell] ?? "?" : null;
              const selected = selectedSquare === sq;
              return (
                <div
                  key={sq}
                  onClick={() => onSquareClick(rIdx, cIdx)}
                  title={sq}
                  style={{
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: selected ? "#ffea00" : bg,
                    fontSize: 28,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  {piece}
                </div>
              );
            })
          )}
        </div>

        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button onClick={goBack}>Back</button>
          <button
            onClick={() => {
              // reset to root
              setCurrentId(rootId);
              setSelectedSquare(null);
            }}
          >
            Reset to start
          </button>
        </div>

        <div style={{ marginTop: 8, color: "#444" }}>{statusMsg}</div>
      </div>

      <div style={{ flex: 1 }}>
        <h3>Move tree</h3>
        <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 6, maxHeight: 600, overflow: "auto" }}>
          {renderNode(rootId)}
        </div>

        <div style={{ marginTop: 12 }}>
          <h4>Controls</h4>
          <p style={{ marginTop: 4, color: "#666" }}>
            Click a piece then a destination on the board to make a move from the current position. Making a move from a
            previous node creates a new variation (child) in the tree.
          </p>
        </div>
      </div>
    </div>
  );
}
