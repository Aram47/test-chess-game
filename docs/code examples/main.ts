/**
 * Testing and Demonstration File for Chess Move Tree Serialization
 * 
 * This file tests and demonstrates the tree serialization utilities.
 * Run with: tsc && node dist/main.js
 */

import {
	serializeTree,
	deserializeTree,
	validateTree,
	exampleUsage,
	complexExampleUsage,
	type ChessMoveTree,
	type MoveNode,
	type NodeId,
	type ValidationResult
} from './treeSerialization.js';

// ============================================================================
// TEST HELPERS
// ============================================================================

function printSeparator(title: string): void {
	console.log('\n' + '='.repeat(80));
	console.log(`  ${title}`);
	console.log('='.repeat(80) + '\n');
}

function printTreeStats(tree: ChessMoveTree): void {
	const nodeCount = Object.keys(tree.nodes).length;
	let branchingPoints = 0;
	let maxDepth = 0;
	let leafNodes = 0;

	// Calculate depth and other stats
	function calculateDepth(nodeId: NodeId, visited: Set<NodeId> = new Set()): number {
		if (visited.has(nodeId)) return 0; // Prevent cycles
		visited.add(nodeId);

		const node = tree.nodes[nodeId];
		if (!node) return 0;

		if (node.children.length === 0) {
			leafNodes++;
			return 1;
		}

		let maxChildDepth = 0;
		for (const childId of node.children) {
			const childDepth = calculateDepth(childId, new Set(visited));
			maxChildDepth = Math.max(maxChildDepth, childDepth);
		}

		return maxChildDepth + 1;
	}

	maxDepth = calculateDepth(tree.rootId);

	for (const node of Object.values(tree.nodes)) {
		if (node.children.length > 1) {
			branchingPoints++;
		}
	}

	console.log('Tree Statistics:');
	console.log(`  - Total nodes: ${nodeCount}`);
	console.log(`  - Branching points: ${branchingPoints}`);
	console.log(`  - Leaf nodes: ${leafNodes}`);
	console.log(`  - Max depth: ${maxDepth}`);
	console.log(`  - Root ID: ${tree.rootId}`);
}

// ============================================================================
// TEST CASES
// ============================================================================

/**
 * Test 1: Simple Example Usage
 */
function testSimpleExample(): void {
	printSeparator('TEST 1: Simple Example Usage');

	try {
		const result = exampleUsage();
		
		console.log('✓ Serialization successful');
		console.log(`  JSON length: ${result.jsonString.length} characters`);
		console.log(`  Validation: ${result.validation.isValid ? 'PASSED' : 'FAILED'}`);
		
		if (!result.validation.isValid) {
			console.error('  Errors:', result.validation.errors);
		}

		printTreeStats(result.deserializedTree);
	} catch (error: any) {
		console.error('✗ Test failed:', error.message);
	}
}

/**
 * Test 2: Complex Example Usage
 */
function testComplexExample(): void {
	printSeparator('TEST 2: Complex Example with Branching Variations');

	try {
		const result = complexExampleUsage();
		
		console.log('✓ Complex serialization successful');
		console.log(`  JSON length: ${result.jsonString.length} characters`);
		console.log(`  Validation: ${result.validation.isValid ? 'PASSED' : 'FAILED'}`);
		console.log(`  Node count: ${result.nodeCount}`);
		console.log(`  Branching points: ${result.branchingPoints}`);
		
		if (!result.validation.isValid) {
			console.error('  Errors:', result.validation.errors);
		}

		printTreeStats(result.deserializedTree);
	} catch (error: any) {
		console.error('✗ Test failed:', error.message);
	}
}

/**
 * Test 3: Round-trip Serialization (Serialize -> Deserialize -> Serialize)
 */
