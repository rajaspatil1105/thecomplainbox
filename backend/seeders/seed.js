/**
 * Database Seeding Script
 * Populates development/testing database with sample data
 * Run: node seeders/seed.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const sequelize = require('../config/database');
const connectMongoDB = require('../config/mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Import models
const User = require('../models/User');
const Committee = require('../models/Committee');
const Complaint = require('../models/Complaint');
const ComplaintStatusLog = require('../models/ComplaintStatusLog');
const EvidenceFile = require('../models/EvidenceFile');
const Feedback = require('../models/Feedback');
const { initializeAssociations } = require('../models');

// ============================================================================
// SEED DATA
// ============================================================================

const SEED_PASSWORD = 'Test@1234';

/**
 * Hash password with bcrypt (cost 12)
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

/**
 * Seed users
 */
async function seedUsers(adminId, principalId, committeeHeadIds) {
  console.log('🌱 Seeding users...');

  const passwordHash = await hashPassword(SEED_PASSWORD);

  // Create committee members
  const committeeMembers = [];
  for (const headId of committeeHeadIds) {
    const committee = await Committee.findByPk(headId.committeeId);
    
    for (let i = 0; i < 2; i++) {
      const member = await User.create({
        institutional_id: `CM${committee.category_tag.substring(0, 3).toUpperCase()}${i + 1}`,
        name: `${committee.name} Member ${i + 1}`,
        email: `member.${committee.category_tag}.${i + 1}@test.edu`,
        password_hash: passwordHash,
        role: 'committee_member',
        committee_id: committee.committee_id,
        is_active: true
      });
      committeeMembers.push(member);
    }
  }

  // Create students
  const students = [];
  for (let i = 1; i <= 10; i++) {
    const student = await User.create({
      institutional_id: `STU${String(i).padStart(4, '0')}`,
      name: `Student ${i}`,
      email: `student.${i}@test.edu`,
      password_hash: passwordHash,
      role: 'student',
      is_active: true
    });
    students.push(student);
  }

  console.log(`✓ Seeded ${committeeMembers.length} committee members and ${students.length} students`);
  return { committeeMembers, students };
}

/**
 * Seed committees
 */
async function seedCommittees(adminId, principalId) {
  console.log('🌱 Seeding committees...');

  const committeeData = [
    {
      name: 'Security Committee',
      category_tag: 'security',
      email_alias: 'security@test.edu'
    },
    {
      name: 'Ragging Prevention Committee',
      category_tag: 'ragging',
      email_alias: 'ragging@test.edu'
    },
    {
      name: 'Academic Committee',
      category_tag: 'academic',
      email_alias: 'academic@test.edu'
    },
    {
      name: 'Hostel Committee',
      category_tag: 'hostel',
      email_alias: 'hostel@test.edu'
    },
    {
      name: 'Fees Committee',
      category_tag: 'fees',
      email_alias: 'fees@test.edu'
    }
  ];

  const passwordHash = await hashPassword(SEED_PASSWORD);
  const committeeHeads = [];

  for (const data of committeeData) {
    // Create committee head user
    const head = await User.create({
      institutional_id: `HEAD${data.category_tag.substring(0, 3).toUpperCase()}`,
      name: `${data.name} Head`,
      email: `head.${data.category_tag}@test.edu`,
      password_hash: passwordHash,
      role: 'committee_head',
      is_active: true
    });

    // Create committee
    const committee = await Committee.create({
      name: data.name,
      category_tag: data.category_tag,
      head_user_id: head.user_id,
      email_alias: data.email_alias
    });

    // Update user with committee_id
    await head.update({ committee_id: committee.committee_id });

    committeeHeads.push({
      headId: head.user_id,
      committeeId: committee.committee_id,
      committee
    });
  }

  console.log(`✓ Seeded ${committeeHeads.length} committees with heads`);
  return committeeHeads;
}

/**
 * Seed complaints
 */
