"use strict";
/**
 * Testing and Demonstration File for Chess Move Tree Serialization
 *
 * This file tests and demonstrates the tree serialization utilities.
 * Run with: npx ts-node main.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
var treeSerialization_1 = require("./treeSerialization");
// ============================================================================
// TEST HELPERS
// ============================================================================
function printSeparator(title) {
    console.log('\n' + '='.repeat(80));
    console.log("  ".concat(title));
    console.log('='.repeat(80) + '\n');
}
function printTreeStats(tree) {
    var nodeCount = Object.keys(tree.nodes).length;
    var branchingPoints = 0;
    var maxDepth = 0;
    var leafNodes = 0;
    // Calculate depth and other stats
    function calculateDepth(nodeId, visited) {
        if (visited === void 0) { visited = new Set(); }
        if (visited.has(nodeId))
            return 0; // Prevent cycles
        visited.add(nodeId);
        var node = tree.nodes[nodeId];
        if (!node)
            return 0;
        if (node.children.length === 0) {
            leafNodes++;
            return 1;
        }
        var maxChildDepth = 0;
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var childId = _a[_i];
            var childDepth = calculateDepth(childId, new Set(visited));
            maxChildDepth = Math.max(maxChildDepth, childDepth);
        }
        return maxChildDepth + 1;
    }
    maxDepth = calculateDepth(tree.rootId);
    for (var _i = 0, _a = Object.values(tree.nodes); _i < _a.length; _i++) {
        var node = _a[_i];
        if (node.children.length > 1) {
            branchingPoints++;
        }
    }
    console.log('Tree Statistics:');
    console.log("  - Total nodes: ".concat(nodeCount));
    console.log("  - Branching points: ".concat(branchingPoints));
    console.log("  - Leaf nodes: ".concat(leafNodes));
    console.log("  - Max depth: ".concat(maxDepth));
    console.log("  - Root ID: ".concat(tree.rootId));
}
// ============================================================================
// TEST CASES
// ============================================================================
/**
 * Test 1: Simple Example Usage
 */
function testSimpleExample() {
    printSeparator('TEST 1: Simple Example Usage');
    try {
        var result = (0, treeSerialization_1.exampleUsage)();
        console.log('✓ Serialization successful');
        console.log("  JSON length: ".concat(result.jsonString.length, " characters"));
        console.log("  Validation: ".concat(result.validation.isValid ? 'PASSED' : 'FAILED'));
        if (!result.validation.isValid) {
            console.error('  Errors:', result.validation.errors);
        }
        printTreeStats(result.deserializedTree);
    }
    catch (error) {
        console.error('✗ Test failed:', error.message);
    }
}
/**
 * Test 2: Complex Example Usage
 */
function testComplexExample() {
    printSeparator('TEST 2: Complex Example with Branching Variations');
    try {
        var result = (0, treeSerialization_1.complexExampleUsage)();
        console.log('✓ Complex serialization successful');
        console.log("  JSON length: ".concat(result.jsonString.length, " characters"));
        console.log("  Validation: ".concat(result.validation.isValid ? 'PASSED' : 'FAILED'));
        console.log("  Node count: ".concat(result.nodeCount));
        console.log("  Branching points: ".concat(result.branchingPoints));
        if (!result.validation.isValid) {
            console.error('  Errors:', result.validation.errors);
        }
        printTreeStats(result.deserializedTree);
    }
    catch (error) {
        console.error('✗ Test failed:', error.message);
    }
}
/**
 * Test 3: Round-trip Serialization (Serialize -> Deserialize -> Serialize)
 */
