/**
 * Seed Script 01: Recruitment Data
 * Seeds: candidates, jobtemplates, jobrequisitions, applications, 
 *        applicationstatushistories, interviews, assessmentresults, offers, contracts, onboardings, referrals, documents
 * 
 * Run with: node scripts/seed_01_recruitment.js
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function seedRecruitment() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db();
        
        // Get existing data for references
        const departments = await db.collection('departments').find({}).toArray();
        const positions = await db.collection('positions').find({}).toArray();
        const employees = await db.collection('employeeprofiles').find({}).toArray();
        const systemRoles = await db.collection('employee_system_roles').find({}).toArray();
        
        if (departments.length === 0 || positions.length === 0 || employees.length === 0) {
            console.error('Please run seed_complete_system.js first to create departments, positions, and employees');
            return;
        }

        const hrEmployee = systemRoles.find(r => r.role === 'HR Employee') || systemRoles[0];
        const recruiter = systemRoles.find(r => r.role === 'Recruiter') || systemRoles[0];
        const hrManager = systemRoles.find(r => r.role === 'HR Manager') || systemRoles[0];
        const deptHead = systemRoles.find(r => r.role === 'department head') || systemRoles[0];
        const defaultEmployee = employees[0];

        // ============================================
        // CANDIDATES
        // ============================================
        console.log('\n=== Seeding Candidates ===');
        const candidateIds = [
            new ObjectId(), new ObjectId(), new ObjectId(), 
            new ObjectId(), new ObjectId(), new ObjectId()
        ];
        
        const candidates = [
            {
                _id: candidateIds[0],
                candidateNumber: 'CAND-001',
                firstName: 'Alice',
                lastName: 'Johnson',
                nationalId: '29901011234567',
                personalEmail: 'alice.johnson@email.com',
                mobilePhone: '+201001234567',
                gender: 'FEMALE',
                dateOfBirth: new Date('1999-01-01'),
                departmentId: departments[0]._id,
                positionId: positions[0]._id,
                applicationDate: new Date('2025-11-01'),
                status: 'HIRED',
                resumeUrl: '/uploads/resumes/alice_resume.pdf',
                notes: 'Strong technical background',
                address: { city: 'Cairo', country: 'Egypt' },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: candidateIds[1],
                candidateNumber: 'CAND-002',
                firstName: 'Bob',
                lastName: 'Smith',
                nationalId: '29802021234568',
                personalEmail: 'bob.smith@email.com',
                mobilePhone: '+201001234568',
                gender: 'MALE',
                dateOfBirth: new Date('1998-02-02'),
                departmentId: departments[1]?._id || departments[0]._id,
                positionId: positions[1]?._id || positions[0]._id,
                applicationDate: new Date('2025-11-15'),
                status: 'OFFER_ACCEPTED',
                resumeUrl: '/uploads/resumes/bob_resume.pdf',
                notes: 'Excellent communication skills',
                address: { city: 'Alexandria', country: 'Egypt' },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: candidateIds[2],
                candidateNumber: 'CAND-003',
                firstName: 'Carol',
                lastName: 'Williams',
                nationalId: '29703031234569',
                personalEmail: 'carol.williams@email.com',
                mobilePhone: '+201001234569',
                gender: 'FEMALE',
                dateOfBirth: new Date('1997-03-03'),
                departmentId: departments[0]._id,
                positionId: positions[2]?._id || positions[0]._id,
                applicationDate: new Date('2025-12-01'),
                status: 'INTERVIEW',
                resumeUrl: '/uploads/resumes/carol_resume.pdf',
                notes: 'Currently in interview stage',
                address: { city: 'Giza', country: 'Egypt' },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: candidateIds[3],
                candidateNumber: 'CAND-004',
                firstName: 'Daniel',
                lastName: 'Brown',
                nationalId: '29604041234570',
                personalEmail: 'daniel.brown@email.com',
                mobilePhone: '+201001234570',
                gender: 'MALE',
                dateOfBirth: new Date('1996-04-04'),
                departmentId: departments[1]?._id || departments[0]._id,
                positionId: positions[0]._id,
                applicationDate: new Date('2025-12-05'),
                status: 'SCREENING',
                resumeUrl: '/uploads/resumes/daniel_resume.pdf',
                notes: 'Pending initial review',
                address: { city: 'Cairo', country: 'Egypt' },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: candidateIds[4],
                candidateNumber: 'CAND-005',
                firstName: 'Eva',
                lastName: 'Davis',
                nationalId: '29505051234571',
                personalEmail: 'eva.davis@email.com',
                mobilePhone: '+201001234571',
                gender: 'FEMALE',
                dateOfBirth: new Date('1995-05-05'),
                departmentId: departments[0]._id,
                positionId: positions[1]?._id || positions[0]._id,
                applicationDate: new Date('2025-10-15'),
                status: 'REJECTED',
                resumeUrl: '/uploads/resumes/eva_resume.pdf',
                notes: 'Did not meet technical requirements',
                address: { city: 'Mansoura', country: 'Egypt' },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: candidateIds[5],
                candidateNumber: 'CAND-006',
                firstName: 'Frank',
                lastName: 'Miller',
                nationalId: '29406061234572',
                personalEmail: 'frank.miller@email.com',
                mobilePhone: '+201001234572',
                gender: 'MALE',
                dateOfBirth: new Date('1994-06-06'),
                departmentId: departments[2]?._id || departments[0]._id,
                positionId: positions[2]?._id || positions[0]._id,
                applicationDate: new Date('2025-11-20'),
                status: 'OFFER_SENT',
                resumeUrl: '/uploads/resumes/frank_resume.pdf',
                notes: 'Awaiting offer response',
                address: { city: 'Tanta', country: 'Egypt' },
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('candidates').deleteMany({});
        await db.collection('candidates').insertMany(candidates);
        console.log(`Created ${candidates.length} candidates`);

        // ============================================
        // JOB TEMPLATES
        // ============================================
        console.log('\n=== Seeding Job Templates ===');
        const templateIds = [new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId()];
        
        const jobTemplates = [
            {
                _id: templateIds[0],
                title: 'Software Engineer',
                department: departments[0]._id,
                qualifications: ['Bachelor in Computer Science', '2+ years experience', 'Strong problem solving'],
                skills: ['JavaScript', 'Python', 'SQL', 'Git'],
                description: 'We are looking for a skilled software engineer to join our development team.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: templateIds[1],
                title: 'HR Specialist',
                department: departments.find(d => d.name === 'Human Resources')?._id || departments[0]._id,
                qualifications: ['Bachelor in HR or Business', '1+ years HR experience'],
                skills: ['Communication', 'HRIS Systems', 'Employee Relations', 'Recruitment'],
                description: 'Looking for an HR specialist to support our growing team.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: templateIds[2],
                title: 'Financial Analyst',
                department: departments.find(d => d.name === 'Finance')?._id || departments[0]._id,
                qualifications: ['Bachelor in Finance or Accounting', 'CFA preferred', '3+ years experience'],
                skills: ['Financial Modeling', 'Excel', 'SAP', 'Data Analysis'],
                description: 'Seeking a financial analyst to join our finance department.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: templateIds[3],
                title: 'Project Manager',
                department: departments[0]._id,
                qualifications: ['Bachelor degree', 'PMP certification preferred', '5+ years PM experience'],
                skills: ['Project Management', 'Agile', 'Stakeholder Management', 'Risk Assessment'],
                description: 'Experienced project manager needed for enterprise projects.',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('jobtemplates').deleteMany({});
        await db.collection('jobtemplates').insertMany(jobTemplates);
        console.log(`Created ${jobTemplates.length} job templates`);

        // ============================================
        // JOB REQUISITIONS
        // ============================================
        console.log('\n=== Seeding Job Requisitions ===');
        const requisitionIds = [new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId()];
        
        const jobRequisitions = [
            {
                _id: requisitionIds[0],
                requisitionId: 'REQ-2025-001',
                templateId: templateIds[0],
                openings: 3,
                location: 'Cairo, Egypt',
                hiringManagerId: deptHead?._id || employees[0]._id,
                publishStatus: 'published',
                postingDate: new Date('2025-10-01'),
                expiryDate: new Date('2026-01-31'),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: requisitionIds[1],
                requisitionId: 'REQ-2025-002',
                templateId: templateIds[1],
                openings: 2,
                location: 'Cairo, Egypt',
                hiringManagerId: hrManager?._id || employees[0]._id,
                publishStatus: 'published',
                postingDate: new Date('2025-11-01'),
                expiryDate: new Date('2026-02-28'),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: requisitionIds[2],
                requisitionId: 'REQ-2025-003',
                templateId: templateIds[2],
                openings: 1,
                location: 'Alexandria, Egypt',
                hiringManagerId: defaultEmployee._id,
                publishStatus: 'draft',
                postingDate: new Date('2025-12-01'),
                expiryDate: new Date('2026-03-31'),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: requisitionIds[3],
                requisitionId: 'REQ-2025-004',
                templateId: templateIds[3],
                openings: 1,
                location: 'Cairo, Egypt',
                hiringManagerId: deptHead?._id || employees[0]._id,
                publishStatus: 'closed',
                postingDate: new Date('2025-09-01'),
                expiryDate: new Date('2025-12-01'),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('jobrequisitions').deleteMany({});
        await db.collection('jobrequisitions').insertMany(jobRequisitions);
        console.log(`Created ${jobRequisitions.length} job requisitions`);

        // ============================================
        // APPLICATIONS
        // ============================================
        console.log('\n=== Seeding Applications ===');
        const applicationIds = [
            new ObjectId(), new ObjectId(), new ObjectId(),
            new ObjectId(), new ObjectId(), new ObjectId()
        ];
        
        const applications = [
            {
                _id: applicationIds[0],
                candidateId: candidateIds[0],
                requisitionId: requisitionIds[0],
                assignedHr: hrEmployee?._id || employees[0]._id,
                currentStage: 'offer',
                status: 'hired',
                createdAt: new Date('2025-11-01'),
                updatedAt: new Date()
            },
            {
                _id: applicationIds[1],
                candidateId: candidateIds[1],
                requisitionId: requisitionIds[0],
                assignedHr: hrEmployee?._id || employees[0]._id,
                currentStage: 'offer',
                status: 'offer',
                createdAt: new Date('2025-11-15'),
                updatedAt: new Date()
            },
            {
                _id: applicationIds[2],
                candidateId: candidateIds[2],
                requisitionId: requisitionIds[1],
                assignedHr: recruiter?._id || employees[0]._id,
                currentStage: 'hr_interview',
                status: 'in_process',
                createdAt: new Date('2025-12-01'),
                updatedAt: new Date()
            },
            {
                _id: applicationIds[3],
                candidateId: candidateIds[3],
                requisitionId: requisitionIds[0],
                assignedHr: recruiter?._id || employees[0]._id,
                currentStage: 'screening',
                status: 'submitted',
                createdAt: new Date('2025-12-05'),
                updatedAt: new Date()
            },
            {
                _id: applicationIds[4],
                candidateId: candidateIds[4],
                requisitionId: requisitionIds[1],
                assignedHr: hrEmployee?._id || employees[0]._id,
                currentStage: 'screening',
                status: 'rejected',
                createdAt: new Date('2025-10-15'),
                updatedAt: new Date()
            },
            {
                _id: applicationIds[5],
                candidateId: candidateIds[5],
                requisitionId: requisitionIds[2],
                assignedHr: recruiter?._id || employees[0]._id,
                currentStage: 'offer',
                status: 'offer',
                createdAt: new Date('2025-11-20'),
                updatedAt: new Date()
            }
        ];

        await db.collection('applications').deleteMany({});
        await db.collection('applications').insertMany(applications);
        console.log(`Created ${applications.length} applications`);

        // ============================================
        // APPLICATION STATUS HISTORIES
        // ============================================
        console.log('\n=== Seeding Application Status Histories ===');
        const histories = [
            {
                applicationId: applicationIds[0],
                oldStage: 'screening',
                newStage: 'department_interview',
                oldStatus: 'submitted',
                newStatus: 'in_process',
                changedBy: hrEmployee?._id || employees[0]._id,
                createdAt: new Date('2025-11-05'),
                updatedAt: new Date()
            },
            {
                applicationId: applicationIds[0],
                oldStage: 'department_interview',
                newStage: 'hr_interview',
                oldStatus: 'in_process',
                newStatus: 'in_process',
                changedBy: deptHead?._id || employees[0]._id,
                createdAt: new Date('2025-11-10'),
                updatedAt: new Date()
            },
            {
                applicationId: applicationIds[0],
                oldStage: 'hr_interview',
                newStage: 'offer',
                oldStatus: 'in_process',
                newStatus: 'offer',
                changedBy: hrManager?._id || employees[0]._id,
                createdAt: new Date('2025-11-15'),
                updatedAt: new Date()
            },
            {
                applicationId: applicationIds[0],
                oldStage: 'offer',
                newStage: 'offer',
                oldStatus: 'offer',
                newStatus: 'hired',
                changedBy: hrManager?._id || employees[0]._id,
                createdAt: new Date('2025-11-20'),
                updatedAt: new Date()
            },
            {
                applicationId: applicationIds[4],
                oldStage: 'screening',
                newStage: 'screening',
                oldStatus: 'submitted',
                newStatus: 'rejected',
                changedBy: hrEmployee?._id || employees[0]._id,
                createdAt: new Date('2025-10-20'),
                updatedAt: new Date()
            }
        ];

        await db.collection('applicationstatushistories').deleteMany({});
        await db.collection('applicationstatushistories').insertMany(histories);
        console.log(`Created ${histories.length} application status histories`);

        // ============================================
        // INTERVIEWS
        // ============================================
        console.log('\n=== Seeding Interviews ===');
        const interviewIds = [new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId()];
        
        const interviews = [
            {
                _id: interviewIds[0],
                applicationId: applicationIds[0],
                stage: 'department_interview',
                scheduledDate: new Date('2025-11-08'),
                method: 'onsite',
                panel: [deptHead?._id || employees[0]._id],
                status: 'completed',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: interviewIds[1],
                applicationId: applicationIds[0],
                stage: 'hr_interview',
                scheduledDate: new Date('2025-11-12'),
                method: 'video',
                panel: [hrManager?._id || employees[0]._id, hrEmployee?._id || employees[0]._id],
                videoLink: 'https://meet.company.com/interview123',
                status: 'completed',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: interviewIds[2],
                applicationId: applicationIds[1],
                stage: 'department_interview',
                scheduledDate: new Date('2025-11-20'),
                method: 'onsite',
                panel: [deptHead?._id || employees[0]._id],
                status: 'completed',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: interviewIds[3],
                applicationId: applicationIds[2],
                stage: 'hr_interview',
                scheduledDate: new Date('2025-12-18'),
                method: 'video',
                panel: [hrManager?._id || employees[0]._id],
                videoLink: 'https://meet.company.com/interview456',
                status: 'scheduled',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: interviewIds[4],
                applicationId: applicationIds[5],
                stage: 'department_interview',
                scheduledDate: new Date('2025-11-25'),
                method: 'phone',
                panel: [employees[0]._id],
                status: 'completed',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('interviews').deleteMany({});
        await db.collection('interviews').insertMany(interviews);
        console.log(`Created ${interviews.length} interviews`);

        // ============================================
        // ASSESSMENT RESULTS
        // ============================================
        console.log('\n=== Seeding Assessment Results ===');
        const assessmentResults = [
            {
                interviewId: interviewIds[0],
                interviewerId: deptHead?._id || employees[0]._id,
                score: 85,
                comments: 'Strong technical skills, good cultural fit',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                interviewId: interviewIds[1],
                interviewerId: hrManager?._id || employees[0]._id,
                score: 90,
                comments: 'Excellent communication, well prepared',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                interviewId: interviewIds[2],
                interviewerId: deptHead?._id || employees[0]._id,
                score: 78,
                comments: 'Good potential, needs some training',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                interviewId: interviewIds[4],
                interviewerId: employees[0]._id,
                score: 82,
                comments: 'Solid experience, enthusiastic',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('assessmentresults').deleteMany({});
        await db.collection('assessmentresults').insertMany(assessmentResults);
        console.log(`Created ${assessmentResults.length} assessment results`);

        // ============================================
        // OFFERS
        // ============================================
        console.log('\n=== Seeding Offers ===');
        const offerIds = [new ObjectId(), new ObjectId(), new ObjectId()];
        
        const offers = [
            {
                _id: offerIds[0],
                applicationId: applicationIds[0],
                candidateId: candidateIds[0],
                hrEmployeeId: hrEmployee?._id || employees[0]._id,
                grossSalary: 15000,
                signingBonus: 5000,
                benefits: ['Health Insurance', 'Transportation', 'Annual Bonus'],
                conditions: 'Standard employment terms',
                insurances: 'Full medical and life insurance',
                content: 'We are pleased to offer you the position of Software Engineer...',
                role: 'Software Engineer',
                deadline: new Date('2025-11-25'),
                applicantResponse: 'ACCEPTED',
                approvers: [
                    {
                        employeeId: hrManager?._id || employees[0]._id,
                        role: 'HR Manager',
                        status: 'approved',
                        actionDate: new Date('2025-11-18'),
                        comment: 'Approved'
                    }
                ],
                createdAt: new Date('2025-11-17'),
                updatedAt: new Date()
            },
            {
                _id: offerIds[1],
                applicationId: applicationIds[1],
                candidateId: candidateIds[1],
                hrEmployeeId: hrEmployee?._id || employees[0]._id,
                grossSalary: 12000,
                signingBonus: 3000,
                benefits: ['Health Insurance', 'Transportation'],
                conditions: 'Standard employment terms',
                insurances: 'Medical insurance',
                content: 'We are pleased to offer you the position...',
                role: 'Junior Developer',
                deadline: new Date('2025-12-20'),
                applicantResponse: 'PENDING',
                approvers: [
                    {
                        employeeId: hrManager?._id || employees[0]._id,
                        role: 'HR Manager',
                        status: 'approved',
                        actionDate: new Date('2025-12-10'),
                        comment: 'Approved'
                    }
                ],
                createdAt: new Date('2025-12-08'),
                updatedAt: new Date()
            },
            {
                _id: offerIds[2],
                applicationId: applicationIds[5],
                candidateId: candidateIds[5],
                hrEmployeeId: recruiter?._id || employees[0]._id,
                grossSalary: 18000,
                signingBonus: 8000,
                benefits: ['Health Insurance', 'Transportation', 'Stock Options'],
                conditions: 'Senior role employment terms',
                insurances: 'Comprehensive insurance package',
                content: 'We are pleased to offer you the position of Financial Analyst...',
                role: 'Financial Analyst',
                deadline: new Date('2025-12-25'),
                applicantResponse: 'PENDING',
                approvers: [
                    {
                        employeeId: hrManager?._id || employees[0]._id,
                        role: 'HR Manager',
                        status: 'pending',
                        actionDate: null,
                        comment: null
                    }
                ],
                createdAt: new Date('2025-12-12'),
                updatedAt: new Date()
            }
        ];

        await db.collection('offers').deleteMany({});
        await db.collection('offers').insertMany(offers);
        console.log(`Created ${offers.length} offers`);

        // ============================================
        // CONTRACTS
        // ============================================
        console.log('\n=== Seeding Contracts ===');
        const contractIds = [new ObjectId(), new ObjectId()];
        
        const contracts = [
            {
                _id: contractIds[0],
                offerId: offerIds[0],
                acceptanceDate: new Date('2025-11-22'),
                grossSalary: 15000,
                signingBonus: 5000,
                role: 'Software Engineer',
                benefits: ['Health Insurance', 'Transportation', 'Annual Bonus'],
                documentId: null,
                signatures: [
                    {
                        signerId: candidateIds[0],
                        role: 'Employee',
                        signedAt: new Date('2025-11-22'),
                        signature: 'Alice Johnson'
                    },
                    {
                        signerId: hrManager?._id || employees[0]._id,
                        role: 'HR Manager',
                        signedAt: new Date('2025-11-23'),
                        signature: 'Michael HRManager'
                    }
                ],
                createdAt: new Date('2025-11-22'),
                updatedAt: new Date()
            },
            {
                _id: contractIds[1],
                offerId: offerIds[1],
                acceptanceDate: new Date('2025-12-15'),
                grossSalary: 12000,
                signingBonus: 3000,
                role: 'Junior Developer',
                benefits: ['Health Insurance', 'Transportation'],
                documentId: null,
                signatures: [
                    {
                        signerId: candidateIds[1],
                        role: 'Employee',
                        signedAt: new Date('2025-12-15'),
                        signature: 'Bob Smith'
                    }
                ],
                createdAt: new Date('2025-12-15'),
                updatedAt: new Date()
            }
        ];

        await db.collection('contracts').deleteMany({});
        await db.collection('contracts').insertMany(contracts);
        console.log(`Created ${contracts.length} contracts`);

        // ============================================
        // ONBOARDINGS
        // ============================================
        console.log('\n=== Seeding Onboardings ===');
        const onboardings = [
            {
                employeeId: employees[0]._id,
                contractId: contractIds[0],
                tasks: [
                    {
                        name: 'Complete HR paperwork',
                        department: 'HR',
                        status: 'COMPLETED',
                        deadline: new Date('2025-11-25'),
                        completedAt: new Date('2025-11-24'),
                        notes: 'All documents submitted'
                    },
                    {
                        name: 'IT setup - laptop and accounts',
                        department: 'IT',
                        status: 'COMPLETED',
                        deadline: new Date('2025-11-26'),
                        completedAt: new Date('2025-11-25'),
                        notes: 'Laptop assigned, email created'
                    },
                    {
                        name: 'Security badge and access',
                        department: 'Security',
                        status: 'COMPLETED',
                        deadline: new Date('2025-11-27'),
                        completedAt: new Date('2025-11-26'),
                        notes: 'Badge issued'
                    },
                    {
                        name: 'Team introduction',
                        department: 'Engineering',
                        status: 'COMPLETED',
                        deadline: new Date('2025-11-28'),
                        completedAt: new Date('2025-11-27'),
                        notes: 'Met the team'
                    }
                ],
                completed: true,
                completedAt: new Date('2025-11-28'),
                createdAt: new Date('2025-11-23'),
                updatedAt: new Date()
            },
            {
                employeeId: employees[1]?._id || employees[0]._id,
                contractId: contractIds[1],
                tasks: [
                    {
                        name: 'Complete HR paperwork',
                        department: 'HR',
                        status: 'PENDING',
                        deadline: new Date('2025-12-20'),
                        completedAt: null,
                        notes: null
                    },
                    {
                        name: 'IT setup - laptop and accounts',
                        department: 'IT',
                        status: 'PENDING',
                        deadline: new Date('2025-12-22'),
                        completedAt: null,
                        notes: null
                    },
                    {
                        name: 'Security badge and access',
                        department: 'Security',
                        status: 'PENDING',
                        deadline: new Date('2025-12-23'),
                        completedAt: null,
                        notes: null
                    }
                ],
                completed: false,
                completedAt: null,
                createdAt: new Date('2025-12-16'),
                updatedAt: new Date()
            }
        ];

        await db.collection('onboardings').deleteMany({});
        await db.collection('onboardings').insertMany(onboardings);
        console.log(`Created ${onboardings.length} onboardings`);

        // ============================================
        // REFERRALS
        // ============================================
        console.log('\n=== Seeding Referrals ===');
        const referrals = [
            {
                referringEmployeeId: employees[0]._id,
                candidateId: candidateIds[1],
                role: 'Junior Developer',
                level: 'Junior',
                createdAt: new Date('2025-11-10'),
                updatedAt: new Date()
            },
            {
                referringEmployeeId: employees[1]?._id || employees[0]._id,
                candidateId: candidateIds[2],
                role: 'HR Specialist',
                level: 'Mid',
                createdAt: new Date('2025-11-28'),
                updatedAt: new Date()
            }
        ];

        await db.collection('referrals').deleteMany({});
        await db.collection('referrals').insertMany(referrals);
        console.log(`Created ${referrals.length} referrals`);

        // ============================================
        // DOCUMENTS
        // ============================================
        console.log('\n=== Seeding Documents ===');
        const documents = [
            {
                ownerId: candidateIds[0],
                type: 'resume',
                filePath: '/uploads/documents/alice_resume.pdf',
                uploadedAt: new Date('2025-11-01'),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                ownerId: candidateIds[0],
                type: 'id_card',
                filePath: '/uploads/documents/alice_id.pdf',
                uploadedAt: new Date('2025-11-20'),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                ownerId: candidateIds[1],
                type: 'resume',
                filePath: '/uploads/documents/bob_resume.pdf',
                uploadedAt: new Date('2025-11-15'),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                ownerId: candidateIds[2],
                type: 'resume',
                filePath: '/uploads/documents/carol_resume.pdf',
                uploadedAt: new Date('2025-12-01'),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('documents').deleteMany({});
        await db.collection('documents').insertMany(documents);
        console.log(`Created ${documents.length} documents`);

        console.log('\n=== Recruitment Seed Complete ===');
        console.log('Collections seeded: candidates, jobtemplates, jobrequisitions, applications,');
        console.log('applicationstatushistories, interviews, assessmentresults, offers, contracts,');
        console.log('onboardings, referrals, documents');

    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

seedRecruitment();
