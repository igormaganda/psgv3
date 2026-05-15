import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('Admin#2026!', 12);
  const employeePassword = await bcrypt.hash('Employee#2026!', 12);

  // Calculate password expiry (6 months from now)
  const passwordExpiresAt = new Date();
  passwordExpiresAt.setMonth(passwordExpiresAt.getMonth() + 6);

  // Create admin users
  console.log('👤 Creating admin users...');
  const admin1 = await prisma.user.upsert({
    where: { email: 'admin@psg.com' },
    update: {},
    create: {
      email: 'admin@psg.com',
      passwordHash: adminPassword,
      role: 'admin',
      active: true,
      lastPasswordChange: new Date(),
      passwordExpiresAt,
      mustChangePassword: false,
      profile: {
        create: {
          employeeId: 'ADM-001',
          firstName: 'System',
          lastName: 'Administrator',
          preferredName: 'Admin',
          jobTitle: 'System Administrator',
          department: 'IT',
          employmentType: 'Full-Time',
          contractType: 'Permanent',
          hireDate: new Date('2024-01-01'),
          workLocation: 'Remote',
          payType: 'Salary',
          basePay: 75000,
        }
      }
    }
  });

  const admin2 = await prisma.user.upsert({
    where: { email: 'm.reynolds@psg.com' },
    update: {},
    create: {
      email: 'm.reynolds@psg.com',
      passwordHash: adminPassword,
      role: 'admin',
      active: true,
      lastPasswordChange: new Date(),
      passwordExpiresAt,
      mustChangePassword: false,
      profile: {
        create: {
          employeeId: 'ADM-002',
          firstName: 'Michael',
          lastName: 'Reynolds',
          preferredName: 'Mike',
          jobTitle: 'Operations Manager',
          department: 'Operations',
          employmentType: 'Full-Time',
          contractType: 'Permanent',
          hireDate: new Date('2024-02-15'),
          workLocation: 'NYC Headquarters',
          shiftType: 'Day',
          weeklyHours: 40,
          payType: 'Salary',
          basePay: 85000,
        }
      }
    }
  });

  // Create employee users
  console.log('👥 Creating employee users...');
  const employee1 = await prisma.user.upsert({
    where: { email: 'jason.walker@psg.local' },
    update: {},
    create: {
      email: 'jason.walker@psg.local',
      passwordHash: employeePassword,
      role: 'employee',
      active: true,
      lastPasswordChange: new Date(),
      passwordExpiresAt,
      mustChangePassword: false,
      profile: {
        create: {
          employeeId: 'EMP-1001',
          firstName: 'Jason',
          lastName: 'Walker',
          preferredName: 'Jay',
          dateOfBirth: new Date('1985-05-15'),
          nationality: 'US Citizen',
          personalEmail: 'jason.walker@gmail.com',
          phone: '+1 (555) 123-4567',
          workPhone: '+1 (555) 987-6543',
          addressLine1: '123 Main Street',
          city: 'Brooklyn',
          state: 'NY',
          postalCode: '11201',
          country: 'USA',
          emergencyContactName: 'Sarah Walker',
          emergencyContactRelation: 'Spouse',
          emergencyContactPhone: '+1 (555) 234-5678',
          emergencyContactEmail: 'sarah.walker@gmail.com',
          governmentIdType: 'State ID',
          governmentIdNumber: 'NY123456789',
          ssnLast4: '4321',
          workAuthorizationType: 'US Citizen',
          jobTitle: 'Security Officer',
          department: 'Field Operations',
          manager: 'Michael Reynolds',
          employmentType: 'Full-Time',
          contractType: 'Permanent',
          hireDate: new Date('2024-03-01'),
          probationEndDate: new Date('2024-09-01'),
          workLocation: 'Manhattan Branch',
          shiftType: 'Night',
          weeklyHours: 40,
          payType: 'Hourly',
          basePay: 25,
          uniformSize: 'L',
          equipmentIssued: 'Badge, Flashlight, Radio, Handcuffs',
          licenses: 'NYS Security License #12345678',
          certifications: 'CPR Certified, First Aid',
          trainingRequired: 'Annual Firearms Training',
          performanceRating: 4,
        }
      }
    }
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 's.martinez@psg.local' },
    update: {},
    create: {
      email: 's.martinez@psg.local',
      passwordHash: employeePassword,
      role: 'employee',
      active: true,
      lastPasswordChange: new Date(),
      passwordExpiresAt,
      mustChangePassword: false,
      profile: {
        create: {
          employeeId: 'EMP-1002',
          firstName: 'Sofia',
          lastName: 'Martinez',
          preferredName: 'Sofi',
          dateOfBirth: new Date('1990-08-22'),
          nationality: 'US Citizen',
          personalEmail: 'sofia.martinez@gmail.com',
          phone: '+1 (555) 345-6789',
          addressLine1: '456 Oak Avenue',
          city: 'Queens',
          state: 'NY',
          postalCode: '11375',
          country: 'USA',
          emergencyContactName: 'Carlos Martinez',
          emergencyContactRelation: 'Brother',
          emergencyContactPhone: '+1 (555) 456-7890',
          governmentIdType: 'State ID',
          governmentIdNumber: 'NY987654321',
          ssnLast4: '8765',
          workAuthorizationType: 'US Citizen',
          jobTitle: 'Security Supervisor',
          department: 'Field Operations',
          manager: 'Michael Reynolds',
          employmentType: 'Full-Time',
          contractType: 'Permanent',
          hireDate: new Date('2023-06-15'),
          workLocation: 'Brooklyn Branch',
          shiftType: 'Day',
          weeklyHours: 40,
          payType: 'Salary',
          basePay: 55000,
          uniformSize: 'M',
          equipmentIssued: 'Badge, Flashlight, Radio, Handcuffs, Vehicle',
          licenses: 'NYS Security License #87654321',
          certifications: 'CPR Certified, First Aid, Defensive Driving',
          trainingRequired: 'Annual Firearms Training',
          performanceRating: 5,
        }
      }
    }
  });

  // Create sample documents
  console.log('📄 Creating sample documents...');
  const doc1 = await prisma.document.create({
    data: {
      title: 'Employee Handbook 2024',
      category: 'Company Policy',
      description: 'Complete employee handbook with company policies and procedures',
      filePath: '/uploads/admin/employee-handbook-2024.pdf',
      fileName: 'employee-handbook-2024.pdf',
      fileSize: 2048576,
      mimeType: 'application/pdf',
      visibility: 'admin',
      uploaderId: admin1.id,
    }
  });

  const doc2 = await prisma.document.create({
    data: {
      title: 'Safety Protocols',
      category: 'Safety',
      description: 'Safety procedures and emergency protocols',
      filePath: '/uploads/admin/safety-protocols.pdf',
      fileName: 'safety-protocols.pdf',
      fileSize: 1048576,
      mimeType: 'application/pdf',
      visibility: 'admin',
      uploaderId: admin1.id,
    }
  });

  // Create sample audit logs
  console.log('📋 Creating sample audit logs...');
  await prisma.auditLog.create({
    data: {
      userId: admin1.id,
      action: 'user.create',
      entityType: 'user',
      entityId: employee1.id,
      details: 'Created employee account for Jason Walker',
      ipAddress: '127.0.0.1',
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: admin1.id,
      action: 'document.upload',
      entityType: 'document',
      entityId: doc1.id,
      details: 'Uploaded Employee Handbook 2024',
      ipAddress: '127.0.0.1',
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: employee1.id,
      action: 'login',
      details: 'Jason Walker logged in',
      ipAddress: '192.168.1.100',
    }
  });

  console.log('✅ Database seed completed successfully!');
  console.log('');
  console.log('📧 Test Accounts:');
  console.log('');
  console.log('Admin Accounts:');
  console.log('  Email: admin@psg.com');
  console.log('  Password: Admin#2026!');
  console.log('');
  console.log('  Email: m.reynolds@psg.com');
  console.log('  Password: Admin#2026!');
  console.log('');
  console.log('Employee Accounts:');
  console.log('  Email: jason.walker@psg.local');
  console.log('  Password: Employee#2026!');
  console.log('');
  console.log('  Email: s.martinez@psg.local');
  console.log('  Password: Employee#2026!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });