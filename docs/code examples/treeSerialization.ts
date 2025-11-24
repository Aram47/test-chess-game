/**
 * Chess Move Tree Serialization Utilities
 * 
 * This module provides functions to serialize and deserialize chess move trees
 * for storage in MongoDB. The tree structure represents branching game variations
 * where each node contains move information and can have multiple children.
 * 
 * Tree Structure:
 * - nodes: Record<NodeId, MoveNode> - Map of node IDs to move nodes
 * - rootId: NodeId - ID of the root node (starting position)
 * 
 * MoveNode Structure:
 * - id: NodeId - Unique identifier for the node
 * - parentId: NodeId | null - ID of parent node (null for root)
 * - children: NodeId[] - Array of child node IDs (order matters - mainline first)
 * - move?: string - SAN (Standard Algebraic Notation) move string
 * - uci?: string - UCI (Universal Chess Interface) move string (from-to-promotion)
 * - fen: string - FEN (Forsyth-Edwards Notation) position after this move
 * - ply: number - Half-move counter (0 for root, increments with each move)
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type NodeId = string;

export interface MoveNode {
	id: NodeId;
	parentId: NodeId | null;
	children: NodeId[]; // order matters (mainline first)
	move?: string; // SAN (display)
	uci?: string; // uci from->to
	fen: string; // position AFTER this move
	ply: number;
}

export interface ChessMoveTree {
	nodes: Record<NodeId, MoveNode>;
	rootId: NodeId;
}

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

// ============================================================================
// SERIALIZATION FUNCTIONS
// ============================================================================

/**
 * Serializes a chess move tree to a JSON string for database storage
 * 
 * @param tree - The tree structure to serialize
 * @returns JSON string representation of the tree
 * @throws {Error} If tree structure is invalid
 * 
 * @example
 * const tree: ChessMoveTree = {
 *   nodes: {
 *     'r1': { id: 'r1', parentId: null, children: ['n1'], move: undefined, fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', ply: 0 },
 *     'n1': { id: 'n1', parentId: 'r1', children: [], move: 'e4', uci: 'e2e4', fen: '...', ply: 1 }
 *   },
 *   rootId: 'r1'
 * };
 * const jsonString = serializeTree(tree);
 */
export function serializeTree(tree: ChessMoveTree): string {
	if (!tree) {
		throw new Error('Tree must be an object');
	}

	if (!tree.nodes) {
		throw new Error('Tree must have a nodes property');
	}

	if (!tree.rootId) {
		throw new Error('Tree must have a rootId string property');
	}

	// Verify root node exists
	if (!tree.nodes[tree.rootId]) {
		throw new Error('Root node does not exist in nodes');
	}

	// Create a clean copy for serialization (removes any non-serializable properties)
	const cleanTree: ChessMoveTree = {
		nodes: {},
		rootId: tree.rootId
	};

	// Copy and clean each node
	for (const [nodeId, node] of Object.entries(tree.nodes)) {
		cleanTree.nodes[nodeId] = {
			id: node.id,
			parentId: node.parentId,
			children: Array.isArray(node.children) ? [...node.children] : [],
			move: node.move,
			uci: node.uci,
			fen: node.fen,
			ply: typeof node.ply === 'number' ? node.ply : 0
		};
	}

	return JSON.stringify(cleanTree);
}

/**
 * Deserializes a JSON string back to a chess move tree structure
 * 
 * @param jsonString - JSON string representation of the tree
 * @returns Tree structure with nodes and rootId
 * @throws {Error} If JSON string is invalid or tree structure is corrupted
 * 
 * @example
 * const jsonString = '{"nodes":{"r1":{...},"n1":{...}},"rootId":"r1"}';
 * const tree = deserializeTree(jsonString);
 */