function testRoundTrip(): void {
	printSeparator('TEST 3: Round-trip Serialization Test');

	try {
		// Create a test tree
		const originalTree: ChessMoveTree = {
			nodes: {
				'r1': {
					id: 'r1',
					parentId: null,
					children: ['n1', 'n2'],
					move: undefined,
					uci: undefined,
					fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
					ply: 0
				},
				'n1': {
					id: 'n1',
					parentId: 'r1',
					children: ['n3'],
					move: 'e4',
					uci: 'e2e4',
					fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
					ply: 1
				},
				'n2': {
					id: 'n2',
					parentId: 'r1',
					children: [],
					move: 'd4',
					uci: 'd2d4',
					fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1',
					ply: 1
				},
				'n3': {
					id: 'n3',
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

		// Round-trip: serialize -> deserialize -> serialize
		const json1 = serializeTree(originalTree);
		const deserialized = deserializeTree(json1);
		const json2 = serializeTree(deserialized);

		// Compare JSON strings
		if (json1 === json2) {
			console.log('✓ Round-trip test PASSED');
			console.log('  Original and re-serialized JSON are identical');
		} else {
			console.error('✗ Round-trip test FAILED');
			console.error('  JSON strings differ!');
			console.error('  Original length:', json1.length);
			console.error('  Re-serialized length:', json2.length);
		}

		// Validate structure
		const validation = validateTree(deserialized);
		if (validation.isValid) {
			console.log('✓ Deserialized tree validation PASSED');
		} else {
			console.error('✗ Deserialized tree validation FAILED');
			console.error('  Errors:', validation.errors);
		}

		// Compare node counts
		const originalCount = Object.keys(originalTree.nodes).length;
		const deserializedCount = Object.keys(deserialized.nodes).length;
		if (originalCount === deserializedCount) {
			console.log(`✓ Node count preserved: ${originalCount} nodes`);
		} else {
			console.error(`✗ Node count mismatch: ${originalCount} vs ${deserializedCount}`);
		}

	} catch (error: any) {
		console.error('✗ Test failed:', error.message);
	}
}

/**
 * Test 4: Error Handling - Invalid Inputs
 */
function testErrorHandling(): void {
	printSeparator('TEST 4: Error Handling Tests');

	const tests = [
		{
			name: 'Null tree',
			test: () => serializeTree(null as any)
		},
		{
			name: 'Tree without nodes',
			test: () => serializeTree({ rootId: 'r1' } as any)
		},
		{
			name: 'Tree without rootId',
			test: () => serializeTree({ nodes: {} } as any)
		},
		{
			name: 'Tree with non-existent root',
			test: () => serializeTree({
				nodes: { 'n1': { id: 'n1', parentId: null, children: [], fen: '...', ply: 0 } },
				rootId: 'r1'
			})
		},
		{
			name: 'Empty JSON string',
			test: () => deserializeTree('')
		},
		{
			name: 'Invalid JSON string',
			test: () => deserializeTree('{ invalid json }')
		},
		{
			name: 'JSON without nodes',
			test: () => deserializeTree('{"rootId":"r1"}')
		},
		{
			name: 'JSON without rootId',
			test: () => deserializeTree('{"nodes":{}}')
		}
	];

	let passed = 0;
	let failed = 0;

	for (const testCase of tests) {
		try {
			testCase.test();
			console.error(`✗ ${testCase.name}: Should have thrown an error`);
			failed++;
		} catch (error: any) {
			console.log(`✓ ${testCase.name}: Correctly threw error - "${error.message}"`);
			passed++;
		}
	}

	console.log(`\nError handling test results: ${passed}/${tests.length} passed`);
}

/**
 * Test 5: Large Tree Performance
 */
function testLargeTree(): void {
	printSeparator('TEST 5: Large Tree Performance Test');

	try {
		// Create a larger tree with many nodes
		const largeTree: ChessMoveTree = {
			nodes: {},
			rootId: 'r1'
		};

		// Create root
		largeTree.nodes['r1'] = {
			id: 'r1',
			parentId: null,
			children: [],
			move: undefined,
			uci: undefined,
			fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
			ply: 0
		};

		// Generate a tree with 50 nodes in a chain with some branches
		let nodeCounter = 1;
		const lastNodes: NodeId[] = ['r1'];

		for (let depth = 0; depth < 10; depth++) {
			const newLastNodes: NodeId[] = [];
			
			for (const parentId of lastNodes) {
				// Create 1-3 children per node
				const childCount = depth < 5 ? 2 : 1; // More branching early on
				
				for (let i = 0; i < childCount && nodeCounter < 50; i++) {
					const nodeId: NodeId = `n${nodeCounter++}`;
					
					largeTree.nodes[nodeId] = {
						id: nodeId,
						parentId: parentId,
						children: [],
						move: `move${nodeCounter}`,
						uci: `uci${nodeCounter}`,
						fen: `fen${nodeCounter}`,
						ply: depth + 1
					};

					// Add to parent's children
					largeTree.nodes[parentId].children.push(nodeId);
					newLastNodes.push(nodeId);
				}
			}

			lastNodes.length = 0;
			lastNodes.push(...newLastNodes);
		}

		// Test serialization
		const startTime = Date.now();
		const jsonString = serializeTree(largeTree);
		const serializeTime = Date.now() - startTime;

		// Test deserialization
		const deserializeStart = Date.now();
		const deserialized = deserializeTree(jsonString);
		const deserializeTime = Date.now() - deserializeStart;

		// Validate
		const validation = validateTree(deserialized);

		console.log('✓ Large tree test completed');
		console.log(`  Nodes: ${Object.keys(largeTree.nodes).length}`);
		console.log(`  Serialization time: ${serializeTime}ms`);
		console.log(`  Deserialization time: ${deserializeTime}ms`);
		console.log(`  JSON size: ${jsonString.length} characters`);
		console.log(`  Validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`);

		if (!validation.isValid) {
			console.error('  Errors:', validation.errors);
		}

	} catch (error: any) {
		console.error('✗ Test failed:', error.message);
	}
}

/**
 * Test 6: Tree Structure Validation
 */
function testTreeValidation(): void {
	printSeparator('TEST 6: Tree Structure Validation Tests');

	// Test valid tree
	const validTree: ChessMoveTree = {
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
				children: [],
				move: 'e4',
				uci: 'e2e4',
				fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
				ply: 1
			}
		},
		rootId: 'r1'
	};

	const validResult = validateTree(validTree);
	console.log(`Valid tree validation: ${validResult.isValid ? 'PASSED' : 'FAILED'}`);
	if (!validResult.isValid) {
		console.error('  Errors:', validResult.errors);
	}

	// Test invalid tree - node with wrong parent reference
	const invalidTree1: ChessMoveTree = {
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
				parentId: 'wrong-parent', // Wrong parent ID
				children: [],
				move: 'e4',
				uci: 'e2e4',
				fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
				ply: 1
			}
		},
		rootId: 'r1'
	};

	const invalidResult1 = validateTree(invalidTree1);
	console.log(`Invalid tree (wrong parent) validation: ${invalidResult1.isValid ? 'PASSED (should fail!)' : 'FAILED (correct)'}`);
	if (!invalidResult1.isValid) {
		console.log(`  Detected errors: ${invalidResult1.errors.length}`);
	}

	// Test invalid tree - child doesn't reference parent correctly
	const invalidTree2: ChessMoveTree = {
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
				children: ['n2'], // References child
				move: 'e4',
				uci: 'e2e4',
				fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
				ply: 1
			},
			'n2': {
				id: 'n2',
				parentId: 'wrong-parent', // Child has wrong parent
				children: [],
				move: 'e5',
				uci: 'e7e5',
				fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
				ply: 2
			}
		},
		rootId: 'r1'
	};

	const invalidResult2 = validateTree(invalidTree2);
	console.log(`Invalid tree (child wrong parent) validation: ${invalidResult2.isValid ? 'PASSED (should fail!)' : 'FAILED (correct)'}`);
	if (!invalidResult2.isValid) {
		console.log(`  Detected errors: ${invalidResult2.errors.length}`);
	}
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main(): void {
	console.log('\n');
	console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
	console.log('║         Chess Move Tree Serialization - Test Suite                          ║');
	console.log('╚══════════════════════════════════════════════════════════════════════════════╝');

	// Run all tests
	testSimpleExample();
	testComplexExample();
	testRoundTrip();
	testErrorHandling();
	testLargeTree();
	testTreeValidation();

	printSeparator('All Tests Completed');
	console.log('✓ Test suite finished\n');
}

// Run tests when this file is executed
main();

export { main };

