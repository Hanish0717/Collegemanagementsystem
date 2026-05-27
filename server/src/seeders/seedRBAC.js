/**
 * RBAC Seeder
 * 
 * Seeds the complete RBAC system:
 *   1. Permission Groups (12 groups)
 *   2. Permissions (90+ atomic permissions)
 *   3. Roles (9 default roles)
 *   4. Role-Permission mappings
 *   5. User-Role assignments for existing users
 * 
 * Usage: node src/seeders/seedRBAC.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Role from '../models/rbac/Role.js';
import Permission from '../models/rbac/Permission.js';
import PermissionGroup from '../models/rbac/PermissionGroup.js';
import RolePermission from '../models/rbac/RolePermission.js';
import UserRole from '../models/rbac/UserRole.js';
import User from '../models/auth/User.js';

dotenv.config();

// ═══════════════════════════════════════════════════════════
// 1. PERMISSION GROUPS
// ═══════════════════════════════════════════════════════════
const permissionGroups = [
  { name: 'Dashboard', slug: 'dashboard', icon: '📊', order: 1, description: 'Dashboard & analytics access' },
  { name: 'User Management', slug: 'user-management', icon: '👤', order: 2, description: 'Manage system users and accounts' },
  { name: 'Role Management', slug: 'role-management', icon: '🔐', order: 3, description: 'Manage roles and permissions' },
  { name: 'Student Management', slug: 'student-management', icon: '🎓', order: 4, description: 'Student records and profiles' },
  { name: 'Faculty Management', slug: 'faculty-management', icon: '👨‍🏫', order: 5, description: 'Faculty records and assignments' },
  { name: 'Academic Operations', slug: 'academic-operations', icon: '📚', order: 6, description: 'Attendance, subjects, departments' },
  { name: 'Financial Operations', slug: 'financial-operations', icon: '💰', order: 7, description: 'Fees, payments, and financial reports' },
  { name: 'Library Management', slug: 'library-management', icon: '📖', order: 8, description: 'Book catalog, issues, and returns' },
  { name: 'Hostel Management', slug: 'hostel-management', icon: '🏠', order: 9, description: 'Hostels, rooms, and allocations' },
  { name: 'Transport Management', slug: 'transport-management', icon: '🚌', order: 10, description: 'Routes, vehicles, and allocations' },
  { name: 'Placement Management', slug: 'placement-management', icon: '💼', order: 11, description: 'Placement drives and applications' },
  { name: 'CMS & Content', slug: 'cms-content', icon: '📝', order: 12, description: 'Pages, banners, and announcements' },
  { name: 'Reports & Analytics', slug: 'reports-analytics', icon: '📈', order: 13, description: 'System-wide reports and data export' },
  { name: 'Settings', slug: 'settings', icon: '⚙️', order: 14, description: 'System configuration and settings' },
  { name: 'AI Assistant', slug: 'ai-assistant', icon: '🤖', order: 15, description: 'AI chatbot and assistant features' },
];

// ═══════════════════════════════════════════════════════════
// 2. PERMISSIONS (module:action pattern)
// ═══════════════════════════════════════════════════════════
function buildPermissions(groupMap) {
  const modules = [
    { module: 'dashboard', group: 'dashboard', actions: ['read'], label: 'Dashboard' },
    { module: 'users', group: 'user-management', actions: ['create', 'read', 'update', 'delete', 'export', 'import'], label: 'Users' },
    { module: 'roles', group: 'role-management', actions: ['create', 'read', 'update', 'delete', 'manage'], label: 'Roles' },
    { module: 'students', group: 'student-management', actions: ['create', 'read', 'update', 'delete', 'export', 'import'], label: 'Students' },
    { module: 'parents', group: 'student-management', actions: ['create', 'read', 'update', 'delete'], label: 'Parents' },
    { module: 'faculty', group: 'faculty-management', actions: ['create', 'read', 'update', 'delete', 'export'], label: 'Faculty' },
    { module: 'attendance', group: 'academic-operations', actions: ['create', 'read', 'update', 'delete', 'export'], label: 'Attendance' },
    { module: 'fees', group: 'financial-operations', actions: ['create', 'read', 'update', 'delete', 'export', 'approve'], label: 'Fees' },
    { module: 'library', group: 'library-management', actions: ['create', 'read', 'update', 'delete', 'manage'], label: 'Library' },
    { module: 'hostel', group: 'hostel-management', actions: ['create', 'read', 'update', 'delete', 'manage'], label: 'Hostel' },
    { module: 'transport', group: 'transport-management', actions: ['create', 'read', 'update', 'delete', 'manage'], label: 'Transport' },
    { module: 'placement', group: 'placement-management', actions: ['create', 'read', 'update', 'delete', 'manage'], label: 'Placement' },
    { module: 'cms', group: 'cms-content', actions: ['create', 'read', 'update', 'delete'], label: 'CMS' },
    { module: 'reports', group: 'reports-analytics', actions: ['read', 'export'], label: 'Reports' },
    { module: 'settings', group: 'settings', actions: ['read', 'update', 'manage'], label: 'Settings' },
    { module: 'ai-assistant', group: 'ai-assistant', actions: ['read', 'create'], label: 'AI Assistant' },
  ];

  const actionLabels = {
    create: 'Create', read: 'View', update: 'Edit',
    delete: 'Delete', export: 'Export', import: 'Import',
    manage: 'Manage', approve: 'Approve',
  };

  const permissions = [];
  for (const mod of modules) {
    for (const action of mod.actions) {
      permissions.push({
        name: `${actionLabels[action]} ${mod.label}`,
        slug: `${mod.module}:${action}`,
        module: mod.module,
        action,
        group: groupMap[mod.group] || null,
        description: `${actionLabels[action]} ${mod.label.toLowerCase()} records`,
        isSystem: true,
      });
    }
  }
  return permissions;
}

// ═══════════════════════════════════════════════════════════
// 3. ROLES
// ═══════════════════════════════════════════════════════════
const roles = [
  { name: 'Super Admin', slug: 'super-admin', level: 0, color: '#EF4444', description: 'Full system access — no restrictions', isSystem: true },
  { name: 'Admin', slug: 'admin', level: 10, color: '#F59E0B', description: 'Administrative access across all modules', isSystem: true },
  { name: 'Faculty', slug: 'faculty', level: 30, color: '#3B82F6', description: 'Academic operations and student management', isSystem: true },
  { name: 'Librarian', slug: 'librarian', level: 40, color: '#8B5CF6', description: 'Library catalog and book issue management', isSystem: true },
  { name: 'Placement Officer', slug: 'placement-officer', level: 40, color: '#06B6D4', description: 'Placement drives and student placement', isSystem: true },
  { name: 'Hostel Warden', slug: 'hostel-warden', level: 40, color: '#10B981', description: 'Hostel rooms, allocations, and operations', isSystem: true },
  { name: 'Transport Manager', slug: 'transport-manager', level: 40, color: '#F97316', description: 'Transport routes, vehicles, and allocations', isSystem: true },
  { name: 'Student', slug: 'student', level: 80, color: '#6366F1', description: 'View own academic records and information', isSystem: true, isDefault: true },
  { name: 'Parent', slug: 'parent', level: 85, color: '#EC4899', description: 'View ward academic and fee information', isSystem: true },
];

// ═══════════════════════════════════════════════════════════
// 4. ROLE-PERMISSION MATRIX
// ═══════════════════════════════════════════════════════════
const rolePermissionMatrix = {
  // Super Admin: gets ALL permissions (handled dynamically)
  'super-admin': '*',

  // Admin: everything except role management delete & settings manage
  'admin': [
    'dashboard:read',
    'users:create', 'users:read', 'users:update', 'users:delete', 'users:export',
    'roles:read',
    'students:create', 'students:read', 'students:update', 'students:delete', 'students:export', 'students:import',
    'parents:create', 'parents:read', 'parents:update', 'parents:delete',
    'faculty:create', 'faculty:read', 'faculty:update', 'faculty:delete', 'faculty:export',
    'attendance:create', 'attendance:read', 'attendance:update', 'attendance:delete', 'attendance:export',
    'fees:create', 'fees:read', 'fees:update', 'fees:delete', 'fees:export', 'fees:approve',
    'library:create', 'library:read', 'library:update', 'library:delete', 'library:manage',
    'hostel:create', 'hostel:read', 'hostel:update', 'hostel:delete', 'hostel:manage',
    'transport:create', 'transport:read', 'transport:update', 'transport:delete', 'transport:manage',
    'placement:create', 'placement:read', 'placement:update', 'placement:delete', 'placement:manage',
    'cms:create', 'cms:read', 'cms:update', 'cms:delete',
    'reports:read', 'reports:export',
    'settings:read', 'settings:update',
    'ai-assistant:read', 'ai-assistant:create',
  ],

  // Faculty
  'faculty': [
    'dashboard:read',
    'students:read',
    'parents:read',
    'faculty:read',
    'attendance:create', 'attendance:read', 'attendance:update',
    'fees:read',
    'library:read',
    'placement:read',
    'reports:read',
    'ai-assistant:read', 'ai-assistant:create',
  ],

  // Librarian
  'librarian': [
    'dashboard:read',
    'students:read',
    'library:create', 'library:read', 'library:update', 'library:delete', 'library:manage',
    'reports:read',
  ],

  // Placement Officer
  'placement-officer': [
    'dashboard:read',
    'students:read',
    'faculty:read',
    'placement:create', 'placement:read', 'placement:update', 'placement:delete', 'placement:manage',
    'reports:read',
    'cms:create', 'cms:read',
  ],

  // Hostel Warden
  'hostel-warden': [
    'dashboard:read',
    'students:read',
    'hostel:create', 'hostel:read', 'hostel:update', 'hostel:delete', 'hostel:manage',
    'reports:read',
  ],

  // Transport Manager
  'transport-manager': [
    'dashboard:read',
    'students:read',
    'transport:create', 'transport:read', 'transport:update', 'transport:delete', 'transport:manage',
    'reports:read',
  ],

  // Student (read-only on own data)
  'student': [
    'dashboard:read',
    'attendance:read',
    'fees:read',
    'library:read',
    'placement:read',
    'hostel:read',
    'transport:read',
    'cms:read',
    'ai-assistant:read', 'ai-assistant:create',
  ],

  // Parent (read-only on ward data)
  'parent': [
    'dashboard:read',
    'attendance:read',
    'fees:read',
    'students:read',
    'cms:read',
  ],
};

// ═══════════════════════════════════════════════════════════
// SEED FUNCTIONS
// ═══════════════════════════════════════════════════════════

async function seedPermissionGroups() {
  console.log('\n📌 Seeding Permission Groups...');
  await PermissionGroup.deleteMany({}).setOptions({ includeDeleted: true });

  const groupMap = {};
  for (const g of permissionGroups) {
    const group = await PermissionGroup.create(g);
    groupMap[g.slug] = group._id;
    console.log(`   ✅ ${g.icon} ${g.name}`);
  }
  return groupMap;
}

async function seedPermissions(groupMap) {
  console.log('\n📌 Seeding Permissions...');
  await Permission.deleteMany({}).setOptions({ includeDeleted: true });

  const permsData = buildPermissions(groupMap);
  const permMap = {};

  for (const p of permsData) {
    const perm = await Permission.create(p);
    permMap[perm.slug] = perm._id;
  }
  console.log(`   ✅ Created ${permsData.length} permissions across ${Object.keys(groupMap).length} groups`);
  return permMap;
}

async function seedRoles() {
  console.log('\n📌 Seeding Roles...');
  await Role.deleteMany({}).setOptions({ includeDeleted: true });

  const roleMap = {};
  for (const r of roles) {
    const role = await Role.create(r);
    roleMap[r.slug] = role._id;
    console.log(`   ✅ ${r.name} (level: ${r.level})`);
  }
  return roleMap;
}

async function seedRolePermissions(roleMap, permMap) {
  console.log('\n📌 Seeding Role-Permission Mappings...');
  await RolePermission.deleteMany({}).setOptions({ includeDeleted: true });

  let totalMappings = 0;

  for (const [roleSlug, permSlugs] of Object.entries(rolePermissionMatrix)) {
    const roleId = roleMap[roleSlug];
    if (!roleId) continue;

    let slugsToAssign = [];
    if (permSlugs === '*') {
      // Super admin gets ALL permissions
      slugsToAssign = Object.keys(permMap);
    } else {
      slugsToAssign = permSlugs;
    }

    for (const slug of slugsToAssign) {
      const permId = permMap[slug];
      if (!permId) continue;

      await RolePermission.create({
        role: roleId,
        permission: permId,
        grantedAt: new Date(),
      });
      totalMappings++;
    }

    console.log(`   ✅ ${roleSlug}: ${slugsToAssign.length} permissions`);
  }

  console.log(`   📊 Total mappings: ${totalMappings}`);
}

async function seedUserRoles(roleMap) {
  console.log('\n📌 Assigning Roles to Existing Users...');
  await UserRole.deleteMany({}).setOptions({ includeDeleted: true });

  const users = await User.find({}).lean();
  let assigned = 0;

  for (const user of users) {
    const roleSlug = user.role;
    const roleId = roleMap[roleSlug];
    if (!roleId) {
      console.log(`   ⚠️  No role found for ${user.email} (${roleSlug})`);
      continue;
    }

    await UserRole.create({
      user: user._id,
      role: roleId,
      isPrimary: true,
      assignedAt: new Date(),
    });
    assigned++;
    console.log(`   ✅ ${user.email} → ${roleSlug}`);
  }

  console.log(`   📊 ${assigned} users assigned roles`);
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function seedRBAC() {
  const startTime = Date.now();

  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('  RBAC System — Database Seeder');
    console.log('═══════════════════════════════════════════════════');
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.\n');

    const groupMap = await seedPermissionGroups();
    const permMap = await seedPermissions(groupMap);
    const roleMap = await seedRoles();
    await seedRolePermissions(roleMap, permMap);
    await seedUserRoles(roleMap);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ RBAC seeding completed in ${elapsed}s`);
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`   Permission Groups: ${permissionGroups.length}`);
    console.log(`   Permissions:       ${Object.keys(permMap).length}`);
    console.log(`   Roles:             ${roles.length}`);
    console.log(`   Role-Permission mappings created`);
    console.log(`   User-Role assignments created`);
  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected.');
  }
}

seedRBAC();
