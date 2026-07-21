import os
import sys
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
from fpdf import FPDF

class ERPManualPDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_margins(16, 15, 15) # Left margin 16mm to clear the 12mm sidebar
        self.set_auto_page_break(auto=True, margin=15)

    def draw_sidebar(self):
        # Draw white background for sidebar
        self.set_fill_color(255, 255, 255)
        self.rect(0, 0, 12, 297, "F")
        
        # Draw thin divider line
        self.set_draw_color(191, 219, 254) # Blue-200
        self.set_line_width(0.4)
        self.line(12, 0, 12, 297)
        
        # Write rotated text: "@harsha_perfect_solutions"
        self.set_text_color(59, 130, 246) # Blue-500
        self.set_font("times", "B", 7.5)
        with self.rotation(270, 7.5, 140):
            self.text(7.5, 140, "@harsha_perfect_solutions")
            
        # Draw 6-dot grid handle icon below text
        self.set_fill_color(191, 219, 254)
        dot_y = 190
        dot_x_1 = 4.5
        dot_x_2 = 7.5
        for row in range(3):
            self.circle(dot_x_1, dot_y + row*3.5, 0.6, "F")
            self.circle(dot_x_2, dot_y + row*3.5, 0.6, "F")

    def header(self):
        if self.page_no() > 1:
            self.draw_sidebar()
            self.set_font("times", "I", 8)
            self.set_text_color(100, 116, 139) # Slate-500
            self.set_x(16)
            self.cell(0, 5, "COLLEGE ERP - SYSTEM INTEGRITY MANUAL", align="L", ln=False)
            self.cell(0, 5, f"Section {self.page_no() - 1}", align="R", ln=True)
            # Add line separator
            self.set_draw_color(14, 184, 166) # Teal accent color line!
            self.set_line_width(0.6)
            self.line(16, 21, 195, 21)
            self.ln(6)

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-15)
            self.set_font("times", "I", 8)
            self.set_text_color(148, 163, 184)
            # Page Number
            self.cell(0, 10, f"Page {self.page_no()}", align="C")
            
            # Left Footer
            self.set_x(16)
            self.cell(0, 10, "Enterprise Operations Blueprint", align="L")
            
            # Right Footer
            self.set_x(16)
            self.cell(0, 10, "Release v2.4.0 (LTS)", align="R")

    def draw_paper_airplane(self, x, y):
        # Set color to a nice soft blue/grey
        self.set_fill_color(186, 230, 253) # sky-200
        self.set_draw_color(125, 211, 252) # sky-300
        self.polygon([(x, y), (x + 30, y - 10), (x + 10, y + 20), (x, y)], style="F")
        # Draw shadow triangle
        self.set_fill_color(56, 189, 248) # sky-400
        self.polygon([(x + 10, y + 20), (x + 15, y + 7), (x + 30, y - 10), (x + 10, y + 20)], style="F")

    def cover_page(self):
        self.add_page()
        
        # Left column cover page block background
        self.set_fill_color(255, 255, 255)
        self.rect(0, 0, 80, 297, "F")
        
        # Right column cover page block background
        self.set_fill_color(11, 19, 41) # Dark navy
        self.rect(80, 0, 130, 297, "F")
        
        # Left Side Content: Logo image replacement
        if os.path.exists("hps_logo.png"):
            self.image("hps_logo.png", x=6, y=25, w=68)
        
        # Paper airplane illustration
        self.draw_paper_airplane(25, 138)
        
        # Bottom left column text
        self.set_y(235)
        self.set_x(10)
        self.set_font("times", "B", 10.5)
        self.set_text_color(15, 23, 42)
        self.multi_cell(60, 5, "The Future of Education Starts Here\nAI * Automation * Analytics * Intelligence", align="C")
        
        # Right Side Content (x=80)
        # Cover Illustration PNG embedding
        if os.path.exists("college_erp_cover.png"):
            self.image("college_erp_cover.png", x=88, y=28, w=114, h=70)
            
        self.set_y(115)
        self.set_x(90)
        self.set_font("times", "B", 24)
        self.set_text_color(255, 255, 255)
        self.multi_cell(110, 10, "College\nManagement System", new_x="LMARGIN", new_y="NEXT")
        
        self.ln(6)
        self.set_x(90)
        self.set_font("times", "I", 10)
        self.set_text_color(14, 184, 166) # Teal subtitle
        self.multi_cell(110, 5, 'Transforming Traditional Campuses into AI-Enabled Smart Campuses.\n\n"Empowering minds, automating systems, and building the future of campus governance."\n\nWhy manage when you can innovate? Experience the ultimate synergy of AI, analytics, and automation.', new_x="LMARGIN", new_y="NEXT")
        
        # Add decorative color bar on the right edge
        self.set_fill_color(14, 184, 166)
        self.rect(206, 0, 4, 297, "F")

    def draw_flowchart(self, steps):
        self.set_y(232)
        self.set_x(16) # Shift x because of sidebar
        self.set_font("times", "B", 10)
        self.set_text_color(43, 58, 143) # Indigo
        self.cell(0, 6, "5. System Operational Workflow Flowchart", ln=False)
        self.ln(6)
        
        num_steps = len(steps)
        box_w = 34
        # Total printable width is 180mm.
        spacing = (178 - (num_steps * box_w)) / (num_steps - 1) if num_steps > 1 else 0
        
        for i, step in enumerate(steps):
            x = 16 + i * (box_w + spacing)
            y = self.get_y()
            
            # Draw box background
            self.set_fill_color(240, 253, 250) # Light Teal background
            self.set_draw_color(14, 184, 166) # Teal outline
            self.set_line_width(0.4)
            self.rect(x, y, box_w, 14, "F" if i % 2 == 0 else "D")
            if i % 2 == 0:
                self.rect(x, y, box_w, 14, "D")
                
            # Draw small vertical accent on left side of the box
            self.set_fill_color(43, 58, 143) # Deep Indigo
            self.rect(x, y, 2.5, 14, "F")
            
            # Circular step number circle
            self.set_fill_color(14, 184, 166)
            self.circle(x + 5, y + 7, 2, "F")
            
            # Step Text Number
            self.set_y(y + 5.5)
            self.set_x(x + 3.8)
            self.set_font("times", "B", 5.5)
            self.set_text_color(255, 255, 255)
            self.cell(2.5, 3, f"0{i+1}", align="C")
            
            # Write step name inside box
            self.set_y(y + 2.2)
            self.set_x(x + 7.5)
            self.set_font("times", "B", 7.2)
            self.set_text_color(30, 41, 59)
            self.multi_cell(box_w - 8, 3.2, step, align="C")
            
            # Restore Y coordinate
            self.set_y(y)
            
            # Draw arrows to connect boxes
            if i < num_steps - 1:
                arrow_x_start = x + box_w + 1
                arrow_x_end = arrow_x_start + spacing - 2
                arrow_y = y + 7
                self.set_draw_color(43, 58, 143)
                self.set_line_width(0.6)
                self.line(arrow_x_start, arrow_y, arrow_x_end, arrow_y)
                # Draw arrowhead
                self.line(arrow_x_end - 1.5, arrow_y - 1, arrow_x_end, arrow_y)
                self.line(arrow_x_end - 1.5, arrow_y + 1, arrow_x_end, arrow_y)

    def add_module_page(self, num, title, submodules, features, process, roles, flowchart_steps):
        self.add_page()
        
        # Header accent bar
        self.set_fill_color(43, 58, 143) # Navy bar
        self.rect(16, self.get_y(), 6, 14, "F")
        
        # Module title box
        self.set_fill_color(241, 245, 249) # Slate 100
        self.rect(22, self.get_y(), 173, 14, "F")
        self.set_draw_color(226, 232, 240)
        self.rect(22, self.get_y(), 173, 14, "D")
        
        self.set_y(self.get_y() + 2)
        self.set_x(26)
        self.set_font("times", "B", 13)
        self.set_text_color(43, 58, 143) # Indigo
        self.cell(10, 10, f"{num}.", ln=False)
        self.set_text_color(15, 23, 42)
        self.cell(0, 10, title.upper(), ln=True)
        self.ln(6)
        
        # 1. Submodules List (Teal Accent Box)
        self.set_font("times", "B", 10.5)
        self.set_text_color(43, 58, 143)
        self.set_x(16)
        self.cell(0, 6, "1. Key Sub-Modules", ln=True)
        
        self.set_fill_color(240, 253, 250) # Light Teal background card
        self.rect(16, self.get_y(), 179, 11, "F")
        self.set_draw_color(153, 246, 228) # Teal border
        self.rect(16, self.get_y(), 179, 11, "D")
        
        # Side accent tag for sub-modules
        self.set_fill_color(14, 184, 166)
        self.rect(16, self.get_y(), 3, 11, "F")
        
        self.ln(3)
        self.set_x(23)
        self.set_font("times", "B", 8.5)
        self.set_text_color(13, 148, 136) # Teal text
        sub_text = " | ".join(submodules)
        self.multi_cell(169, 4.5, sub_text, ln=True)
        self.ln(5)
        
        # 2. Features Card
        self.set_font("times", "B", 10.5)
        self.set_text_color(43, 58, 143)
        self.set_x(16)
        self.cell(0, 6, "2. Operational Features", ln=True)
        
        self.set_font("times", "", 9)
        self.set_text_color(51, 65, 85)
        for feat in features:
            self.set_x(19)
            # Colorful bullet
            self.set_text_color(14, 184, 166)
            self.cell(5, 5, chr(149), ln=False)
            self.set_text_color(51, 65, 85)
            self.multi_cell(169, 4.8, feat, ln=True)
        self.ln(3)
        
        # 3. Working Process
        self.set_font("times", "B", 10.5)
        self.set_text_color(43, 58, 143)
        self.set_x(16)
        self.cell(0, 6, "3. Working Process Flow", ln=True)
        
        # Draw a left accent line for the process flow
        self.set_draw_color(43, 58, 143)
        self.set_line_width(0.8)
        start_y = self.get_y() + 1
        
        self.set_x(21)
        self.set_font("times", "", 9)
        self.set_text_color(51, 65, 85)
        self.multi_cell(174, 5, process, ln=True)
        
        self.line(18, start_y, 18, self.get_y() - 1)
        self.ln(3)
        
        # 4. Role Permissions
        self.set_font("times", "B", 10.5)
        self.set_text_color(43, 58, 143)
        self.set_x(16)
        self.cell(0, 6, "4. Role-Based Access Controls (RBAC)", ln=True)
        
        # Draw elegant table for roles
        self.set_fill_color(43, 58, 143) # Indigo header for table
        self.set_font("times", "B", 8)
        self.set_text_color(255, 255, 255)
        self.set_x(16)
        self.cell(45, 6, "Authorized Role", border=1, ln=False, fill=True)
        self.cell(134, 6, "Access Scope & Permissions Matrix", border=1, ln=True, fill=True)
        
        self.set_font("times", "", 8.5)
        for role, scope in roles.items():
            # Color coding rows based on role types
            role_lower = role.lower()
            if "admin" in role_lower:
                self.set_fill_color(239, 246, 255) # Light Blue for Admin
                self.set_text_color(30, 64, 175)
            elif "faculty" in role_lower or "hod" in role_lower or "dean" in role_lower:
                self.set_fill_color(240, 253, 244) # Light Green for Faculty
                self.set_text_color(22, 101, 52)
            elif "accounts" in role_lower or "finance" in role_lower:
                self.set_fill_color(255, 251, 235) # Light Amber for Finance/Accounts
                self.set_text_color(146, 64, 14)
            else:
                self.set_fill_color(248, 250, 252) # Light Grey default
                self.set_text_color(71, 85, 105)
                
            current_y = self.get_y()
            self.set_x(16)
            self.multi_cell(45, 4.5, role, border=1, ln=False, fill=True)
            self.set_y(current_y)
            self.set_x(61)
            self.multi_cell(134, 4.5, scope, border=1, ln=True, fill=True)

        # 5. Flowchart
        self.draw_flowchart(flowchart_steps)