export function deserializeTree(jsonString: string): ChessMoveTree {
	if (!jsonString.trim()) {
		throw new Error('JSON string cannot be empty');
	}

	let parsed: any;
	try {
		parsed = JSON.parse(jsonString);
	} catch (error: any) {
		throw new Error(`Invalid JSON string: ${error.message}`);
	}

	if (!parsed) {
		throw new Error('Parsed JSON must be an object');
	}

	if (!parsed.nodes) {
		throw new Error('Tree must have a nodes property');
	}

	if (!parsed.rootId) {
		throw new Error('Tree must have a rootId string property');
	}

	// Verify root node exists
	if (!parsed.nodes[parsed.rootId]) {
		throw new Error('Root node does not exist in nodes');
	}

	// Validate and normalize each node
	const validatedNodes: Record<NodeId, MoveNode> = {};
	for (const [nodeId, node] of Object.entries(parsed.nodes)) {
		const nodeObj = node as any;
		if (!nodeObj || typeof nodeObj !== 'object') {
			throw new Error(`Node ${nodeId} must be an object`);
		}

		if (nodeObj.id !== nodeId) {
			throw new Error(`Node ID mismatch: expected ${nodeId}, got ${nodeObj.id}`);
		}

		validatedNodes[nodeId] = {
			id: nodeObj.id,
			parentId: nodeObj.parentId === null ? null : String(nodeObj.parentId),
			children: Array.isArray(nodeObj.children) ? nodeObj.children.map(String) : [],
			move: nodeObj.move !== undefined ? String(nodeObj.move) : undefined,
			uci: nodeObj.uci !== undefined ? String(nodeObj.uci) : undefined,
			fen: String(nodeObj.fen),
			ply: typeof nodeObj.ply === 'number' ? nodeObj.ply : 0
		};
	}

	return {
		nodes: validatedNodes,
		rootId: String(parsed.rootId)
	};
}

/**
 * Validates the integrity of a deserialized tree structure
 * 
 * @param tree - The tree structure to validate
 * @returns Validation result with isValid flag and errors array
 * 
 * @example
 * const tree = deserializeTree(jsonString);
 * const validation = validateTree(tree);
 * if (!validation.isValid) {
 *   console.error('Tree validation failed:', validation.errors);
 * }
 */
