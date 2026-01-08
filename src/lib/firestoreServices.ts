import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  AccountHolder,
  Course,
  Enrollment,
  CourseCharge,
  Transaction,
  TopUpRule,
  TopUpSchedule,
  NricRegistry,
} from "@/types/firestore";

// Helper to convert Firestore timestamp to ISO string
const timestampToString = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp || new Date().toISOString();
};

// Account Holders
export const accountHoldersService = {
  async getAll() {
    const querySnapshot = await getDocs(
      query(collection(db, "account_holders"), orderBy("createdAt", "desc"))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToString(doc.data().createdAt),
      updatedAt: timestampToString(doc.data().updatedAt),
      closedAt: doc.data().closedAt
        ? timestampToString(doc.data().closedAt)
        : undefined,
    })) as AccountHolder[];
  },

  async getById(id: string) {
    const docRef = doc(db, "account_holders", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: timestampToString(docSnap.data().createdAt),
        updatedAt: timestampToString(docSnap.data().updatedAt),
        closedAt: docSnap.data().closedAt
          ? timestampToString(docSnap.data().closedAt)
          : undefined,
      } as AccountHolder;
    }
    return null;
  },

  async create(data: Omit<AccountHolder, "id" | "createdAt" | "updatedAt">) {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "account_holders"), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<AccountHolder>) {
    const docRef = doc(db, "account_holders", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string) {
    await deleteDoc(doc(db, "account_holders", id));
  },

  async search(filters: {
    status?: string;
    inSchool?: string;
    searchTerm?: string;
  }) {
    const constraints: QueryConstraint[] = [];

    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    }
    if (filters.inSchool) {
      constraints.push(where("inSchool", "==", filters.inSchool));
    }

    constraints.push(orderBy("createdAt", "desc"));

    const q = query(collection(db, "account_holders"), ...constraints);
    const querySnapshot = await getDocs(q);

    let results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToString(doc.data().createdAt),
      updatedAt: timestampToString(doc.data().updatedAt),
      closedAt: doc.data().closedAt
        ? timestampToString(doc.data().closedAt)
        : undefined,
    })) as AccountHolder[];

    // Client-side search by name/nric/email if searchTerm provided
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      results = results.filter(
        (acc) =>
          acc.name.toLowerCase().includes(term) ||
          acc.nric.toLowerCase().includes(term) ||
          acc.email.toLowerCase().includes(term)
      );
    }

    return results;
  },
};

// Courses
export const coursesService = {
  async getAll() {
    const querySnapshot = await getDocs(
      query(collection(db, "courses"), orderBy("createdAt", "desc"))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToString(doc.data().createdAt),
      updatedAt: timestampToString(doc.data().updatedAt),
    })) as Course[];
  },

  async getById(id: string) {
    const docRef = doc(db, "courses", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: timestampToString(docSnap.data().createdAt),
        updatedAt: timestampToString(docSnap.data().updatedAt),
      } as Course;
    }
    return null;
  },

  async create(data: Omit<Course, "id" | "createdAt" | "updatedAt">) {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "courses"), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Course>) {
    const docRef = doc(db, "courses", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string) {
    await deleteDoc(doc(db, "courses", id));
  },
};

// Enrollments
export const enrollmentsService = {
  async getAll() {
    const querySnapshot = await getDocs(
      query(collection(db, "enrollments"), orderBy("createdAt", "desc"))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToString(doc.data().createdAt),
      updatedAt: timestampToString(doc.data().updatedAt),
    })) as Enrollment[];
  },

  async getByAccountId(accountId: string) {
    try {
      const q = query(
        collection(db, "enrollments"),
        where("accountId", "==", accountId)
        // Note: orderBy requires a composite index in Firestore
        // We sort on the client side instead
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: timestampToString(doc.data().createdAt),
        updatedAt: timestampToString(doc.data().updatedAt),
      })) as Enrollment[];

      // Sort by createdAt descending on client side
      results.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return results;
    } catch (error) {
      console.error("enrollmentsService.getByAccountId error:", error);
      throw error;
    }
  },

  async getByCourseId(courseId: string) {
    const q = query(
      collection(db, "enrollments"),
      where("courseId", "==", courseId)
      // Note: orderBy requires a composite index in Firestore
      // We sort on the client side instead
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToString(doc.data().createdAt),
      updatedAt: timestampToString(doc.data().updatedAt),
    })) as Enrollment[];

    // Sort by createdAt descending on client side
    results.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return results;
  },

  async create(data: Omit<Enrollment, "id" | "createdAt" | "updatedAt">) {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "enrollments"), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Enrollment>) {
    const docRef = doc(db, "enrollments", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string) {
    await deleteDoc(doc(db, "enrollments", id));
  },
};