function testRoundTrip() {
    printSeparator('TEST 3: Round-trip Serialization Test');
    try {
        // Create a test tree
        var originalTree = {
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
        var json1 = (0, treeSerialization_1.serializeTree)(originalTree);
        var deserialized = (0, treeSerialization_1.deserializeTree)(json1);
        var json2 = (0, treeSerialization_1.serializeTree)(deserialized);
        // Compare JSON strings
        if (json1 === json2) {
            console.log('✓ Round-trip test PASSED');
            console.log('  Original and re-serialized JSON are identical');
        }
        else {
            console.error('✗ Round-trip test FAILED');
            console.error('  JSON strings differ!');
            console.error('  Original length:', json1.length);
            console.error('  Re-serialized length:', json2.length);
        }
        // Validate structure
        var validation = (0, treeSerialization_1.validateTree)(deserialized);
        if (validation.isValid) {
            console.log('✓ Deserialized tree validation PASSED');
        }
        else {
            console.error('✗ Deserialized tree validation FAILED');
            console.error('  Errors:', validation.errors);
        }
        // Compare node counts
        var originalCount = Object.keys(originalTree.nodes).length;
        var deserializedCount = Object.keys(deserialized.nodes).length;
        if (originalCount === deserializedCount) {
            console.log("\u2713 Node count preserved: ".concat(originalCount, " nodes"));
        }
        else {
            console.error("\u2717 Node count mismatch: ".concat(originalCount, " vs ").concat(deserializedCount));
        }
    }
    catch (error) {
        console.error('✗ Test failed:', error.message);
    }
}
/**
 * Test 4: Error Handling - Invalid Inputs
 */
function testErrorHandling() {
    printSeparator('TEST 4: Error Handling Tests');
    var tests = [
        {
            name: 'Null tree',
            test: function () { return (0, treeSerialization_1.serializeTree)(null); }
        },
        {
            name: 'Tree without nodes',
            test: function () { return (0, treeSerialization_1.serializeTree)({ rootId: 'r1' }); }
        },
        {
            name: 'Tree without rootId',
            test: function () { return (0, treeSerialization_1.serializeTree)({ nodes: {} }); }
        },
        {
            name: 'Tree with non-existent root',
            test: function () { return (0, treeSerialization_1.serializeTree)({
                nodes: { 'n1': { id: 'n1', parentId: null, children: [], fen: '...', ply: 0 } },
                rootId: 'r1'
            }); }
        },
        {
            name: 'Empty JSON string',
            test: function () { return (0, treeSerialization_1.deserializeTree)(''); }
        },
        {
            name: 'Invalid JSON string',
            test: function () { return (0, treeSerialization_1.deserializeTree)('{ invalid json }'); }
        },
        {
            name: 'JSON without nodes',
            test: function () { return (0, treeSerialization_1.deserializeTree)('{"rootId":"r1"}'); }
        },
        {
            name: 'JSON without rootId',
            test: function () { return (0, treeSerialization_1.deserializeTree)('{"nodes":{}}'); }
        }
    ];
    var passed = 0;
    var failed = 0;
    for (var _i = 0, tests_1 = tests; _i < tests_1.length; _i++) {
        var testCase = tests_1[_i];
        try {
            testCase.test();
            console.error("\u2717 ".concat(testCase.name, ": Should have thrown an error"));
            failed++;
        }
        catch (error) {
            console.log("\u2713 ".concat(testCase.name, ": Correctly threw error - \"").concat(error.message, "\""));
            passed++;
        }
    }
    console.log("\nError handling test results: ".concat(passed, "/").concat(tests.length, " passed"));
}
/**
 * Test 5: Large Tree Performance
 */
function testLargeTree() {
    printSeparator('TEST 5: Large Tree Performance Test');
    try {
        // Create a larger tree with many nodes
        var largeTree = {
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
        var nodeCounter = 1;
        var lastNodes = ['r1'];
        for (var depth = 0; depth < 10; depth++) {
            var newLastNodes = [];
            for (var _i = 0, lastNodes_1 = lastNodes; _i < lastNodes_1.length; _i++) {
                var parentId = lastNodes_1[_i];
                // Create 1-3 children per node
                var childCount = depth < 5 ? 2 : 1; // More branching early on
                for (var i = 0; i < childCount && nodeCounter < 50; i++) {
                    var nodeId = "n".concat(nodeCounter++);
                    largeTree.nodes[nodeId] = {
                        id: nodeId,
                        parentId: parentId,
                        children: [],
                        move: "move".concat(nodeCounter),
                        uci: "uci".concat(nodeCounter),
                        fen: "fen".concat(nodeCounter),
                        ply: depth + 1
                    };
                    // Add to parent's children
                    largeTree.nodes[parentId].children.push(nodeId);
                    newLastNodes.push(nodeId);
                }
            }
            lastNodes.length = 0;
            lastNodes.push.apply(lastNodes, newLastNodes);
        }
        // Test serialization
        var startTime = Date.now();
        var jsonString = (0, treeSerialization_1.serializeTree)(largeTree);
        var serializeTime = Date.now() - startTime;
        // Test deserialization
        var deserializeStart = Date.now();
        var deserialized = (0, treeSerialization_1.deserializeTree)(jsonString);
        var deserializeTime = Date.now() - deserializeStart;
        // Validate
        var validation = (0, treeSerialization_1.validateTree)(deserialized);
        console.log('✓ Large tree test completed');
        console.log("  Nodes: ".concat(Object.keys(largeTree.nodes).length));
        console.log("  Serialization time: ".concat(serializeTime, "ms"));
        console.log("  Deserialization time: ".concat(deserializeTime, "ms"));
        console.log("  JSON size: ".concat(jsonString.length, " characters"));
        console.log("  Validation: ".concat(validation.isValid ? 'PASSED' : 'FAILED'));
        if (!validation.isValid) {
            console.error('  Errors:', validation.errors);
        }
    }
    catch (error) {
        console.error('✗ Test failed:', error.message);
    }
}
/**
 * Test 6: Tree Structure Validation
 */
function testTreeValidation() {
    printSeparator('TEST 6: Tree Structure Validation Tests');
    // Test valid tree
    var validTree = {
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
    var validResult = (0, treeSerialization_1.validateTree)(validTree);
    console.log("Valid tree validation: ".concat(validResult.isValid ? 'PASSED' : 'FAILED'));
    if (!validResult.isValid) {
        console.error('  Errors:', validResult.errors);
    }
    // Test invalid tree - node with wrong parent reference
    var invalidTree1 = {
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
    var invalidResult1 = (0, treeSerialization_1.validateTree)(invalidTree1);
    console.log("Invalid tree (wrong parent) validation: ".concat(invalidResult1.isValid ? 'PASSED (should fail!)' : 'FAILED (correct)'));
    if (!invalidResult1.isValid) {
        console.log("  Detected errors: ".concat(invalidResult1.errors.length));
    }
    // Test invalid tree - child doesn't reference parent correctly
    var invalidTree2 = {
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
    var invalidResult2 = (0, treeSerialization_1.validateTree)(invalidTree2);
    console.log("Invalid tree (child wrong parent) validation: ".concat(invalidResult2.isValid ? 'PASSED (should fail!)' : 'FAILED (correct)'));
    if (!invalidResult2.isValid) {
        console.log("  Detected errors: ".concat(invalidResult2.errors.length));
    }
}
// ============================================================================
// MAIN EXECUTION
// ============================================================================
function main() {
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