export function validateTree(tree: ChessMoveTree): ValidationResult {
	const errors: string[] = [];

	if (!tree) {
		errors.push('Tree must be an object');
		return { isValid: false, errors };
	}

	if (!tree.nodes) {
		errors.push('Tree must have a nodes property');
		return { isValid: false, errors };
	}

	if (!tree.rootId) {
		errors.push('Tree must have a rootId string property');
		return { isValid: false, errors };
	}

	// Check root node exists
	if (!tree.nodes[tree.rootId]) {
		errors.push(`Root node '${tree.rootId}' does not exist in nodes`);
	}

	// Check root has no parent
	const rootNode = tree.nodes[tree.rootId];
	if (rootNode && rootNode.parentId !== null) {
		errors.push(`Root node '${tree.rootId}' should have parentId null, got '${rootNode.parentId}'`);
	}

	// Validate all nodes
	for (const [nodeId, node] of Object.entries(tree.nodes)) {
		// Check node structure
		if (!node) {
			errors.push(`Node '${nodeId}' is not an object`);
			continue;
		}

		if (node.id !== nodeId) {
			errors.push(`Node '${nodeId}' has mismatched ID: ${node.id}`);
		}

		// Check parent exists (if not root)
		if (node.parentId !== null) {
			if (!tree.nodes[node.parentId]) {
				errors.push(`Node '${nodeId}' references non-existent parent '${node.parentId}'`);
			}
		}

		// Check children exist and reference back to this node
		if (!Array.isArray(node.children)) {
			errors.push(`Node '${nodeId}' has invalid children property (must be array)`);
		} else {
			for (const childId of node.children) {
				if (!tree.nodes[childId]) {
					errors.push(`Node '${nodeId}' references non-existent child '${childId}'`);
				} else {
					const childNode = tree.nodes[childId];
					if (childNode.parentId !== nodeId) {
						errors.push(`Node '${childId}' parentId '${childNode.parentId}' does not match parent '${nodeId}'`);
					}
				}
			}
		}

		// Check required fields
		if (typeof node.fen !== 'string') {
			errors.push(`Node '${nodeId}' must have a valid fen string`);
		}

		if (typeof node.ply !== 'number') {
			errors.push(`Node '${nodeId}' must have a valid ply number`);
		}
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Simple serialization/deserialization cycle
 * 
 * This demonstrates how to:
 * 1. Create a simple tree structure
 * 2. Serialize it to JSON string
 * 3. Deserialize it back
 * 4. Validate the result
 */
export function exampleUsage(): {
	jsonString: string;
	deserializedTree: ChessMoveTree;
	validation: ValidationResult;
} {
	// Example tree structure (simplified)
	const exampleTree: ChessMoveTree = {
		nodes: {
			'r1': {
				id: 'r1',
				parentId: null,
				children: ['n1'],
				move: undefined,
				uci: undefined,
				fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
				ply: 0
			},
			'n1': {
				id: 'n1',
				parentId: 'r1',
				children: ['n2'],
				move: 'e4',
				uci: 'e2e4',
				fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
				ply: 1
			},
			'n2': {
				id: 'n2',
				parentId: 'n1',
				children: [],
				move: 'e5',
				uci: 'e7e5',
				fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
				ply: 2
			}
		},
		rootId: 'r1'
	};

	// Serialize to JSON string
	const jsonString = serializeTree(exampleTree);
	console.log('Serialized tree:', jsonString);

	// Deserialize back to tree structure
	const deserializedTree = deserializeTree(jsonString);
	console.log('Deserialized tree:', deserializedTree);

	// Validate the deserialized tree
	const validation = validateTree(deserializedTree);
	if (validation.isValid) {
		console.log('Tree validation passed!');
	} else {
		console.error('Tree validation failed:', validation.errors);
	}

	return { jsonString, deserializedTree, validation };
}

/**
 * Example: Complex game with multiple branching variations
 * 
 * This demonstrates a more realistic game scenario with:
 * - Multiple branching points (variations)
 * - Different move sequences explored
 * - A game tree showing various lines of play
 * 
 * Game structure:
 * 1. e4 e5 (mainline)
 *    1... c5 (variation - Sicilian Defense)
 * 2. Nf3 Nc6 (mainline)
 *    2. Nf3 d6 (variation from move 1... c5)
 *    2. d4 (variation - trying different approach)
 * 3. Bb5 a6 (mainline - Ruy Lopez)
 *    3. Bb5 Nf6 (variation - Berlin Defense)
 *    3. Nc3 (variation from 2. d4)
 */
export function complexExampleUsage(): {
	jsonString: string;
	deserializedTree: ChessMoveTree;
	validation: ValidationResult;
	nodeCount: number;
	branchingPoints: number;
} {
	const complexTree: ChessMoveTree = {
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

	// Serialize to JSON string
	const jsonString = serializeTree(complexTree);
	console.log('Complex tree serialized. Length:', jsonString.length, 'characters', jsonString);

	// Deserialize back to tree structure
	const deserializedTree = deserializeTree(jsonString);
	console.log('Complex tree deserialized successfully', deserializedTree);

	// Validate the deserialized tree
	const validation = validateTree(deserializedTree);
	if (validation.isValid) {
		console.log('Complex tree validation passed!');
	} else {
		console.error('Complex tree validation failed:', validation.errors);
	}

	// Calculate statistics
	const nodeCount = Object.keys(deserializedTree.nodes).length;
	
	// Count branching points (nodes with more than one child)
	let branchingPoints = 0;
	for (const node of Object.values(deserializedTree.nodes)) {
		if (node.children.length > 1) {
			branchingPoints++;
		}
	}

	console.log(`Tree statistics: ${nodeCount} nodes, ${branchingPoints} branching points`);

	return {
		jsonString,
		deserializedTree,
		validation,
		nodeCount,
		branchingPoints
	};
}

// ============================================================================
// ALTERNATIVE STORAGE SOLUTIONS
// ============================================================================

/**
 * ALTERNATIVE STORAGE APPROACHES FOR CHESS MOVE TREES
 * 
 * While JSON string serialization works, here are better alternatives to consider:
 * 
 * 1. NESTED MONGODB DOCUMENT (RECOMMENDED)
 *    -------------------------------------
 *    Store the tree directly as a nested MongoDB document instead of a string.
 *    
 *    Advantages:
 *    - More efficient storage (no JSON parsing overhead)
 *    - Queryable - can query specific nodes, moves, or positions
 *    - Indexable - can create indexes on specific fields (e.g., FEN, ply)
 *    - Native MongoDB operations (aggregation pipelines, updates)
 *    - Better performance for large trees
 *    - Type safety with Mongoose schemas
 *    
 *    Schema Example:
 *    {
 *      whitePlayerId: ObjectId,
 *      blackPlayerId: ObjectId,
 *      gameResult: String,
 *      movesHistory: {
 *        nodes: {
 *          type: Map,
 *          of: {
 *            id: String,
 *            parentId: String,
 *            children: [String],
 *            move: String,
 *            uci: String,
 *            fen: String,
 *            ply: Number
 *          }
 *        },
 *        rootId: String
 *      }
 *    }
 *    
 *    Usage:
 *    const game = new ChessGameSnapshot({
 *      whitePlayerId: ...,
 *      blackPlayerId: ...,
 *      gameResult: 'white',
 *      movesHistory: tree  // Store directly, no serialization needed
 *    });
 * 
 * 
 * 2. PGN (PORTABLE GAME NOTATION) FORMAT
 *    ------------------------------------
 *    Use standard PGN format for move sequences.
 *    
 *    Advantages:
 *    - Standard chess notation (widely supported)
 *    - Human-readable
 *    - Compact for linear games
 *    - Compatible with chess software
 *    
 *    Disadvantages:
 *    - Limited variation support (nested variations are complex)
 *    - Not ideal for branching trees
 *    - Harder to query specific positions
 *    
 *    Example:
 *    "1. e4 e5 2. Nf3 Nc6 3. Bb5 (3. d4 d5) 3... a6"
 * 
 * 
 * 3. CUSTOM BINARY FORMAT
 *    ---------------------
 *    Create a compact binary representation.
 *    
 *    Advantages:
 *    - Most compact storage
 *    - Fast serialization/deserialization
 *    - Can optimize for chess-specific data
 *    
 *    Disadvantages:
 *    - Not human-readable
 *    - Not queryable
 *    - Requires custom encoding/decoding
 *    - Harder to debug
 *    - Not standard
 * 
 * 
 * 4. HYBRID APPROACH
 *    ----------------
 *    Store both:
 *    - Full tree as nested document (for querying/analysis)
 *    - PGN string (for display/export)
 *    - Mainline moves array (for quick access)
 *    
 *    This provides flexibility but uses more storage.
 * 
 * 
 * RECOMMENDATION:
 * ---------------
 * For production use, prefer NESTED MONGODB DOCUMENT approach:
 * - Store movesHistory as a nested object/Map in MongoDB
 * - Use Mongoose schema validation
 * - Create indexes on frequently queried fields (FEN, ply, move)
 * - Use JSON string only if you need to store in a text field or for
 *   compatibility with systems that require string storage
 * 
 * The JSON string approach (this implementation) is useful for:
 * - Systems that require string storage
 * - API responses that need string format
 * - Backup/export scenarios
 * - Compatibility with older systems
 */

// Default export
export default {
	serializeTree,
	deserializeTree,
	validateTree,
	exampleUsage,
	complexExampleUsage
};