def main():
    pdf = ERPManualPDF()
    
    # 1. Cover Page
    pdf.cover_page()
    
    # 2. Table of Contents
    pdf.add_page()
    
    # Draw top design stripe
    pdf.set_fill_color(14, 184, 166)
    pdf.rect(16, 10, 179, 2, "F")
    
    pdf.ln(8)
    pdf.set_font("times", "B", 18)
    pdf.set_text_color(43, 58, 143)
    pdf.set_x(16)
    pdf.cell(0, 10, "TABLE OF CONTENTS", ln=True, align="C")
    pdf.ln(5)
    
    modules_list = [
        "1. Admission Management", "2. Student Information System (SIS)", 
        "3. Academic Management", "4. Attendance", "5. Examination", 
        "6. Faculty ERP", "7. Learning Management", "8. Placement Cell", 
        "9. Hostel", "10. Transport", "11. Library", "12. Finance", 
        "13. HRMS", "14. Inventory", "15. Accreditation", "16. Communication", 
        "17. Grievance", "18. Alumni", "19. Administration"
    ]
    
    pdf.set_font("times", "", 10)
    for i, mod in enumerate(modules_list):
        page_num = i + 3
        # Alternate table of contents backgrounds for beauty
        if i % 2 == 0:
            pdf.set_fill_color(248, 250, 252)
        else:
            pdf.set_fill_color(255, 255, 255)
            
        pdf.set_x(16)
        pdf.set_text_color(43, 58, 143)
        pdf.cell(10, 8.5, f"CH {i+1}", ln=False, fill=True)
        pdf.set_text_color(51, 65, 85)
        pdf.cell(139, 8.5, f"   {mod.split('. ')[1]}", ln=False, fill=True)
        pdf.set_text_color(14, 184, 166)
        pdf.set_font("times", "B", 9.5)
        pdf.cell(0, 8.5, f"Page {page_num}   ", ln=True, align="R", fill=True)
        pdf.set_font("times", "", 10)
        
        pdf.set_draw_color(226, 232, 240)
        pdf.line(16, pdf.get_y(), 195, pdf.get_y())
        
    # Add Modules
    # 1. Admission Management
    pdf.add_module_page(
        1, "Admission Management",
        ["Online Registration", "Entrance/Management Quota", "Document Verification", "Fee Payment", "Seat Allotment", "Student ID Generation", "Department Allocation"],
        [
            "Interactive student portal with validation checks.",
            "Rank merit list calculations and fee status verification.",
            "Automatic student profile and institutional ID card initialization."
        ],
        "Prospects register online. The system checks cutoffs, schedules document verification slots, records quota allocations, and locks seats upon fee transaction confirmation. Finally, it allocates department branches and releases roll numbers.",
        {
            "Super Admin / Admins": "Complete control. Modify fee status, override quota, edit document verify rules.",
            "Principal / Dean": "Approve final seat allocation, check merit logs and intake stats.",
            "Student / Guest": "Fill application forms, upload verification files, pay fees, download receipts."
        },
        ["Registration", "Verification", "Fee Payment", "Seat Allot"]
    )

    # 2. Student Information System (SIS)
    pdf.add_module_page(
        2, "Student Information System (SIS)",
        ["Student Profile", "Academic History", "Certificates", "Parent Details", "ID Cards", "Alumni Records"],
        [
            "Central 360-degree digital card for every registered student.",
            "Automated certificate generation (Bonafide, Transfer, Course Completion).",
            "Continuous tracking transitioning to alumni database on graduation."
        ],
        "Students input details and upload files. System formats ID cards, links course completion records, logs discipline logs, and manages parent contacts. Upon graduation, accounts transfer into the alumni directory automatically.",
        {
            "Super Admin / Admins": "Full read/write rights. Manage certificate formats and disciplinary records.",
            "HOD / Faculty": "View student profile dashboards, check academic progress and parent details.",
            "Student / Parents": "Read-only access to personal profiles and grade cards. Update address logs."
        },
        ["Profile Reg", "History Log", "ID Card Gen", "Alumni Sync"]
    )

    # 3. Academic Management
    pdf.add_module_page(
        3, "Academic Management",
        ["Academic Calendar", "Semester Creation", "Course Registration", "Curriculum (R20/R23 etc.)", "Credit System", "Electives", "Timetable"],
        [
            "Configurable curriculum regulations (Choice Based Credit System - CBCS).",
            "Automatic elective courses allocation based on student preference and merit.",
            "Clash-free timetabling engines mapping classrooms and faculty availability."
        ],
        "Deans create semesters and define course codes under specific regulations (e.g. R23). Faculty input lecture availability. System builds visual calendar timetables. Students login to select electives and register courses.",
        {
            "Super Admin / Deans": "Create semesters, regulations, map core timetables and publish calendar books.",
            "HOD / Faculty": "Add syllabus, verify curriculum files, manage course mappings.",
            "Student": "Select open electives and complete course registrations."
        },
        ["Curriculum", "Semester Set", "Slot Alloc", "Enrollment"]
    )

    # 4. Attendance
    pdf.add_module_page(
        4, "Attendance",
        ["Faculty Attendance Entry", "Student Attendance", "Biometric/RFID Integration", "Shortage Calculation", "Parent SMS", "Reports"],
        [
            "Biometric device integration pulling punch logs in real time.",
            "Automated attendance shortage reports tracking minimum 75% thresholds.",
            "SMS triggers dispatching daily warnings to parents for absent students."
        ],
        "Biometric devices log check-ins. Faculty verify records manually or override errors. The shortage calculator computes compliance scores weekly and schedules SMS alerts. HODs export report indices.",
        {
            "Super Admin / Admin": "Configure biometric ports, clear buffer errors, override shortage lists.",
            "HOD / Faculty": "Submit daily class attendance sheets, review department percentages.",
            "Student / Parent": "Read-only check-in calendar logs and warning notifications."
        },
        ["RFID Check", "Daily Register", "Shortage Run", "Parent Alert"]
    )

    # 5. Examination
    pdf.add_module_page(
        5, "Examination",
        ["Exam Schedule", "Hall Ticket Clearance", "Question Paper Encryption", "Exam Centers", "Invigilator Roster", "Seating Matrix", "Exam Attendance", "Internal & External Marks", "SGPA/CGPA Result Processing", "Revaluation", "Grace Marks Sanction", "Malpractice Board", "COE Reports"],
        [
            "Dedicated Controller of Examinations (COE) Governance Suite with outcome-based SGPA/CGPA computation.",
            "Automated Hall Ticket clearance and withhold controls for fee defaulters or low attendance (<65%).",
            "AES-256 Question Paper encryption, invigilation duty rosters, and anti-malpractice seating matrix.",
            "Board moderation, revaluation grade updates, grace marks (+1/+2) sanctioning, and malpractice verdicts."
        ],
        "Exam branch creates schedules and allocates centers. Candidates screen for attendance/fee clearance to unlock hall tickets. Question papers undergo AES-256 encryption. Hall invigilators track live attendance. Internal and external marks are moderated, results process to SGPA/CGPA, and transcripts auto-generate alongside revaluation and grace mark sanctions.",
        {
            "Controller of Examinations (COE) / Dean": "Complete administrative authority: Approve results, sanction grace marks, execute malpractice verdicts, lock encrypted question papers.",
            "HOD / Faculty": "Upload internal marks, confirm invigilation duties, verify moderation keys.",
            "Student": "Register for exams, download hall tickets, view SGPA/CGPA results, apply for revaluation."
        },
        ["Schedule & Encrypt", "Hall Tickets", "Hall Attendance", "COE Result Publish"]
    )

    # 6. Faculty ERP
    pdf.add_module_page(
        6, "Faculty ERP",
        ["Faculty Profile", "Workload", "Leave", "Attendance", "Research", "Publications", "Performance", "Payroll"],
        [
            "Workload manager tracking weekly lecture schedules against guidelines.",
            "Research and publication log tracking research citations.",
            "Self-appraisal sheets linked directly to NAAC files."
        ],
        "Faculty edit profiles, upload research papers, apply for leaves, and track weekly lecture workload. System computes performance scores based on publications and feedback, updating payroll allowance indices.",
        {
            "Super Admin / Admin": "Approve promotions, modify payroll bands, adjust teaching limits.",
            "HOD / Dean": "Review faculty workloads, approve research funds, sign leaves.",
            "Faculty": "Manage personal profiles, leaves, research logs, and check salary slips."
        },
        ["Workload Map", "Leave Request", "Research Pub", "Appraisal Run"]
    )

    # 7. Learning Management
    pdf.add_module_page(
        7, "Learning Management",
        ["Notes", "Videos", "Assignments", "Quizzes", "Discussion Forum", "Online Classes"],
        [
            "Direct file uploads (PDF, MP4, Docs) for study material.",
            "Online assignment submissions with plagiarism detection cues.",
            "Online quiz modules with automatic grading keys."
        ],
        "Faculty create course pages and post notes, files, and video links. Quizzes are published with timers. Students submit assignments. Discussion forums allow thread queries. Grades sync to the LMS database.",
        {
            "HOD / Faculty": "Upload study material, manage quizzes, grade submissions, run online links.",
            "Student": "Download notes, watch videos, submit assignments, attempt quizzes."
        },
        ["Course Setup", "Material Add", "Assignments", "Quiz Grade"]
    )

    # 8. Placement Cell
    pdf.add_module_page(
        8, "Placement Cell",
        ["Student Eligibility", "Company Registration", "Job Posting", "Applications", "Aptitude Tests", "Interview Schedule", "Offer Letters", "Placement Statistics"],
        [
            "Eligibility criteria filters (CGPA, backlogs limits).",
            "Recruiter dashboard to post vacancies and download applicant profiles.",
            "Placement analytics tracking average and highest package values."
        ],
        "Placement officer registers companies. Recruiters upload jobs. Eligible students register. System arranges aptitude exams and interview panels. Offers are logged, updating placement dashboard statistics.",
        {
            "Placement Officer (TPO)": "Add corporate profiles, review applications, set CGPA thresholds, upload offers.",
            "Recruiter": "Post vacancies, filter resumes, update hiring status.",
            "Student": "View jobs, check eligibility status, apply, and download mock tests."
        },
        ["Eligibility", "Jobs Listing", "Interviews", "Offer Placed"]
    )

    # 9. Hostel
    pdf.add_module_page(
        9, "Hostel",
        ["Room Allocation", "Attendance", "Hostel Fees", "Visitor Log", "Complaints"],
        [
            "Live bed matrix displaying vacant, occupied, and maintenance room layouts.",
            "Outing gate logs and night check-in attendance registries.",
            "Complaints ticket portal routing issues to wardens."
        ],
        "Students apply for rooms. System checks fees and assigns beds. Wardens take night attendance via mobile keys. Security logs visitors. Mess systems track student feedbacks.",
        {
            "Hostel Warden": "Allocate rooms, verify night check-ins, resolve maintenance complaints.",
            "Accounts Manager": "Post hostel fees and track pending payments.",
            "Student Resident": "Apply for rooms, submit gatepasses, register complaints, log dining feedbacks."
        },
        ["Room Request", "Outing Pass", "Check-in Log", "Complaints"]
    )

    # 10. Transport
    pdf.add_module_page(
        10, "Transport",
        ["Route Management", "Bus Allocation", "GPS Tracking", "Driver Details", "Fee Collection"],
        [
            "Route mapper tracking stops and bus seating capacities.",
            "GPS location integration for live bus coordinates.",
            "Fee collection registers linked to student entry passes."
        ],
        "Transport in-charge defines routes and stops. Buses are allocated. Drivers register. Students opt for routes, pay fees, and get boarding cards. GPS devices feed coordinates to the student dashboard.",
        {
            "Transport Officer": "Define routes, schedule maintenance, allocate drivers, track routes.",
            "Accounts Cell": "Manage fee logs and bus pass issue lists.",
            "Student / Parent": "Read-only access to route schedules, bus locations, and fee status."
        },
        ["Route Mapped", "Bus Allocation", "GPS Live", "Pass Release"]
    )

    # 11. Library
    pdf.add_module_page(
        11, "Library",
        ["Book Catalog", "Issue/Return", "Fine", "Digital Library", "Barcode/RFID"],
        [
            "OPAC Search index for physical book titles and journals.",
            "RFID/Barcode tracking scanning book issuance and returns.",
            "Automated library fine calculations linked to fee books."
        ],
        "Librarian scans book barcodes. System logs check-out limits and return periods. Reminders are dispatched for overdue items. Fine calculations are linked to student accounts automatically.",
        {
            "Librarian": "Manage catalog, scan barcodes, override fines, issue digital books.",
            "Student / Faculty": "Search catalog, view checkout history, read e-books, pay outstanding fines."
        },
        ["Catalog Find", "Barcode Scan", "Book Issue", "Fine Sync"]
    )

    # 12. Finance
    pdf.add_module_page(
        12, "Finance",
        ["Tuition Fees", "Scholarships", "Payroll", "Vendor Payments", "GST Reports", "Accounting"],
        [
            "Tuition fee ledger tracking dues, installment plans, and online gateways.",
            "Scholarship adjustment registers and government scheme mappings.",
            "TDS, GST, and balance sheet generators."
        ],
        "Finance team logs fees, checks scholarship allocations, dispatches vendor payments, and runs payroll accounts. GST records and balance sheets are compiled automatically for annual audit reporting.",
        {
            "Super Admin / Finance Head": "Full financial control, ledger edits, balance sheets, bank reconciliations.",
            "Accounts Team": "Process tuition fees, verify scholarships, release vendor bills.",
            "Student / Parent": "View fee balances, pay online, download receipts."
        },
        ["Tuition Bills", "Scholarships", "Ledger Entry", "Audit Sheets"]
    )

    # 13. HRMS
    pdf.add_module_page(
        13, "HRMS",
        ["Employee Records", "Recruitment", "Attendance", "Leave", "Payroll", "Performance"],
        [
            "Staff directory with reactive details.",
            "Leave management board and biometric sync controllers.",
            "Locked payroll disbursement keys."
        ],
        "Admin manages personnel records. Department heads sync RFID devices and approve leaves. System calculates basic scales, allowance, and releases salaries. Appraisals track research files for NAAC audits.",
        {
            "Super Admin / Admins": "Manage records, post openings, approve leaves, release payroll.",
            "Accounts Manager": "Disburse salary scales, edit allowances.",
            "HOD / Faculty": "Approve leaves, sync attendance, view performance ratings."
        },
        ["Profile Reg", "Biometric Sync", "Leave Approval", "Disburse Pay"]
    )

    # 14. Inventory
    pdf.add_module_page(
        14, "Inventory",
        ["Assets", "Lab Equipment", "Purchase Orders", "Stock", "Maintenance"],
        [
            "Book Value and WDV calculations with depreciation rates.",
            "Stock consumable indicators warning on low volumes.",
            "Outward gatepass log with security return checks."
        ],
        "Asset register audits initial values vs. depreciation values. Custodians log lab equipment states. Purchase requests are authorized. Stock levels auto-adjust. Gate passes track devices sent out for repair.",
        {
            "Super Admin / Admin": "Full asset ledger access, PO approvals, gatepass issuing.",
            "Accounts": "Verify PO budgets, balance asset books, restock consumables.",
            "HOD / Lab Custodian": "Mark equipment serviced, request gatepasses."
        },
        ["PO Request", "Stock Check", "Asset Logging", "Gatepass Log"]
    )

    # 15. Accreditation
    pdf.add_module_page(
        15, "Accreditation",
        ["NBA", "NAAC", "AICTE", "NIRF", "AISHE Reports", "Event Management", "Certificate Management", "Evidence Repository"],
        [
            "NBA CO-PO mapping and attainment | NAAC SSR criteria-wise evidence.",
            "AICTE EOA records, NIRF data, and AISHE DCF filing compliance.",
            "Event proposal workflow, attendee check-in, and auto-certificates.",
            "Digital signed certificate downloads and central evidence repositories."
        ],
        "Faculty/HOD creates an event proposal. The HOD and Principal review and approve it. The event is published for student registration, attendance is verified, and the coordinator uploads the reports and documents. The system then automatically generates participation/organizer certificates and stores event evidence for accreditation criteria.",
        {
            "Super Admin": "Manage accreditation modules, approve reports, manage certificates, view analytics.",
            "Principal / Dean": "Approve events, verify accreditation reports, approve final submissions, monitor progress.",
            "HOD": "Create/approve event proposals, upload department evidence, validate reports.",
            "Faculty / Coordinator": "Organize events, mark attendance, upload reports, generate certificates.",
            "Student": "Register for events, view approvals, download certificates, track participation history."
        },
        ["Event Proposal", "Event Approved", "Certificates", "Evidence Safe"]
    )

    # 16. Communication
    pdf.add_module_page(
        16, "Communication",
        ["SMS", "Email", "Push Notifications", "Circulars", "WhatsApp"],
        [
            "Multi-channel broadcast engine routing alerts via SMS, Email, and WhatsApp.",
            "Circular archive for official notices.",
            "Automated triggers for announcements, fee dues, and exam updates."
        ],
        "Authorized staff select channels and enter messages. The communication dispatcher sends bulk messages. Push notifications appear on mobile devices, and official circulars publish to dashboards.",
        {
            "Super Admin / Admins": "Send global notifications, upload public circulars.",
            "HOD / Faculty": "Message department students, issue class circulars.",
            "Student / Parents": "Read-only notifications inbox."
        },
        ["Circular Draft", "Select Channel", "Bulk Dispatch", "Delivery Log"]
    )

    # 17. Grievance
    pdf.add_module_page(
        17, "Grievance",
        ["Complaints", "Anti-Ragging", "Women Cell", "Resolution Tracking"],
        [
            "Anonymous grievance submission portals for security.",
            "Legal compliance trackers for Anti-Ragging and Women Cell cases.",
            "Resolution tickets routing incidents to designated review boards."
        ],
        "Grievances are registered. The system assigns a case number and notifications are sent to the review board. Investigation logs are filed, and status shifts to Resolved after review.",
        {
            "Grievance Committee": "View reports, assign investigators, record resolution logs.",
            "Super Admin": "Oversee case statistics and check compliance.",
            "Student / Faculty": "Submit complaints, track ticket status anonymously."
        },
        ["Complaint File", "Case Routing", "Investigate", "Resolve Close"]
    )

    # 18. Alumni
    pdf.add_module_page(
        18, "Alumni",
        ["Alumni Registration", "Donations", "Events", "Mentorship"],
        [
            "Verified alumni registry matching student graduation records.",
            "Secure donation gateways with tax benefit receipts.",
            "Mentorship network pairing alumni with current students."
        ],
        "Graduating students transfer to the alumni directory. Alumni update details, RSVP to events, select mentorship tracks, and process donations. System generates 80G tax benefit certificates.",
        {
            "Alumni Officer / Admin": "Verify registry profiles, coordinate events, monitor donations.",
            "Alumni": "Manage profile details, process contributions, offer mentorship slots.",
            "Student": "Request mentorship matches, view alumni networks."
        },
        ["Graduate Log", "Mentors Match", "RSVP Event", "Donation Slip"]
    )

    # 19. Administration
    pdf.add_module_page(
        19, "Administration",
        ["User Roles", "Permissions", "Audit Logs", "Backup", "Reports", "Analytics Dashboard"],
        [
            "Granular role permissions configuration tool.",
            "Immutable audit logs detailing every user action.",
            "System database backup schedules."
        ],
        "Super admins use the dashboard to map user credentials to roles. The system records all API calls in an immutable audit log. Automated cron-jobs run database backups nightly.",
        {
            "Super Admin": "Manage system configurations, edit permissions, view audit logs, schedule backups.",
            "Auditors / Deans": "View logs and export analytics report files."
        },
        ["Define Roles", "Audit Track", "Backup DB", "Analytics View"]
    )

    # Save PDF
    output_filename = "college_erp_user_manual.pdf"
    pdf.output(output_filename)
    print(f"SUCCESS: User Manual PDF generated successfully as '{output_filename}'!")

if __name__ == "__main__":
    main()
