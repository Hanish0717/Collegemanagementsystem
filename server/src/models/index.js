/**
 * Models Barrel Export
 * 
 * Central index file for all Mongoose models.
 * Import from here for clean, consistent model access across the application.
 * 
 * Usage:
 *   import { User, Student, Fee } from '../models/index.js';
 */

// ─── Auth & Admin ────────────────────────────────────────
export { default as User } from './auth/User.js';
export { default as Admin } from './admin/Admin.js';

// ─── RBAC ────────────────────────────────────────────────
export { default as Role } from './rbac/Role.js';
export { default as Permission } from './rbac/Permission.js';
export { default as PermissionGroup } from './rbac/PermissionGroup.js';
export { default as RolePermission } from './rbac/RolePermission.js';
export { default as UserRole } from './rbac/UserRole.js';

// ─── Academic ────────────────────────────────────────────
export { default as Department } from './academic/Department.js';
export { default as AcademicYear } from './academic/AcademicYear.js';
export { default as Subject } from './academic/Subject.js';
export { default as Course } from './academic/Course.js';
export { default as Semester } from './academic/Semester.js';

// ─── Student ─────────────────────────────────────────────
export { default as Student } from './student/Student.js';
export { default as StudentResult } from './student/StudentResult.js';
export { default as StudentDocument } from './student/StudentDocument.js';

// ─── Faculty ─────────────────────────────────────────────
export { default as Faculty } from './faculty/Faculty.js';
export { default as FacultyDepartment } from './faculty/FacultyDepartment.js';
export { default as FacultySubject } from './faculty/FacultySubject.js';
export { default as FacultyAttendance } from './faculty/FacultyAttendance.js';
export { default as FacultySalary } from './faculty/FacultySalary.js';
export { default as FacultySchedule } from './faculty/FacultySchedule.js';

// ─── Parent ──────────────────────────────────────────────
export { default as Parent } from './parent/Parent.js';
export { default as ParentStudent } from './parent/ParentStudent.js';
export { default as ParentNotification } from './parent/ParentNotification.js';
export { default as ParentMeeting } from './parent/ParentMeeting.js';

// ─── Attendance ──────────────────────────────────────────
export { default as Attendance } from './attendance/Attendance.js';

// ─── Fee ─────────────────────────────────────────────────
export { default as Fee } from './fee/Fee.js';
export { default as FeeStructure } from './fee/FeeStructure.js';

// ─── Library ─────────────────────────────────────────────
export { default as Book } from './library/Book.js';
export { default as BookCategory } from './library/BookCategory.js';
export { default as BookAuthor } from './library/BookAuthor.js';
export { default as IssuedBook } from './library/IssuedBook.js';
export { default as BookReturn } from './library/BookReturn.js';
export { default as BookFine } from './library/BookFine.js';
export { default as LibraryMember } from './library/LibraryMember.js';

// ─── Hostel ──────────────────────────────────────────────
export { default as Hostel } from './hostel/Hostel.js';
export { default as HostelBlock } from './hostel/HostelBlock.js';
export { default as HostelRoom } from './hostel/HostelRoom.js';
export { default as HostelAllocation } from './hostel/HostelAllocation.js';
export { default as HostelFee } from './hostel/HostelFee.js';
export { default as HostelComplaint } from './hostel/HostelComplaint.js';
export { default as HostelVisitor } from './hostel/HostelVisitor.js';

// ─── Transport ───────────────────────────────────────────
export { default as Bus } from './transport/Bus.js';
export { default as Driver } from './transport/Driver.js';
export { default as Route } from './transport/Route.js';
export { default as Stop } from './transport/Stop.js';
export { default as TransportAllocation } from './transport/TransportAllocation.js';
export { default as VehicleMaintenance } from './transport/VehicleMaintenance.js';
export { default as TransportFee } from './transport/TransportFee.js';

// Backward compatibility aliases
export { default as TransportRoute } from './transport/Route.js';
export { default as TransportVehicle } from './transport/Bus.js';

// ─── Placement ───────────────────────────────────────────
export { default as Company } from './placement/Company.js';
export { default as PlacementDrive } from './placement/PlacementDrive.js';
export { default as DriveRound } from './placement/DriveRound.js';
export { default as StudentApplication } from './placement/StudentApplication.js';
export { default as InterviewResult } from './placement/InterviewResult.js';
export { default as SelectedStudent } from './placement/SelectedStudent.js';

// Backward compatibility aliases
export { default as PlacementApplication } from './placement/StudentApplication.js';

// ─── CMS ─────────────────────────────────────────────────
export { default as CMSPage } from './cms/CMSPage.js';
export { default as CMSBanner } from './cms/CMSBanner.js';
export { default as CMSAnnouncement } from './cms/CMSAnnouncement.js';
export { default as CollegeInformation } from './cms/CollegeInformation.js';
export { default as Event } from './cms/Event.js';
export { default as ContactInformation } from './cms/ContactInformation.js';
export { default as Testimonial } from './cms/Testimonial.js';
export { default as Gallery } from './cms/Gallery.js';
export { default as FAQ } from './cms/FAQ.js';

// Aliases
export { default as Announcement } from './cms/CMSAnnouncement.js';

// ─── AI Assistant ────────────────────────────────────────
export { default as AIConversation } from './ai/AIConversation.js';
export { default as AIMessage } from './ai/AIMessage.js';
export { default as AIPrompt } from './ai/AIPrompt.js';
export { default as AIFeedback } from './ai/AIFeedback.js';
export { default as AIUsageLog } from './ai/AIUsageLog.js';

// ─── Logging & Audit ──────────────────────────────────────
export { default as AuditLog } from './audit/AuditLog.js';
export { default as ActivityLog } from './audit/ActivityLog.js';
