#!/usr/bin/env node
/*
Create one employee + system role entry for every SystemRole value.
Email format: <name>@company.<role>.com (role slugged to be DNS-safe).
Run (dev only):
  $env:MONGODB_URI="<your Mongo URI>"; node scripts/create_users_for_roles.js
Optional env vars:
  DEFAULT_ROLE_PASSWORD   - password for all created users (default: RoleUser@1234)
This script refuses to run against localhost or NODE_ENV=production.
*/

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set. Please set it in your environment or .env file.');
  process.exit(1);
}
if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
  console.error('Refusing to use a localhost MongoDB URI. This project expects a remote Mongo (e.g., Atlas).');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to run seed script in production');
  process.exit(1);
}

const SYSTEM_ROLES = [
  'department employee',
  'department head',
  'HR Manager',
  'HR Employee',
  'Payroll Specialist',
  'Payroll Manager',
  'System Admin',
  'Legal & Policy Admin',
  'Recruiter',
  'Finance Staff',
  'Job Candidate',
  'HR Admin',
];

const DEFAULT_PASSWORD = process.env.DEFAULT_ROLE_PASSWORD || 'RoleUser@1234';

function slugify(input) {
  return (input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'user';
}

function emailFor(name, role) {
  const local = slugify(name).replace(/-/g, '.') || 'user';
  const roleSlug = slugify(role);
  return `${local}@company.${roleSlug}.com`;
}

async function hashPassword(p) {
  const saltRounds = 10;
  return bcrypt.hash(p, saltRounds);
}

async function upsertEmployee(empColl, { employeeNumber, firstName, lastName, nationalId, workEmail, personalEmail, password }) {
  const existing = await empColl.findOne({
    $or: [
      { workEmail },
      { personalEmail },
      { nationalId },
      { employeeNumber },
    ],
  });
  if (existing) {
    return { doc: existing, created: false };
  }

  const hashed = await hashPassword(password);
  const now = new Date();
  const doc = {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    nationalId,
    password: hashed,
    workEmail,
    personalEmail,
    mobilePhone: '+0000000000',
    employeeNumber,
    dateOfHire: now,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  };

  const res = await empColl.insertOne(doc);
  const inserted = await empColl.findOne({ _id: res.insertedId });
  return { doc: inserted, created: true };
}

async function ensureRoles(roleColl, employeeId, roles) {
  const existing = await roleColl.findOne({ employeeProfileId: employeeId });
  const now = new Date();
  if (existing) {
    const mergedRoles = Array.from(new Set([...(existing.roles || []), ...roles]));
    await roleColl.updateOne(
      { _id: existing._id },
      { $set: { roles: mergedRoles, isActive: true, updatedAt: now } },
    );
    return mergedRoles;
  }
  await roleColl.insertOne({ employeeProfileId: employeeId, roles, permissions: [], isActive: true, createdAt: now, updatedAt: now });
  return roles;
}

async function main() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', uri.replace(/(mongodb\+srv:\/\/).*@/, '$1***@'));

  const db = mongoose.connection;
  const empColl = db.collection('employee_profiles');
  const roleColl = db.collection('employee_system_roles');

  const createdUsers = [];

  for (const role of SYSTEM_ROLES) {
    const roleSlug = slugify(role);
    const firstName = role.split(' ')[0] || 'Role';
    const lastName = role.split(' ').slice(1).join(' ') || 'User';
    const nameForEmail = `${firstName}.${lastName}`;
    const workEmail = emailFor(nameForEmail, roleSlug);
    const personalEmail = workEmail;
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const employeeNumber = `${roleSlug.toUpperCase().replace(/-/g, '_')}-${uniqueSuffix}`;
    const nationalId = `${roleSlug.toUpperCase()}-${uniqueSuffix}`;

    const { doc, created } = await upsertEmployee(empColl, {
      employeeNumber,
      firstName,
      lastName,
      nationalId,
      workEmail,
      personalEmail,
      password: DEFAULT_PASSWORD,
    });

    const assignedRoles = await ensureRoles(roleColl, doc._id, [role]);

    createdUsers.push({
      _id: doc._id.toString(),
      role,
      workEmail: doc.workEmail,
      password: DEFAULT_PASSWORD,
      created,
      rolesAssigned: assignedRoles,
    });
  }

  console.log('\nUsers by role:');
  console.log(JSON.stringify(createdUsers, null, 2));

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error creating users by role:', err);
  process.exit(1);
});
