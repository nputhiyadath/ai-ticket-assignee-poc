/**
 * Simple test script for the AI ticket assignee API
 * Tests basic functionality and feature parity with Python version
 */

const http = require('http');

const API_BASE = 'http://localhost:5000';

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_BASE);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

/**
 * Test cases
 */
const testCases = [
    {
        name: 'Health Check',
        method: 'GET',
        path: '/health',
        expectStatus: 200,
        expectFields: ['status', 'model_loaded']
    },
    {
        name: 'Model Info',
        method: 'GET',
        path: '/model/info',
        expectStatus: 200,
        expectFields: ['assignees', 'vocabulary_size', 'training_samples']
    },
    {
        name: 'Login Bug Prediction',
        method: 'POST',
        path: '/predict',
        data: {
            title: "Fix login bug",
            description: "Error on login page",
            labels: ["bug", "urgent"]
        },
        expectStatus: 200,
        expectFields: ['assignee']
    },
    {
        name: 'Backend API Prediction',
        method: 'POST',
        path: '/predict',
        data: {
            title: "API endpoint broken",
            description: "Backend service returns 500",
            labels: ["bug", "backend"]
        },
        expectStatus: 200,
        expectFields: ['assignee'],
        expectAssignee: 'bob'
    },
    {
        name: 'Feature Request Prediction',
        method: 'POST',
        path: '/predict',
        data: {
            title: "New feature request",
            description: "Add dark mode support",
            labels: ["feature", "ui"]
        },
        expectStatus: 200,
        expectFields: ['assignee'],
        expectAssignee: 'carol'
    },
    {
        name: 'Frontend Issue Prediction',
        method: 'POST',
        path: '/predict',
        data: {
            title: "UI not responsive",
            description: "Dashboard UI not adjusting to screen",
            labels: ["frontend", "ui"]
        },
        expectStatus: 200,
        expectFields: ['assignee'],
        expectAssignee: 'alice'
    },
    {
        name: 'Empty Request Validation',
        method: 'POST',
        path: '/predict',
        data: {},
        expectStatus: 400,
        expectFields: ['error']
    },
    {
        name: 'Invalid Endpoint',
        method: 'GET',
        path: '/invalid',
        expectStatus: 404,
        expectFields: ['error']
    }
];

/**
 * Run all tests
 */
async function runTests() {
    console.log('🧪 Starting API tests...\n');
    
    let passed = 0;
    let failed = 0;
    
    for (const test of testCases) {
        try {
            console.log(`Running: ${test.name}`);
            
            const result = await makeRequest(test.method, test.path, test.data);
            
            // Check status code
            if (result.status !== test.expectStatus) {
                console.log(`❌ FAIL: Expected status ${test.expectStatus}, got ${result.status}`);
                failed++;
                continue;
            }
            
            // Check required fields
            if (test.expectFields) {
                const missingFields = test.expectFields.filter(field => !(field in result.data));
                if (missingFields.length > 0) {
                    console.log(`❌ FAIL: Missing fields: ${missingFields.join(', ')}`);
                    failed++;
                    continue;
                }
            }
            
            // Check specific assignee if expected
            if (test.expectAssignee && result.data.assignee !== test.expectAssignee) {
                console.log(`❌ FAIL: Expected assignee '${test.expectAssignee}', got '${result.data.assignee}'`);
                failed++;
                continue;
            }
            
            console.log(`✅ PASS`);
            if (result.data.assignee) {
                console.log(`   → Predicted assignee: ${result.data.assignee}`);
            }
            passed++;
            
        } catch (error) {
            console.log(`❌ FAIL: ${error.message}`);
            failed++;
        }
        
        console.log('');
    }
    
    console.log(`\n📊 Test Results:`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
        process.exit(1);
    } else {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    }
}

// Check if server is running and run tests
console.log('Checking if API server is running...');
makeRequest('GET', '/health')
    .then(() => {
        console.log('✅ Server is running\n');
        runTests();
    })
    .catch(() => {
        console.log('❌ Server is not running. Please start the server with "npm start" first.');
        process.exit(1);
    });