/**
 * Seed Script 02: Performance Data
 * Seeds: appraisal_templates, appraisal_cycles, appraisal_assignments, 
 *        appraisal_records, appraisal_disputes
 * 
 * Run with: node scripts/seed_02_performance.js
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function seedPerformance() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db();
        
        // Get existing data for references
        const departments = await db.collection('departments').find({}).toArray();
        const positions = await db.collection('positions').find({}).toArray();
        const employees = await db.collection('employee_profiles').find({}).toArray();
        
        if (employees.length === 0) {
            console.error('Please run seed_complete_system.js first');
            return;
        }

        // Find specific roles
        const managers = employees.filter(e => 
            e.role === 'department head' || 
            e.role === 'HR Manager' ||
            e.role === 'Payroll Manager'
        );
        const regularEmployees = employees.filter(e => 
            e.role === 'department employee' || 
            e.role === 'HR Employee' ||
            e.role === 'Finance Staff'
        );
        
        // Fallback if filters return empty
        const effectiveManagers = managers.length > 0 ? managers : employees.slice(0, 3);
        const effectiveRegularEmployees = regularEmployees.length > 0 ? regularEmployees : employees.slice(3);

        // ============================================
        // APPRAISAL TEMPLATES
        // ============================================
        console.log('\n=== Seeding Appraisal Templates ===');
        const templateIds = [new ObjectId(), new ObjectId(), new ObjectId()];
        
        const appraisalTemplates = [
            {
                _id: templateIds[0],
                name: 'Annual Performance Review',
                description: 'Standard annual performance evaluation for all employees',
                templateType: 'ANNUAL',
                ratingScale: 'FIVE_POINT',
                criteria: [
                    {
                        key: 'quality',
                        title: 'Quality of Work',
                        description: 'Accuracy, thoroughness, and reliability of work output',
                        weight: 25
                    },
                    {
                        key: 'productivity',
                        title: 'Productivity',
                        description: 'Volume of work and efficiency in completing tasks',
                        weight: 20
                    },
                    {
                        key: 'teamwork',
                        title: 'Teamwork & Collaboration',
                        description: 'Ability to work effectively with others',
                        weight: 20
                    },
                    {
                        key: 'communication',
                        title: 'Communication Skills',
                        description: 'Clarity and effectiveness in verbal and written communication',
                        weight: 15
                    },
                    {
                        key: 'initiative',
                        title: 'Initiative & Problem Solving',
                        description: 'Proactively identifies and resolves issues',
                        weight: 20
                    }
                ],
                instructions: 'Rate each criterion on a scale of 1-5. Provide specific examples to support ratings.',
                applicableDepartmentIds: departments.map(d => d._id),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: templateIds[1],
                name: 'Probationary Review',
                description: 'Performance evaluation for employees on probation',
                templateType: 'PROBATIONARY',
                ratingScale: 'THREE_POINT',
                criteria: [
                    {
                        key: 'learning',
                        title: 'Learning Ability',
                        description: 'Speed and effectiveness of acquiring new skills',
                        weight: 30
                    },
                    {
                        key: 'adaptation',
                        title: 'Adaptation to Role',
                        description: 'How well the employee has adapted to the position',
                        weight: 35
                    },
                    {
                        key: 'potential',
                        title: 'Growth Potential',
                        description: 'Demonstrated potential for future development',
                        weight: 35
                    }
                ],
                instructions: 'Evaluate the employee\'s performance during the probation period.',
                applicableDepartmentIds: departments.map(d => d._id),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: templateIds[2],
                name: 'Project Performance Review',
                description: 'Evaluation based on specific project outcomes',
                templateType: 'PROJECT',
                ratingScale: 'TEN_POINT',
                criteria: [
                    {
                        key: 'delivery',
                        title: 'Project Delivery',
                        description: 'Meeting project deadlines and milestones',
                        weight: 30
                    },
                    {
                        key: 'technical',
                        title: 'Technical Contribution',
                        description: 'Quality of technical work and solutions',
                        weight: 40
                    },
                    {
                        key: 'leadership',
                        title: 'Leadership & Ownership',
                        description: 'Taking ownership and leading initiatives',
                        weight: 30
                    }
                ],
                instructions: 'Evaluate the employee\'s contribution to the project.',
                applicableDepartmentIds: [departments[0]._id],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('appraisal_templates').deleteMany({});
        await db.collection('appraisal_templates').insertMany(appraisalTemplates);
        console.log(`Created ${appraisalTemplates.length} appraisal templates`);

        // ============================================
        // APPRAISAL CYCLES
        // ============================================
        console.log('\n=== Seeding Appraisal Cycles ===');
        const cycleIds = [new ObjectId(), new ObjectId(), new ObjectId()];
        
        const appraisalCycles = [
            {
                _id: cycleIds[0],
                name: 'Annual Review 2025',
                description: 'Company-wide annual performance review for 2025',
                cycleType: 'ANNUAL',
                startDate: new Date('2025-12-01'),
                endDate: new Date('2025-12-31'),
                managerDueDate: new Date('2025-12-20'),
                templateAssignments: [
                    {
                        templateId: templateIds[0],
                        departmentIds: departments.map(d => d._id)
                    }
                ],
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: cycleIds[1],
                name: 'H1 2025 Review',
                description: 'First half 2025 semi-annual review',
                cycleType: 'SEMI_ANNUAL',
                startDate: new Date('2025-06-01'),
                endDate: new Date('2025-06-30'),
                managerDueDate: new Date('2025-06-25'),
                templateAssignments: [
                    {
                        templateId: templateIds[0],
                        departmentIds: departments.map(d => d._id)
                    }
                ],
                status: 'CLOSED',
                createdAt: new Date('2025-05-15'),
                updatedAt: new Date()
            },
            {
                _id: cycleIds[2],
                name: 'Q4 Project Review',
                description: 'Project-based review for Q4 2025',
                cycleType: 'AD_HOC',
                startDate: new Date('2025-11-15'),
                endDate: new Date('2025-12-15'),
                managerDueDate: new Date('2025-12-10'),
                templateAssignments: [
                    {
                        templateId: templateIds[2],
                        departmentIds: [departments[0]._id]
                    }
                ],
                status: 'ACTIVE',
                createdAt: new Date('2025-11-01'),
                updatedAt: new Date()
            }
        ];

        await db.collection('appraisal_cycles').deleteMany({});
        await db.collection('appraisal_cycles').insertMany(appraisalCycles);
        console.log(`Created ${appraisalCycles.length} appraisal cycles`);

        // ============================================
        // APPRAISAL ASSIGNMENTS
        // ============================================
        console.log('\n=== Seeding Appraisal Assignments ===');
        const assignmentIds = [];
        const assignments = [];

        // Create assignments for regular employees in the active annual cycle
        for (let i = 0; i < Math.min(effectiveRegularEmployees.length, 5); i++) {
            const emp = effectiveRegularEmployees[i];
            const manager = effectiveManagers[i % effectiveManagers.length] || effectiveManagers[0];
            const assignmentId = new ObjectId();
            assignmentIds.push(assignmentId);
            
            assignments.push({
                _id: assignmentId,
                cycleId: cycleIds[0],
                templateId: templateIds[0],
                employeeProfileId: emp._id,
                managerProfileId: manager._id,
                departmentId: emp.departmentId || departments[0]._id,
                positionId: emp.positionId || positions[0]._id,
                status: i < 2 ? 'SUBMITTED' : (i < 4 ? 'IN_PROGRESS' : 'NOT_STARTED'),
                assignedAt: new Date('2025-12-01'),
                dueDate: new Date('2025-12-20'),
                submittedAt: i < 2 ? new Date('2025-12-10') : null,
                publishedAt: null,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        // Add some assignments for the closed H1 cycle
        for (let i = 0; i < Math.min(effectiveRegularEmployees.length, 3); i++) {
            const emp = effectiveRegularEmployees[i];
            const manager = effectiveManagers[i % effectiveManagers.length] || effectiveManagers[0];
            const assignmentId = new ObjectId();
            
            assignments.push({
                _id: assignmentId,
                cycleId: cycleIds[1],
                templateId: templateIds[0],
                employeeProfileId: emp._id,
                managerProfileId: manager._id,
                departmentId: emp.departmentId || departments[0]._id,
                positionId: emp.positionId || positions[0]._id,
                status: 'PUBLISHED',
                assignedAt: new Date('2025-06-01'),
                dueDate: new Date('2025-06-25'),
                submittedAt: new Date('2025-06-20'),
                publishedAt: new Date('2025-06-28'),
                createdAt: new Date('2025-06-01'),
                updatedAt: new Date()
            });
        }

        await db.collection('appraisal_assignments').deleteMany({});
        await db.collection('appraisal_assignments').insertMany(assignments);
        console.log(`Created ${assignments.length} appraisal assignments`);

        // ============================================
        // APPRAISAL RECORDS
        // ============================================
        console.log('\n=== Seeding Appraisal Records ===');
        const records = [];

        // Create records for submitted/published assignments
        for (let i = 0; i < assignments.length; i++) {
            const assignment = assignments[i];
            if (assignment.status === 'SUBMITTED' || assignment.status === 'PUBLISHED') {
                records.push({
                    assignmentId: assignment._id,
                    cycleId: assignment.cycleId,
                    templateId: assignment.templateId,
                    employeeProfileId: assignment.employeeProfileId,
                    managerProfileId: assignment.managerProfileId,
                    ratings: [
                        {
                            key: 'quality',
                            title: 'Quality of Work',
                            ratingValue: 4,
                            ratingLabel: 'Exceeds Expectations',
                            weightedScore: 100,
                            comments: 'Consistently delivers high-quality work'
                        },
                        {
                            key: 'productivity',
                            title: 'Productivity',
                            ratingValue: 3,
                            ratingLabel: 'Meets Expectations',
                            weightedScore: 60,
                            comments: 'Good productivity levels'
                        },
                        {
                            key: 'teamwork',
                            title: 'Teamwork & Collaboration',
                            ratingValue: 4,
                            ratingLabel: 'Exceeds Expectations',
                            weightedScore: 80,
                            comments: 'Great team player'
                        },
                        {
                            key: 'communication',
                            title: 'Communication Skills',
                            ratingValue: 3,
                            ratingLabel: 'Meets Expectations',
                            weightedScore: 45,
                            comments: 'Clear communicator'
                        },
                        {
                            key: 'initiative',
                            title: 'Initiative & Problem Solving',
                            ratingValue: 4,
                            ratingLabel: 'Exceeds Expectations',
                            weightedScore: 80,
                            comments: 'Shows great initiative'
                        }
                    ],
                    totalScore: 365,
                    overallRatingLabel: 'Exceeds Expectations',
                    managerSummary: 'Strong performer who consistently delivers quality work.',
                    strengths: 'Technical skills, teamwork, initiative',
                    improvementAreas: 'Could improve on time management',
                    status: assignment.status === 'PUBLISHED' ? 'HR_PUBLISHED' : 'MANAGER_SUBMITTED',
                    managerSubmittedAt: new Date('2025-06-20'),
                    hrPublishedAt: assignment.status === 'PUBLISHED' ? new Date('2025-06-28') : null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }

        await db.collection('appraisal_records').deleteMany({});
        if (records.length > 0) {
            await db.collection('appraisal_records').insertMany(records);
        }
        console.log(`Created ${records.length} appraisal records`);

        // ============================================
        // APPRAISAL DISPUTES
        // ============================================
        console.log('\n=== Seeding Appraisal Disputes ===');
        const disputes = [];

        // Create a couple of disputes for published records
        const publishedRecords = records.filter(r => r.status === 'HR_PUBLISHED');
        if (publishedRecords.length > 0) {
            disputes.push({
                appraisalId: publishedRecords[0].assignmentId,
                assignmentId: publishedRecords[0].assignmentId,
                cycleId: publishedRecords[0].cycleId,
                raisedByEmployeeId: publishedRecords[0].employeeProfileId,
                reason: 'Disagree with productivity rating',
                details: 'I believe my productivity rating should be higher based on the projects I completed.',
                submittedAt: new Date('2025-07-01'),
                status: 'ADJUSTED',
                assignedReviewerEmployeeId: effectiveManagers[0]._id,
                resolutionSummary: 'After review, rating adjusted to 4',
                resolvedAt: new Date('2025-07-10'),
                resolvedByEmployeeId: effectiveManagers[0]._id,
                createdAt: new Date('2025-07-01'),
                updatedAt: new Date()
            });

            if (publishedRecords.length > 1) {
                disputes.push({
                    appraisalId: publishedRecords[1].assignmentId,
                    assignmentId: publishedRecords[1].assignmentId,
                    cycleId: publishedRecords[1].cycleId,
                    raisedByEmployeeId: publishedRecords[1].employeeProfileId,
                    reason: 'Missing consideration of special project',
                    details: 'The review did not consider my contribution to the Q2 emergency project.',
                    submittedAt: new Date('2025-07-05'),
                    status: 'UNDER_REVIEW',
                    assignedReviewerEmployeeId: effectiveManagers[0]._id,
                    resolutionSummary: null,
                    resolvedAt: null,
                    resolvedByEmployeeId: null,
                    createdAt: new Date('2025-07-05'),
                    updatedAt: new Date()
                });
            }
        }

        await db.collection('appraisal_disputes').deleteMany({});
        if (disputes.length > 0) {
            await db.collection('appraisal_disputes').insertMany(disputes);
        }
        console.log(`Created ${disputes.length} appraisal disputes`);

        console.log('\n=== Performance Seed Complete ===');
        console.log('Collections seeded: appraisal_templates, appraisal_cycles,');
        console.log('appraisal_assignments, appraisal_records, appraisal_disputes');

    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

seedPerformance();