// Course Charges
export const courseChargesService = {
  async getAll() {
    const querySnapshot = await getDocs(
      query(collection(db, "course_charges"), orderBy("createdAt", "desc"))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToString(doc.data().createdAt),
      updatedAt: timestampToString(doc.data().updatedAt),
    })) as CourseCharge[];
  },

  async getByAccountId(accountId: string) {
    const q = query(
      collection(db, "course_charges"),
      where("accountId", "==", accountId),
      orderBy("dueDate", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToString(doc.data().createdAt),
      updatedAt: timestampToString(doc.data().updatedAt),
    })) as CourseCharge[];
  },

  async create(data: Omit<CourseCharge, "id" | "createdAt" | "updatedAt">) {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "course_charges"), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<CourseCharge>) {
    const docRef = doc(db, "course_charges", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string) {
    await deleteDoc(doc(db, "course_charges", id));
  },

  async payCharge(id: string, paymentMethod: "education_account" | "online") {
    const docRef = doc(db, "course_charges", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const charge = docSnap.data() as CourseCharge;
      const remainingAmount = charge.amount - charge.amountPaid;

      await updateDoc(docRef, {
        amountPaid: charge.amount,
        status: "paid",
        paidDate: new Date().toISOString(),
        paymentMethod,
        updatedAt: Timestamp.now(),
      });

      // If paid from education account, deduct balance
      if (paymentMethod === "education_account") {
        const accountRef = doc(db, "account_holders", charge.accountId);
        const accountSnap = await getDoc(accountRef);

        if (accountSnap.exists()) {
          const account = accountSnap.data() as AccountHolder;
          await updateDoc(accountRef, {
            balance: account.balance - remainingAmount,
            updatedAt: Timestamp.now(),
          });

          // Create transaction record
          await transactionsService.create({
            accountId: charge.accountId,
            type: "course_fee",
            amount: -remainingAmount,
            description: `Course fee payment for ${charge.courseName}`,
            status: "completed",
            reference: id,
          });
        }
      } else {
        // Mock online payment - just create transaction
        await transactionsService.create({
          accountId: charge.accountId,
          type: "payment",
          amount: -remainingAmount,
          description: `Online payment for ${charge.courseName}`,
          status: "completed",
          reference: id,
        });
      }
    }
  },
};

// Transactions
export const transactionsService = {
  async getAll() {
    const querySnapshot = await getDocs(
      query(collection(db, "transactions"), orderBy("createdAt", "desc"))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToString(doc.data().createdAt),
    })) as Transaction[];
  },

  async getByAccountId(accountId: string) {
    const q = query(
      collection(db, "transactions"),
      where("accountId", "==", accountId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToString(doc.data().createdAt),
    })) as Transaction[];
  },

  async create(data: Omit<Transaction, "id" | "createdAt">) {
    const docRef = await addDoc(collection(db, "transactions"), {
      ...data,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async delete(id: string) {
    await deleteDoc(doc(db, "transactions", id));
  },
};

// Top Up Rules
export const topUpRulesService = {
  async getAll() {
    const querySnapshot = await getDocs(
      query(collection(db, "top_up_rules"), orderBy("createdAt", "desc"))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToString(doc.data().createdAt),
      updatedAt: timestampToString(doc.data().updatedAt),
    })) as TopUpRule[];
  },

  async getById(id: string) {
    const docRef = doc(db, "top_up_rules", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: timestampToString(docSnap.data().createdAt),
        updatedAt: timestampToString(docSnap.data().updatedAt),
      } as TopUpRule;
    }
    return null;
  },

  async create(data: Omit<TopUpRule, "id" | "createdAt" | "updatedAt">) {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "top_up_rules"), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<TopUpRule>) {
    const docRef = doc(db, "top_up_rules", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string) {
    await deleteDoc(doc(db, "top_up_rules", id));
  },
};