async function seedComplaints(students, committees) {
  console.log('🌱 Seeding complaints...');

  const categories = [
    'security',
    'ragging',
    'academic',
    'hostel',
    'fees'
  ];

  const severities = ['low', 'medium', 'high', 'critical'];
  const priorities = ['P1', 'P2', 'P3', 'P4'];
  const statuses = [
    'submitted',
    'under_review',
    'assigned',
    'in_progress',
    'waiting_student',
    'resolved',
    'closed',
    'escalated'
  ];

  const complaintTitles = [
    'Campus security incident',
    'Ragging complaint',
    'Grade dispute',
    'Hostel maintenance issue',
    'Tuition fee discrepancy',
    'Library facilities complaint',
    'Canteen quality issue',
    'IT lab equipment problem',
    'Transportation issue',
    'Discrimination complaint'
  ];

  const descriptions = [
    'I witnessed an incident on campus that needs investigation.',
    'I have been experiencing harassment and bullying.',
    'The grade I received does not match my performance.',
    'The hostel room has ongoing maintenance issues.',
    'There is a discrepancy in my fee calculation.',
    'The library resources are insufficient for our course.',
    'The food quality in canteen has deteriorated.',
    'The computers in the IT lab are not functioning properly.',
    'The shuttle bus service is very unreliable.',
    'I have been treated unfairly due to my background.'
  ];

  const complaints = [];
  const now = new Date();

  for (let i = 0; i < 20; i++) {
    const student = students[i % students.length];
    const categoryIndex = i % categories.length;
    const category = categories[categoryIndex];
    const committee = committees[categoryIndex];

    // Determine if anonymous (50% chance)
    const isAnonymous = Math.random() < 0.5;

    // Randomize dates within last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const submittedAt = new Date(now);
    submittedAt.setDate(submittedAt.getDate() - daysAgo);

    // Compute SLA deadline based on severity
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const slaDays = {
      critical: 4 / 24, // 4 hours in days
      high: 1, // 24 hours
      medium: 2, // 48 hours
      low: 5 // 120 hours in days
    };

    const slaDeadline = new Date(submittedAt);
    slaDeadline.setDate(slaDeadline.getDate() + slaDays[severity]);

    // Resolved date for closed/resolved complaints
    let resolvedAt = null;
    if ([6, 7].includes(i % statuses.length)) { // resolved or closed
      resolvedAt = new Date(submittedAt);
      resolvedAt.setDate(resolvedAt.getDate() + Math.floor(Math.random() * 5) + 1);
    }

    const complaint = await Complaint.create({
      student_id: isAnonymous ? null : student.user_id,
      title: complaintTitles[i % complaintTitles.length],
      description: descriptions[i % descriptions.length],
      category: category,
      severity: severity,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: statuses[i % statuses.length],
      committee_id: committee.committeeId,
      is_anonymous: isAnonymous,
      ai_confidence: Math.random().toFixed(3),
      submitted_at: submittedAt,
      resolved_at: resolvedAt,
      sla_deadline: slaDeadline
    });

    complaints.push(complaint);
  }

  console.log(`✓ Seeded ${complaints.length} complaints`);
  return complaints;
}

/**
 * Main seeding function
 */
async function seed() {
  try {
    console.log('\n📊 Starting database seeding...\n');

    // Initialize associations
    initializeAssociations();

    // Connect to databases
    await sequelize.authenticate();
    console.log('✓ MySQL connected');

    await connectMongoDB();
    console.log('✓ MongoDB connected\n');

    // Clear existing data (disable foreign key checks)
    console.log('🗑️  Clearing existing data...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS=0');
    await Complaint.destroy({ where: {}, force: true });
    await ComplaintStatusLog.destroy({ where: {}, force: true });
    await Feedback.destroy({ where: {}, force: true });
    await EvidenceFile.destroy({ where: {}, force: true });
    await Committee.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS=1');
    console.log('✓ Data cleared\n');

    // Get password hash
    const passwordHash = await hashPassword(SEED_PASSWORD);

    // 1. Create admin user
    console.log('🌱 Seeding admin user...');
    const admin = await User.create({
      institutional_id: 'ADMIN001',
      name: 'System Administrator',
      email: 'admin@test.edu',
      password_hash: passwordHash,
      role: 'admin',
      is_active: true
    });
    console.log('✓ Admin user created\n');

    // 2. Create principal user
    console.log('🌱 Seeding principal user...');
    const principal = await User.create({
      institutional_id: 'PRINCIPAL001',
      name: 'Principal',
      email: 'principal@test.edu',
      password_hash: passwordHash,
      role: 'principal',
      is_active: true
    });
    console.log('✓ Principal user created\n');

    // 3. Seed committees with heads
    const committeeHeads = await seedCommittees(admin.user_id, principal.user_id);

    // 4. Seed committee members and students
    const { committeeMembers, students } = await seedUsers(
      admin.user_id,
      principal.user_id,
      committeeHeads
    );

    // 5. Seed complaints
    await seedComplaints(students, committeeHeads);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📝 Seed credentials:');
    console.log(`   Email: admin@test.edu`);
    console.log(`   Password: ${SEED_PASSWORD}\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run seed
seed();
