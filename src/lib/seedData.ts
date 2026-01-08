import {
  accountHoldersService,
  coursesService,
  enrollmentsService,
  courseChargesService,
  transactionsService,
  topUpRulesService,
  topUpSchedulesService,
} from "./firestoreServices";

// Helper to generate random date
const randomDate = (start: Date, end: Date) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Helper to format date to YYYY-MM-DD
const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0];
};

// Helper to delete all data from a collection
const clearCollection = async (
  service: any,
  collectionName: string
): Promise<number> => {
  try {
    const items = await service.getAll();
    let deleted = 0;
    for (const item of items) {
      await service.delete(item.id);
      deleted++;
    }
    console.log(`  ✅ Deleted ${deleted} items from ${collectionName}`);
    return deleted;
  } catch (error) {
    console.error(`  ❌ Error clearing ${collectionName}:`, error);
    return 0;
  }
};

export const seedDatabase = async () => {
  console.log("🌱 Starting database seeding...");

  try {
    // Step 1: Clear existing data
    console.log("🗑️  Clearing existing data...");
    await clearCollection(topUpSchedulesService, "top_up_schedules");
    await clearCollection(topUpRulesService, "top_up_rules");
    await clearCollection(transactionsService, "transactions");
    await clearCollection(courseChargesService, "course_charges");
    await clearCollection(enrollmentsService, "enrollments");
    await clearCollection(coursesService, "courses");
    await clearCollection(accountHoldersService, "account_holders");
    console.log("✅ All existing data cleared\n");

    // Step 2: Seed Account Holders
    console.log("Creating account holders...");
    const accountHolders = [
      {
        nric: "S9001234A",
        name: "Tan Wei Ming",
        dateOfBirth: "1998-03-15",
        email: "weiming.tan@email.com",
        phone: "+65 9123 4567",
        residentialAddress: "Blk 123 Ang Mo Kio Ave 3 #05-678",
        mailingAddress: "Blk 123 Ang Mo Kio Ave 3 #05-678",
        balance: 5000,
        status: "active" as const,
        inSchool: "in_school" as const,
        educationLevel: "tertiary" as const,
        continuingLearning: "active" as const,
      },
      {
        nric: "S9205678B",
        name: "Lee Xin Yi",
        dateOfBirth: "2000-07-22",
        email: "xinyi.lee@email.com",
        phone: "+65 8234 5678",
        residentialAddress: "Blk 456 Bedok North St 1 #12-345",
        mailingAddress: "Blk 456 Bedok North St 1 #12-345",
        balance: 3500,
        status: "active" as const,
        inSchool: "in_school" as const,
        educationLevel: "post_secondary" as const,
        continuingLearning: "active" as const,
      },
      {
        nric: "S8809012C",
        name: "Kumar Rajan",
        dateOfBirth: "1996-11-08",
        email: "kumar.rajan@email.com",
        phone: "+65 9345 6789",
        residentialAddress: "Blk 789 Tampines St 81 #08-234",
        mailingAddress: "Blk 789 Tampines St 81 #08-234",
        balance: 8000,
        status: "active" as const,
        inSchool: "not_in_school" as const,
        educationLevel: "tertiary" as const,
        continuingLearning: "active" as const,
      },
      {
        nric: "S9503456D",
        name: "Siti Nurhaliza",
        dateOfBirth: "1999-05-18",
        email: "siti.nurhaliza@email.com",
        phone: "+65 8456 7890",
        residentialAddress: "Blk 321 Jurong West St 65 #04-567",
        mailingAddress: "Blk 321 Jurong West St 65 #04-567",
        balance: 2000,
        status: "active" as const,
        inSchool: "in_school" as const,
        educationLevel: "tertiary" as const,
        continuingLearning: "active" as const,
      },
      {
        nric: "S9107890E",
        name: "Chen Wei Lun",
        dateOfBirth: "1997-12-30",
        email: "weilun.chen@email.com",
        phone: "+65 9567 8901",
        residentialAddress: "Blk 654 Hougang Ave 8 #15-890",
        mailingAddress: "Blk 654 Hougang Ave 8 #15-890",
        balance: 6500,
        status: "active" as const,
        inSchool: "not_in_school" as const,
        educationLevel: "postgraduate" as const,
        continuingLearning: "active" as const,
      },
    ];

    const accountIds: string[] = [];
    for (const account of accountHolders) {
      const id = await accountHoldersService.create(account);
      accountIds.push(id);
    }
    console.log(`✅ Created ${accountIds.length} account holders`);

    // Seed Courses
    console.log("Creating courses...");
    const courses = [
      {
        name: "Advanced Diploma in Information Technology",
        provider: "Ngee Ann Polytechnic",
        billingCycle: "monthly" as const,
        fee: 450,
        description:
          "Comprehensive IT program covering software development, networking, and cybersecurity",
        status: "active" as const,
        courseRunStart: "2025-04-01",
        courseRunEnd: "2027-03-31",
        intakeSize: 120,
        mainLocation: "Ngee Ann Polytechnic Campus",
        modeOfTraining: "Full-time",
        registerBy: "2025-03-15",
      },
      {
        name: "Diploma in Business Administration",
        provider: "Singapore Polytechnic",
        billingCycle: "monthly" as const,
        fee: 380,
        description: "Develop business management and entrepreneurship skills",
        status: "active" as const,
        courseRunStart: "2025-05-01",
        courseRunEnd: "2027-04-30",
        intakeSize: 150,
        mainLocation: "Singapore Polytechnic Campus",
        modeOfTraining: "Full-time",
        registerBy: "2025-04-15",
      },
      {
        name: "Professional Certificate in Data Analytics",
        provider: "SkillsFuture Singapore",
        billingCycle: "quarterly" as const,
        fee: 1200,
        description:
          "Learn data analysis, visualization, and machine learning fundamentals",
        status: "active" as const,
        courseRunStart: "2025-06-01",
        courseRunEnd: "2025-12-31",
        intakeSize: 80,
        mainLocation: "Online",
        modeOfTraining: "Part-time Online",
        registerBy: "2025-05-20",
      },
      {
        name: "Bachelor of Engineering (Computer Engineering)",
        provider: "National University of Singapore",
        billingCycle: "monthly" as const,
        fee: 650,
        description:
          "Comprehensive engineering program with focus on hardware and software systems",
        status: "active" as const,
        courseRunStart: "2025-08-01",
        courseRunEnd: "2029-05-31",
        intakeSize: 200,
        mainLocation: "NUS Engineering Campus",
        modeOfTraining: "Full-time",
        registerBy: "2025-07-01",
      },
    ];

    const courseIds: string[] = [];
    for (const course of courses) {
      const id = await coursesService.create(course);
      courseIds.push(id);
    }
    console.log(`✅ Created ${courseIds.length} courses`);

    // Seed Enrollments
    console.log("Creating enrollments...");
    const enrollments = [
      {
        accountId: accountIds[0],
        courseId: courseIds[0],
        enrollmentDate: "2025-04-01",
        status: "active" as const,
      },
      {
        accountId: accountIds[1],
        courseId: courseIds[1],
        enrollmentDate: "2025-05-01",
        status: "active" as const,
      },
      {
        accountId: accountIds[2],
        courseId: courseIds[2],
        enrollmentDate: "2025-06-01",
        status: "active" as const,
      },
      {
        accountId: accountIds[3],
        courseId: courseIds[3],
        enrollmentDate: "2025-08-01",
        status: "active" as const,
      },
      {
        accountId: accountIds[4],
        courseId: courseIds[0],
        enrollmentDate: "2025-04-01",
        status: "active" as const,
      },
    ];

    let enrollmentCount = 0;
    for (const enrollment of enrollments) {
      await enrollmentsService.create(enrollment);
      enrollmentCount++;
    }
    console.log(`✅ Created ${enrollmentCount} enrollments`);

    // Seed Course Charges
    console.log("Creating course charges...");
    const today = new Date();
    const charges = [
      {
        accountId: accountIds[0],
        courseId: courseIds[0],
        courseName: courses[0].name,
        amount: 450,
        amountPaid: 450,
        dueDate: formatDate(
          new Date(today.getFullYear(), today.getMonth() - 2, 5)
        ),
        status: "paid" as const,
        paidDate: formatDate(
          new Date(today.getFullYear(), today.getMonth() - 2, 3)
        ),
        paymentMethod: "education_account",
      },
      {
        accountId: accountIds[0],
        courseId: courseIds[0],
        courseName: courses[0].name,
        amount: 450,
        amountPaid: 450,
        dueDate: formatDate(
          new Date(today.getFullYear(), today.getMonth() - 1, 5)
        ),
        status: "paid" as const,
        paidDate: formatDate(
          new Date(today.getFullYear(), today.getMonth() - 1, 4)
        ),
        paymentMethod: "education_account",
      },
      {
        accountId: accountIds[0],
        courseId: courseIds[0],
        courseName: courses[0].name,
        amount: 450,
        amountPaid: 0,
        dueDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 5)),
        status: "pending" as const,
      },
      {
        accountId: accountIds[1],
        courseId: courseIds[1],
        courseName: courses[1].name,
        amount: 380,
        amountPaid: 380,
        dueDate: formatDate(
          new Date(today.getFullYear(), today.getMonth() - 1, 10)
        ),
        status: "paid" as const,
        paidDate: formatDate(
          new Date(today.getFullYear(), today.getMonth() - 1, 8)
        ),
        paymentMethod: "online",
      },
      {
        accountId: accountIds[1],
        courseId: courseIds[1],
        courseName: courses[1].name,
        amount: 380,
        amountPaid: 0,
        dueDate: formatDate(
          new Date(today.getFullYear(), today.getMonth(), 10)
        ),
        status: "pending" as const,
      },
      {
        accountId: accountIds[3],
        courseId: courseIds[3],
        courseName: courses[3].name,
        amount: 650,
        amountPaid: 0,
        dueDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
        status: "pending" as const,
      },
      {
        accountId: accountIds[4],
        courseId: courseIds[0],
        courseName: courses[0].name,
        amount: 450,
        amountPaid: 0,
        dueDate: formatDate(
          new Date(today.getFullYear(), today.getMonth() - 1, 5)
        ),
        status: "overdue" as const,
      },
    ];

    let chargeCount = 0;
    for (const charge of charges) {
      await courseChargesService.create(charge);
      chargeCount++;
    }
    console.log(`✅ Created ${chargeCount} course charges`);

    // Seed Transactions
    console.log("Creating transactions...");
    const transactions = [
      {
        accountId: accountIds[0],
        type: "top_up" as const,
        amount: 3000,
        description: "Initial account funding",
        status: "completed" as const,
        reference: "INIT-001",
      },
      {
        accountId: accountIds[0],
        type: "top_up" as const,
        amount: 2000,
        description: "Government subsidy - Tertiary education",
        status: "completed" as const,
        reference: "GOV-2025-001",
      },
      {
        accountId: accountIds[0],
        type: "course_fee" as const,
        amount: -450,
        description: `Course fee payment for ${courses[0].name}`,
        status: "completed" as const,
      },
      {
        accountId: accountIds[1],
        type: "top_up" as const,
        amount: 3500,
        description: "Initial account funding",
        status: "completed" as const,
        reference: "INIT-002",
      },
      {
        accountId: accountIds[2],
        type: "top_up" as const,
        amount: 5000,
        description: "Initial account funding",
        status: "completed" as const,
        reference: "INIT-003",
      },
      {
        accountId: accountIds[2],
        type: "top_up" as const,
        amount: 3000,
        description: "Government subsidy - Continuing education",
        status: "completed" as const,
        reference: "GOV-2025-002",
      },
      {
        accountId: accountIds[3],
        type: "top_up" as const,
        amount: 2000,
        description: "Initial account funding",
        status: "completed" as const,
        reference: "INIT-004",
      },
    ];

    let transactionCount = 0;
    for (const transaction of transactions) {
      await transactionsService.create(transaction);
      transactionCount++;
    }
    console.log(`✅ Created ${transactionCount} transactions`);

    // Seed Top-Up Rules
    console.log("Creating top-up rules...");
    const rules = [
      {
        name: "Tertiary Education Students - Annual Top-up",
        minAge: 18,
        maxAge: 25,
        minBalance: 0,
        maxBalance: 5000,
        inSchool: "in_school" as const,
        educationLevel: "tertiary" as const,
        amount: 2000,
        status: "active" as const,
        validFrom: "2025-01-01",
        validTo: "2025-12-31",
      },
      {
        name: "Post-Secondary Students - Quarterly Support",
        minAge: 16,
        maxAge: 20,
        inSchool: "in_school" as const,
        educationLevel: "post_secondary" as const,
        amount: 500,
        status: "active" as const,
        validFrom: "2025-01-01",
        validTo: "2025-12-31",
      },
      {
        name: "Continuing Learners - Skill Upgrade Grant",
        minAge: 25,
        maxAge: 30,
        continuingLearning: "active" as const,
        amount: 1500,
        status: "active" as const,
        validFrom: "2025-01-01",
        validTo: "2025-12-31",
      },
      {
        name: "Low Balance Support - Emergency Fund",
        maxBalance: 1000,
        inSchool: "in_school" as const,
        amount: 1000,
        status: "active" as const,
        validFrom: "2025-01-01",
        validTo: "2025-12-31",
      },
    ];

    let ruleCount = 0;
    for (const rule of rules) {
      await topUpRulesService.create(rule);
      ruleCount++;
    }
    console.log(`✅ Created ${ruleCount} top-up rules`);

    console.log("✨ Database seeding completed successfully!");
    return {
      accountHolders: accountIds.length,
      courses: courseIds.length,
      enrollments: enrollmentCount,
      charges: chargeCount,
      transactions: transactionCount,
      rules: ruleCount,
    };
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};