// Top Up Schedules
export const topUpSchedulesService = {
  async getAll() {
    const querySnapshot = await getDocs(
      query(collection(db, "top_up_schedules"), orderBy("createdAt", "desc"))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToString(doc.data().createdAt),
      updatedAt: timestampToString(doc.data().updatedAt),
    })) as TopUpSchedule[];
  },

  async create(data: Omit<TopUpSchedule, "id" | "createdAt" | "updatedAt">) {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "top_up_schedules"), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<TopUpSchedule>) {
    const docRef = doc(db, "top_up_schedules", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string) {
    await deleteDoc(doc(db, "top_up_schedules", id));
  },

  async executeTopUp(scheduleId: string) {
    const scheduleRef = doc(db, "top_up_schedules", scheduleId);
    const scheduleSnap = await getDoc(scheduleRef);

    if (!scheduleSnap.exists()) return;

    const schedule = scheduleSnap.data() as TopUpSchedule;

    // Update schedule status to processing
    await updateDoc(scheduleRef, {
      status: "processing",
      updatedAt: Timestamp.now(),
    });

    try {
      let processedCount = 0;
      let eligibleCount = 0;

      if (schedule.type === "individual" && schedule.accountId) {
        // Individual top-up
        const accountRef = doc(db, "account_holders", schedule.accountId);
        const accountSnap = await getDoc(accountRef);

        if (accountSnap.exists()) {
          const account = accountSnap.data() as AccountHolder;
          eligibleCount = 1;

          await updateDoc(accountRef, {
            balance: account.balance + schedule.amount,
            updatedAt: Timestamp.now(),
          });

          await transactionsService.create({
            accountId: schedule.accountId,
            type: "top_up",
            amount: schedule.amount,
            description: `Individual top-up: ${
              schedule.remarks || "Manual top-up"
            }`,
            status: "completed",
            reference: scheduleId,
          });

          processedCount = 1;
        }
      } else if (schedule.type === "batch" && schedule.ruleId) {
        // Batch top-up based on rule
        const rule = await topUpRulesService.getById(schedule.ruleId);
        if (rule) {
          const accounts = await accountHoldersService.getAll();
          const eligibleAccounts = accounts.filter((account) => {
            if (account.status !== "active") return false;

            // Calculate age
            const age =
              new Date().getFullYear() -
              new Date(account.dateOfBirth).getFullYear();

            // Check rule criteria
            if (rule.minAge && age < rule.minAge) return false;
            if (rule.maxAge && age > rule.maxAge) return false;
            if (rule.minBalance && account.balance < rule.minBalance)
              return false;
            if (rule.maxBalance && account.balance > rule.maxBalance)
              return false;
            if (rule.inSchool && account.inSchool !== rule.inSchool)
              return false;
            if (
              rule.educationLevel &&
              account.educationLevel !== rule.educationLevel
            )
              return false;
            if (
              rule.continuingLearning &&
              account.continuingLearning !== rule.continuingLearning
            )
              return false;

            return true;
          });

          eligibleCount = eligibleAccounts.length;

          for (const account of eligibleAccounts) {
            const accountRef = doc(db, "account_holders", account.id);
            await updateDoc(accountRef, {
              balance: account.balance + schedule.amount,
              updatedAt: Timestamp.now(),
            });

            await transactionsService.create({
              accountId: account.id,
              type: "top_up",
              amount: schedule.amount,
              description: `Batch top-up: ${rule.name}`,
              status: "completed",
              reference: scheduleId,
            });

            processedCount++;
          }
        }
      }

      // Update schedule as completed
      await updateDoc(scheduleRef, {
        status: "completed",
        executedDate: new Date().toISOString(),
        eligibleCount,
        processedCount,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      // Update schedule as failed
      await updateDoc(scheduleRef, {
        status: "failed",
        remarks: `Error: ${error}`,
        updatedAt: Timestamp.now(),
      });
      throw error;
    }
  },
};

// NRIC Registry
export const nricRegistryService = {
  async getAll() {
    const querySnapshot = await getDocs(
      query(collection(db, "nric_registry"), orderBy("nric", "asc"))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToString(doc.data().createdAt),
      updatedAt: timestampToString(doc.data().updatedAt),
    })) as NricRegistry[];
  },

  async getByNric(nric: string) {
    const q = query(
      collection(db, "nric_registry"),
      where("nric", "==", nric.toUpperCase())
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToString(doc.data().createdAt),
      updatedAt: timestampToString(doc.data().updatedAt),
    } as NricRegistry;
  },

  async create(data: Omit<NricRegistry, "id" | "createdAt" | "updatedAt">) {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "nric_registry"), {
      ...data,
      nric: data.nric.toUpperCase(),
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<NricRegistry>) {
    const docRef = doc(db, "nric_registry", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string) {
    await deleteDoc(doc(db, "nric_registry", id));
  },
};
