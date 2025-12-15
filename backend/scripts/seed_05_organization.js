/**
 * Organization Data Seed Script
 *
 * Seeds organization structure, position assignments, structure changes, qualifications, and documents.
 *
 * Run with: node scripts/seed_05_organization.js
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function seedOrganizationData() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db();
        // Clear structure_change_requests collection before seeding
        await db.collection('structure_change_requests').deleteMany({});
        console.log('Connected to MongoDB');

        // Position Assignments
        const employees = await db.collection('employee_profiles').find({}).toArray();
        const positions = await db.collection('positions').find({}).toArray();
        const assignments = [];
        for (let i = 0; i < employees.length; i++) {
            assignments.push({
                _id: new ObjectId(),
                employeeId: employees[i]._id,
                positionId: positions[i % positions.length]._id,
                assignedAt: new Date(),
                status: 'active',
            });
        }
        if (assignments.length) {
            await db.collection('position_assignments').insertMany(assignments);
            console.log(`Created ${assignments.length} position assignments`);
        }

        // Structure Change Requests
        const structureChangeRequests = [
            { _id: new ObjectId(), requestNumber: 'REQ-1001', type: 'department_merge', status: 'pending', createdAt: new Date() },
            { _id: new ObjectId(), requestNumber: 'REQ-1002', type: 'department_split', status: 'approved', createdAt: new Date() },
        ];
        await db.collection('structure_change_requests').insertMany(structureChangeRequests);
        console.log('Created structure change requests');


        // Structure Approvals
        const structureApprovals = [
            { _id: new ObjectId(), requestId: structureChangeRequests[0]._id, approvedBy: employees[0]?._id, status: 'pending', createdAt: new Date() },
            { _id: new ObjectId(), requestId: structureChangeRequests[1]._id, approvedBy: (employees[1]?._id || employees[0]?._id), status: 'approved', createdAt: new Date() },
        ];
        await db.collection('structure_approvals').insertMany(structureApprovals);
        console.log('Created structure approvals');

        // Structure Change Logs
        const structureChangeLogs = [
            { _id: new ObjectId(), requestId: structureChangeRequests[0]._id, action: 'created', timestamp: new Date() },
            { _id: new ObjectId(), requestId: structureChangeRequests[1]._id, action: 'approved', timestamp: new Date() },
        ];
        await db.collection('structure_change_logs').insertMany(structureChangeLogs);
        console.log('Created structure change logs');

        // Employee Profile Change Requests
        const profileChangeRequests = [
            { _id: new ObjectId(), employeeId: employees[0]?._id, field: 'address', oldValue: 'Old Address', newValue: 'New Address', status: 'approved', createdAt: new Date() },
        ];
        await db.collection('employee_profile_change_requests').insertMany(profileChangeRequests);
        console.log('Created employee profile change requests');

        // Employee Qualifications
        const qualifications = [
            { _id: new ObjectId(), employeeId: employees[0]?._id, qualification: 'BSc Computer Science', institution: 'University A', year: 2010 },
            { _id: new ObjectId(), employeeId: (employees[1]?._id || employees[0]?._id), qualification: 'MBA', institution: 'University B', year: 2015 },
        ];
        await db.collection('employee_qualifications').insertMany(qualifications);
        console.log('Created employee qualifications');

        // Employee Documents
        const documents = [
            { _id: new ObjectId(), employeeId: employees[0]?._id, type: 'ID', fileName: 'id_card.pdf', uploadedAt: new Date() },
            { _id: new ObjectId(), employeeId: (employees[1]?._id || employees[0]?._id), type: 'Contract', fileName: 'contract.pdf', uploadedAt: new Date() },
        ];
        await db.collection('employeedocuments').insertMany(documents);
        console.log('Created employee documents');

        console.log('Organization data seeded successfully!');
    } catch (err) {
        console.error('Error seeding organization data:', err);
        process.exit(1);
    } finally {
        await client.close();
    }
}

seedOrganizationData();
