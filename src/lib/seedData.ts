import {
  accountHoldersService,
  coursesService,
  enrollmentsService,
  courseChargesService,
  transactionsService,
  topUpRulesService,
  topUpSchedulesService,
  nricRegistryService,
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
    // Step 1: Clear existing data (including rules and execution history)
    console.log("🗑️  Clearing existing data...");
    await clearCollection(topUpSchedulesService, "top_up_schedules"); // Execution history
    await clearCollection(topUpRulesService, "top_up_rules"); // Top-up rules
    await clearCollection(transactionsService, "transactions");
    await clearCollection(courseChargesService, "course_charges");
    await clearCollection(enrollmentsService, "enrollments");
    await clearCollection(coursesService, "courses");
    await clearCollection(accountHoldersService, "account_holders");
    await clearCollection(nricRegistryService, "nric_registry"); // NRIC Registry
    console.log(
      "✅ All existing data cleared (including rules and execution history)\n"
    );

    // Step 1.5: Seed NRIC Registry (must be first for auto-fill to work)
    console.log("Creating NRIC registry...");
    const nricRecords = [
      // Match with account holders that will be created
      {
        nric: "S9001234A",
        fullName: "Tan Wei Ming",
        dateOfBirth: "1998-03-15",
      },
      {
        nric: "S9205678B",
        fullName: "Lee Xin Yi",
        dateOfBirth: "2000-07-22",
      },
      {
        nric: "S8809012C",
        fullName: "Kumar Rajan",
        dateOfBirth: "1996-11-08",
      },
      {
        nric: "S9503456D",
        fullName: "Siti Nurhaliza",
        dateOfBirth: "1999-05-18",
      },
      {
        nric: "S8712345A",
        fullName: "Chong Wei Lun",
        dateOfBirth: "1997-12-03",
      },
      // Additional registry entries for testing
      {
        nric: "S9107890E",
        fullName: "Wong Mei Ling",
        dateOfBirth: "1991-03-15",
      },
      {
        nric: "S9601234F",
        fullName: "Tan Ah Kow",
        dateOfBirth: "1996-01-18",
      },
      {
        nric: "S9408765G",
        fullName: "Raj Kumar Singh",
        dateOfBirth: "1994-08-25",
      },
      {
        nric: "S9009876H",
        fullName: "Chen Wei Jie",
        dateOfBirth: "1990-12-30",
      },
      {
        nric: "S9312345J",
        fullName: "Fatimah Binte Ali",
        dateOfBirth: "1993-02-14",
      },
      {
        nric: "S8907654K",
        fullName: "David Tan Kim Seng",
        dateOfBirth: "1989-06-08",
      },
      {
        nric: "S9701234L",
        fullName: "Priya Devi",
        dateOfBirth: "1997-04-22",
      },
      {
        nric: "S9210987M",
        fullName: "Muhammad Hafiz",
        dateOfBirth: "1992-10-05",
      },
      {
        nric: "S8811223N",
        fullName: "Lim Siew Hoon",
        dateOfBirth: "1988-03-17",
      },
      {
        nric: "S9504567P",
        fullName: "Arjun Krishnan",
        dateOfBirth: "1995-11-28",
      },
      {
        nric: "S9103456Q",
        fullName: "Emily Ng Su Lin",
        dateOfBirth: "1991-07-09",
      },
    ];

    let nricCount = 0;
    for (const record of nricRecords) {
      await nricRegistryService.create(record);
      nricCount++;
    }
    console.log(`✅ Created ${nricCount} NRIC registry records\n`);

    // Step 2: Seed Account Holders
    console.log("Creating account holders...");
    const accountHolders = [
      {
        nric: "S9001234A",
        name: "Dave Dao",
        dateOfBirth: "1998-03-15",
        email: "dave.dao@email.com",
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
        name: "Eric Nguyen",
        dateOfBirth: "2000-07-22",
        email: "eric.nguyen@email.com",
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
        name: "Tim Nguyen",
        dateOfBirth: "1996-11-08",
        email: "tim.nguyen@email.com",
        phone: "+65 9345 6789",
        residentialAddress: "Blk 789 Tampines St 81 #08-234",
        mailingAddress: "Blk 789 Tampines St 81 #08-234",
        balance: 8000,
        status: "active" as const,
        inSchool: "not_in_school" as const, // Only not_in_school account - no courses
        educationLevel: "tertiary" as const,
        continuingLearning: "inactive" as const, // Not currently learning
      },
      {
        nric: "S9503456D",
        name: "Tracy Tran",
        dateOfBirth: "1999-05-18",
        email: "tracy.tran@email.com",
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
        name: "Kyan Le",
        dateOfBirth: "1997-12-30",
        email: "kyan.le@email.com",
        phone: "+65 9567 8901",
        residentialAddress: "Blk 654 Hougang Ave 8 #15-890",
        mailingAddress: "Blk 654 Hougang Ave 8 #15-890",
        balance: 6500,
        status: "active" as const,
        inSchool: "in_school" as const,
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
      {
        name: "Certificate in Digital Marketing",
        provider: "Temasek Polytechnic",
        billingCycle: "monthly" as const,
        fee: 320,
        description: "Master social media marketing, SEO, and content strategy",
        status: "active" as const,
        courseRunStart: "2025-03-01",
        courseRunEnd: "2025-09-30",
        intakeSize: 100,
        mainLocation: "Temasek Polytechnic Campus",
        modeOfTraining: "Part-time",
        registerBy: "2025-02-15",
      },
      {
        name: "Diploma in Cybersecurity",
        provider: "Nanyang Polytechnic",
        billingCycle: "monthly" as const,
        fee: 480,
        description:
          "Learn network security, ethical hacking, and security operations",
        status: "active" as const,
        courseRunStart: "2025-04-15",
        courseRunEnd: "2027-04-14",
        intakeSize: 90,
        mainLocation: "Nanyang Polytechnic Campus",
        modeOfTraining: "Full-time",
        registerBy: "2025-03-30",
      },
      {
        name: "Advanced Certificate in AI & Machine Learning",
        provider: "SkillsFuture Singapore",
        billingCycle: "quarterly" as const,
        fee: 1500,
        description:
          "Deep dive into artificial intelligence, neural networks, and ML algorithms",
        status: "active" as const,
        courseRunStart: "2025-07-01",
        courseRunEnd: "2026-01-31",
        intakeSize: 60,
        mainLocation: "Online",
        modeOfTraining: "Part-time Online",
        registerBy: "2025-06-15",
      },
      {
        name: "Diploma in Financial Services",
        provider: "Republic Polytechnic",
        billingCycle: "monthly" as const,
        fee: 420,
        description:
          "Comprehensive program in banking, investments, and financial planning",
        status: "active" as const,
        courseRunStart: "2025-05-15",
        courseRunEnd: "2027-05-14",
        intakeSize: 110,
        mainLocation: "Republic Polytechnic Campus",
        modeOfTraining: "Full-time",
        registerBy: "2025-04-30",
      },
      {
        name: "Short Course in Web Development",
        provider: "SkillsFuture Singapore",
        billingCycle: "monthly" as const,
        fee: 300,
        description:
          "6-month intensive web development bootcamp covering HTML, CSS, JavaScript, and React",
        status: "active" as const,
        courseRunStart: "2025-01-01",
        courseRunEnd: "2025-12-31", // Course ended in 2025
        intakeSize: 50,
        mainLocation: "Online",
        modeOfTraining: "Part-time Online",
        registerBy: "2024-12-15",
      },
    ];

    const courseIds: string[] = [];
    for (const course of courses) {
      const id = await coursesService.create(course);
      courseIds.push(id);
    }
    console.log(`✅ Created ${courseIds.length} courses`);

    // Seed Enrollments (each in_school student has 2-3 courses)
    console.log("Creating enrollments...");
    const enrollments = [
      // Dave Dao - 3 courses (IT focus)
      {
        accountId: accountIds[0], // Dave Dao - in_school
        courseId: courseIds[0], // Advanced Diploma in IT
        enrollmentDate: "2025-04-01",
        status: "active" as const,
      },
      {
        accountId: accountIds[0],
        courseId: courseIds[5], // Diploma in Cybersecurity
        enrollmentDate: "2025-04-15",
        status: "active" as const,
      },
      {
        accountId: accountIds[0],
        courseId: courseIds[6], // Advanced Certificate in AI & ML
        enrollmentDate: "2025-07-01",
        status: "active" as const,
      },

      // Eric Nguyen - 2 courses (Business focus)
      {
        accountId: accountIds[1], // Eric Nguyen - in_school
        courseId: courseIds[1], // Diploma in Business Administration
        enrollmentDate: "2025-05-01",
        status: "active" as const,
      },
      {
        accountId: accountIds[1],
        courseId: courseIds[4], // Certificate in Digital Marketing
        enrollmentDate: "2025-03-01",
        status: "active" as const,
      },

      // Tim Nguyen (accountIds[2]) - NOT enrolled (not_in_school, no courses)

      // Tracy Tran - 3 courses (demonstrating all payment statuses)
      {
        accountId: accountIds[3], // Tracy Tran - in_school
        courseId: courseIds[3], // Bachelor of Engineering (ongoing, has unpaid)
        enrollmentDate: "2025-08-01",
        status: "active" as const,
      },
      {
        accountId: accountIds[3],
        courseId: courseIds[0], // Advanced Diploma in IT (ongoing, all paid)
        enrollmentDate: "2025-04-01",
        status: "active" as const,
      },
      {
        accountId: accountIds[3],
        courseId: courseIds[8], // Short Course in Web Development (ended 2025, all paid)
        enrollmentDate: "2025-01-01",
        status: "completed" as const,
      },

      // Kyan Le - 2 courses (Finance & Tech)
      {
        accountId: accountIds[4], // Kyan Le - in_school
        courseId: courseIds[7], // Diploma in Financial Services
        enrollmentDate: "2025-05-15",
        status: "active" as const,
      },
      {
        accountId: accountIds[4],
        courseId: courseIds[2], // Professional Certificate in Data Analytics
        enrollmentDate: "2025-06-01",
        status: "active" as const,
      },
    ];

    let enrollmentCount = 0;
    for (const enrollment of enrollments) {
      await enrollmentsService.create(enrollment);
      enrollmentCount++;
    }
    console.log(`✅ Created ${enrollmentCount} enrollments`);

    // Seed Course Charges (reflecting multiple courses per student)
    console.log("Creating course charges...");
    const today = new Date();
    const charges = [
      // Dave Dao - charges for 3 courses
      {
        accountId: accountIds[0],
        courseId: courseIds[0], // Advanced Diploma in IT
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
        paymentMethod: "account_balance",
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
        accountId: accountIds[0],
        courseId: courseIds[5], // Diploma in Cybersecurity
        courseName: courses[5].name,
        amount: 480,
        amountPaid: 480,
        dueDate: formatDate(
          new Date(today.getFullYear(), today.getMonth() - 1, 15)
        ),
        status: "paid" as const,
        paidDate: formatDate(
          new Date(today.getFullYear(), today.getMonth() - 1, 14)
        ),
        paymentMethod: "credit_card",
      },

      // Eric Nguyen - charges for 2 courses
      {
        accountId: accountIds[1],
        courseId: courseIds[1], // Diploma in Business Administration
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
        paymentMethod: "bank_transfer",
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
        accountId: accountIds[1],
        courseId: courseIds[4], // Certificate in Digital Marketing
        courseName: courses[4].name,
        amount: 320,
        amountPaid: 0,
        dueDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
        status: "pending" as const,
      },

      // Tracy Tran - charges for 3 courses (demonstrating all 3 payment statuses)
      // Course 1: Bachelor of Engineering (ongoing) - has UNPAID charge → OUTSTANDING
      {
        accountId: accountIds[3],
        courseId: courseIds[3], // Bachelor of Engineering (ongoing until 2029)
        courseName: courses[3].name,
        amount: 650,
        amountPaid: 0,
        dueDate: formatDate(
          new Date(today.getFullYear(), today.getMonth() - 1, 1)
        ),
        status: "outstanding" as const, // Unpaid and overdue → Outstanding
      },

      // Course 2: Advanced Diploma in IT (ongoing) - all PAID → SCHEDULED (waiting for next period)
      {
        accountId: accountIds[3],
        courseId: courseIds[0], // Advanced Diploma in IT (ongoing until 2027)
        courseName: courses[0].name,
        amount: 450,
        amountPaid: 450,
        dueDate: formatDate(
          new Date(today.getFullYear(), today.getMonth() - 2, 5)
        ),
        status: "paid" as const,
        paidDate: formatDate(
          new Date(today.getFullYear(), today.getMonth() - 2, 4)
        ),
        paymentMethod: "account_balance",
      },
      {
        accountId: accountIds[3],
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
        paymentMethod: "credit_card",
      },

      // Course 3: Short Course in Web Development (ENDED 2025) - all PAID → FULLY PAID
      {
        accountId: accountIds[3],
        courseId: courseIds[8], // Web Development (ended Dec 2025)
        courseName: courses[8].name,
        amount: 300,
        amountPaid: 300,
        dueDate: formatDate(new Date(2025, 10, 1)), // Nov 2025
        status: "paid" as const,
        paidDate: formatDate(new Date(2025, 9, 30)),
        paymentMethod: "account_balance",
      },
      {
        accountId: accountIds[3],
        courseId: courseIds[8],
        courseName: courses[8].name,
        amount: 300,
        amountPaid: 300,
        dueDate: formatDate(new Date(2025, 11, 1)), // Dec 2025
        status: "paid" as const,
        paidDate: formatDate(new Date(2025, 10, 28)),
        paymentMethod: "credit_card",
      },
      // Kyan Le - charges for 2 courses
      {
        accountId: accountIds[4],
        courseId: courseIds[7], // Diploma in Financial Services
        courseName: courses[7].name,
        amount: 420,
        amountPaid: 0,
        dueDate: formatDate(
          new Date(today.getFullYear(), today.getMonth() - 1, 15)
        ),
        status: "outstanding" as const,
      },
      {
        accountId: accountIds[4],
        courseId: courseIds[2], // Professional Certificate in Data Analytics (quarterly)
        courseName: courses[2].name,
        amount: 1200,
        amountPaid: 1200,
        dueDate: formatDate(
          new Date(today.getFullYear(), today.getMonth() - 2, 1)
        ),
        status: "paid" as const,
        paidDate: formatDate(
          new Date(today.getFullYear(), today.getMonth() - 2, 28)
        ),
        paymentMethod: "account_balance",
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
      // Tim Nguyen (accountIds[2]) - not_in_school, no courses, but has transaction history
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
        description: "Government subsidy - Past education support",
        status: "completed" as const,
        reference: "GOV-2024-002",
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

    const ruleIds: string[] = [];
    let ruleCount = 0;
    for (const rule of rules) {
      const id = await topUpRulesService.create(rule);
      ruleIds.push(id);
      ruleCount++;
    }
    console.log(`✅ Created ${ruleCount} top-up rules`);

    // Seed Top-Up Schedules (Execution History)
    console.log("Creating top-up schedules and execution history...");

    // Get rule names and account names for display
    const ruleNames = rules.map((r) => r.name);
    const accountNames = accountHolders.map((a) => a.name);

    const schedules = [
      // Completed batch top-ups (rule-based, applies to multiple accounts)
      {
        type: "batch" as const,
        ruleId: ruleIds[0],
        ruleName: ruleNames[0], // "Tertiary Education Students"
        amount: 2000,
        scheduledDate: "2025-01-15",
        executedDate: "2025-01-15",
        status: "completed" as const,
        eligibleCount: 3, // Number of accounts that matched this rule
        processedCount: 3, // Successfully processed
        remarks: "Monthly batch top-up for tertiary students",
      },
      {
        type: "batch" as const,
        ruleId: ruleIds[1],
        ruleName: ruleNames[1], // "Post-Secondary Students"
        amount: 500,
        scheduledDate: "2025-02-01",
        executedDate: "2025-02-01",
        status: "completed" as const,
        eligibleCount: 2,
        processedCount: 2,
        remarks: "Quarterly support for post-secondary students",
      },
      {
        type: "batch" as const,
        ruleId: ruleIds[2],
        ruleName: ruleNames[2], // "Continuing Learners"
        amount: 1500,
        scheduledDate: "2025-03-01",
        executedDate: "2025-03-01",
        status: "completed" as const,
        eligibleCount: 2,
        processedCount: 2,
        remarks: "Skill upgrade grant for continuing learners",
      },
      // Individual top-ups (specific account, one-time top-up)
      {
        type: "individual" as const,
        accountId: accountIds[0],
        accountName: accountNames[0], // Student name
        amount: 1000,
        scheduledDate: "2025-04-10",
        executedDate: "2025-04-10",
        status: "completed" as const,
      },
      {
        type: "individual" as const,
        accountId: accountIds[3],
        accountName: accountNames[3], // Student name
        amount: 500,
        scheduledDate: "2025-05-15",
        executedDate: "2025-05-15",
        status: "completed" as const,
      },
      // Scheduled batch top-ups (upcoming)
      {
        type: "batch" as const,
        ruleId: ruleIds[0],
        ruleName: ruleNames[0], // "Tertiary Education Students"
        amount: 2000,
        scheduledDate: "2026-02-01",
        status: "scheduled" as const,
        eligibleCount: 4, // Will be calculated when executed
        remarks: "Scheduled batch top-up for February 2026",
      },
      {
        type: "batch" as const,
        ruleId: ruleIds[3],
        ruleName: ruleNames[3], // "Low Balance Support"
        amount: 1000,
        scheduledDate: "2026-01-20",
        status: "scheduled" as const,
        eligibleCount: 3,
        remarks: "Emergency fund distribution",
      },
      // Scheduled individual top-up
      {
        type: "individual" as const,
        accountId: accountIds[1],
        accountName: accountNames[1], // Student name
        amount: 800,
        scheduledDate: "2026-01-25",
        status: "scheduled" as const,
      },
      // Canceled batch - No accounts affected since it was canceled before execution
      {
        type: "batch" as const,
        ruleId: ruleIds[1],
        ruleName: ruleNames[1],
        amount: 500,
        scheduledDate: "2025-12-15",
        status: "canceled" as const,
        eligibleCount: 0, // No accounts affected - canceled before processing
        remarks: "Canceled due to policy review",
      },
      // Canceled individual
      {
        type: "individual" as const,
        accountId: accountIds[2],
        accountName: accountNames[2], // Student name
        amount: 600,
        scheduledDate: "2025-11-30",
        status: "canceled" as const,
      },
    ];

    let scheduleCount = 0;
    for (const schedule of schedules) {
      await topUpSchedulesService.create(schedule);
      scheduleCount++;
    }
    console.log(
      `✅ Created ${scheduleCount} top-up schedules (execution history)`
    );

    console.log("✨ Database seeding completed successfully!");
    return {
      nricRegistry: nricCount,
      accountHolders: accountIds.length,
      courses: courseIds.length,
      enrollments: enrollmentCount,
      charges: chargeCount,
      transactions: transactionCount,
      rules: ruleCount,
      schedules: scheduleCount,
    };
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};
