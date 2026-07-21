import os
import sys
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
from fpdf import FPDF

class ERPManualPDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_margins(16, 12, 15) # Left margin 16mm to clear 12mm sidebar
        self.set_auto_page_break(auto=True, margin=12)

    def draw_sidebar(self):
        self.set_fill_color(255, 255, 255)
        self.rect(0, 0, 12, 297, "F")
        
        self.set_draw_color(191, 219, 254) # Blue-200
        self.set_line_width(0.4)
        self.line(12, 0, 12, 297)
        
        self.set_text_color(29, 78, 216) # Royal Blue-700
        self.set_font("times", "B", 7.5)
        with self.rotation(270, 7.5, 140):
            self.text(7.5, 140, "@harsha_perfect_solutions")
            
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
            self.set_font("times", "B", 8)
            self.set_text_color(30, 41, 59)
            self.set_x(16)
            self.cell(0, 4.5, "COLLEGE ERP - SYSTEM INTEGRITY & OPERATIONAL BLUEPRINT", align="L", ln=False)
            self.set_font("times", "I", 8)
            self.set_text_color(100, 116, 139)
            self.cell(0, 4.5, f"Section {self.page_no() - 1}", align="R", ln=True)
            
            self.set_draw_color(29, 78, 216) # Royal Electric Blue
            self.set_line_width(0.8)
            self.line(16, 18, 195, 18)
            self.ln(4)

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-12)
            self.set_font("times", "I", 7.5)
            self.set_text_color(148, 163, 184)
            self.cell(0, 8, f"Page {self.page_no()}", align="C")
            
            self.set_x(16)
            self.cell(0, 8, "Enterprise Operations Blueprint | Technical Implementation Edition", align="L")
            
            self.set_x(16)
            self.cell(0, 8, "Release v2.6.0 (LTS)", align="R")

    def draw_paper_airplane(self, x, y):
        self.set_fill_color(186, 230, 253)
        self.set_draw_color(125, 211, 252)
        self.polygon([(x, y), (x + 30, y - 10), (x + 10, y + 20), (x, y)], style="F")
        self.set_fill_color(56, 189, 248)
        self.polygon([(x + 10, y + 20), (x + 15, y + 7), (x + 30, y - 10), (x + 10, y + 20)], style="F")

    def cover_page(self):
        self.add_page()
        
        self.set_fill_color(255, 255, 255)
        self.rect(0, 0, 80, 297, "F")
        
        self.set_fill_color(15, 23, 42)
        self.rect(80, 0, 130, 297, "F")
        
        if os.path.exists("hps_logo.png"):
            self.image("hps_logo.png", x=6, y=25, w=68)
        
        self.draw_paper_airplane(25, 138)
        
        self.set_y(235)
        self.set_x(10)
        self.set_font("times", "B", 10.5)
        self.set_text_color(15, 23, 42)
        self.multi_cell(60, 5, "The Future of Education Starts Here\nAI * Automation * Analytics * Governance", align="C")
        
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
        self.set_text_color(96, 165, 250)
        self.multi_cell(110, 5, 'Comprehensive System Manual & Technical Blueprint.\n\n"Workflows, Operational Processes, Data Schemas, and Role-Based Governance for 19 Enterprise Modules."\n\nExperience the ultimate synergy of AI, real-time analytics, and enterprise database automation.', new_x="LMARGIN", new_y="NEXT")
        
        self.set_fill_color(29, 78, 216)
        self.rect(206, 0, 4, 297, "F")

    def draw_flowchart(self, steps, y_pos):
        self.set_y(y_pos)
        self.set_x(16)
        self.set_font("times", "B", 9)
        self.set_text_color(29, 78, 216)
        self.cell(0, 4.5, "6. System Operational Workflow Flowchart", ln=False)
        self.ln(5)
        
        num_steps = len(steps)
        box_w = 34
        spacing = (178 - (num_steps * box_w)) / (num_steps - 1) if num_steps > 1 else 0
        
        for i, step in enumerate(steps):
            x = 16 + i * (box_w + spacing)
            y = self.get_y()
            
            self.set_fill_color(239, 246, 255)
            self.set_draw_color(191, 219, 254)
            self.set_line_width(0.4)
            self.rect(x, y, box_w, 12, "F" if i % 2 == 0 else "D")
            if i % 2 == 0:
                self.rect(x, y, box_w, 12, "D")
                
            self.set_fill_color(29, 78, 216)
            self.rect(x, y, 2.5, 12, "F")
            
            self.set_fill_color(29, 78, 216)
            self.circle(x + 5, y + 6, 1.8, "F")
            
            self.set_y(y + 4.5)
            self.set_x(x + 3.8)
            self.set_font("times", "B", 5)
            self.set_text_color(255, 255, 255)
            self.cell(2.5, 3, f"0{i+1}", align="C")
            
            self.set_y(y + 1.8)
            self.set_x(x + 7.5)
            self.set_font("times", "B", 6.8)
            self.set_text_color(15, 23, 42)
            self.multi_cell(box_w - 8, 2.8, step, align="C")
            
            self.set_y(y)
            
            if i < num_steps - 1:
                arrow_x_start = x + box_w + 1
                arrow_x_end = arrow_x_start + spacing - 2
                arrow_y = y + 6
                self.set_draw_color(29, 78, 216)
                self.set_line_width(0.5)
                self.line(arrow_x_start, arrow_y, arrow_x_end, arrow_y)
                self.line(arrow_x_end - 1.2, arrow_y - 0.8, arrow_x_end, arrow_y)
                self.line(arrow_x_end - 1.2, arrow_y + 0.8, arrow_x_end, arrow_y)

    def add_module_page(self, num, title, kpis, submodules, dataflow, features, process, impl_progress, roles, flowchart_steps):
        self.add_page()
        
        # Header Badge & Title
        self.set_fill_color(29, 78, 216) # Royal Blue badge
        self.rect(16, self.get_y(), 26, 8.5, "F")
        self.set_y(self.get_y() + 1.5)
        self.set_x(16)
        self.set_font("times", "B", 8.5)
        self.set_text_color(255, 255, 255)
        self.cell(26, 5.5, f"MODULE {num:02d}", align="C", ln=False)

        self.set_x(45)
        self.set_font("times", "B", 13)
        self.set_text_color(15, 23, 42)
        self.cell(0, 5.5, title.upper(), ln=True)
        self.ln(1.5)

        self.set_draw_color(29, 78, 216)
        self.set_line_width(0.7)
        self.line(16, self.get_y(), 195, self.get_y())
        self.ln(3)
        
        # KPI Stat Strip (3 Side-by-Side Highlights)
        self.set_font("times", "B", 7.5)
        kpi_w = 57
        for k_idx, (k_label, k_val) in enumerate(kpis):
            kx = 16 + k_idx * (kpi_w + 4)
            ky = self.get_y()
            self.set_fill_color(248, 250, 252)
            self.set_draw_color(226, 232, 240)
            self.rect(kx, ky, kpi_w, 8.5, "F")
            self.rect(kx, ky, kpi_w, 8.5, "D")
            
            self.set_fill_color(29, 78, 216)
            self.rect(kx, ky, 2, 8.5, "F")

            self.set_y(ky + 1)
            self.set_x(kx + 3.5)
            self.set_text_color(100, 116, 139)
            self.set_font("times", "B", 6)
            self.cell(kpi_w - 5, 2.8, k_label.upper(), ln=True)

            self.set_x(kx + 3.5)
            self.set_text_color(29, 78, 216)
            self.set_font("times", "B", 8)
            self.cell(kpi_w - 5, 3.8, k_val, ln=True)
            self.set_y(ky)

        self.set_y(self.get_y() + 10.5)

        # 1. Key Sub-Modules (Dynamic Height Card)
        self.set_font("times", "B", 9.5)
        self.set_text_color(29, 78, 216)
        self.set_x(16)
        self.cell(0, 4.5, "1. Key Sub-Modules & Core Capabilities", ln=True)
        
        sub_text = " | ".join(submodules)
        self.set_font("times", "B", 7.5)
        # Calculate dynamic lines using dry_run=True, output="LINES"
        lines_sub = self.multi_cell(171, 3.4, sub_text, dry_run=True, output="LINES")
        card_h_sub = max(8.5, len(lines_sub) * 3.4 + 3.5)
        
        card_y = self.get_y()
        self.set_fill_color(239, 246, 255)
        self.rect(16, card_y, 179, card_h_sub, "F")
        self.set_draw_color(191, 219, 254)
        self.rect(16, card_y, 179, card_h_sub, "D")
        self.set_fill_color(29, 78, 216)
        self.rect(16, card_y, 2.5, card_h_sub, "F")
        
        self.set_y(card_y + 1.8)
        self.set_x(21)
        self.set_text_color(30, 64, 175)
        self.multi_cell(171, 3.4, sub_text, ln=True)
        self.set_y(card_y + card_h_sub + 2.5)

        # 2. Workflow & Data Flow Diagram (Dynamic Height Card - Zero Overflow)
        self.set_font("times", "B", 9.5)
        self.set_text_color(29, 78, 216)
        self.set_x(16)
        self.cell(0, 4.5, "2. Workflow & Architectural Data Flow", ln=True)

        self.set_font("times", "B", 7.5)
        lines_df = self.multi_cell(171, 3.5, dataflow, dry_run=True, output="LINES")
        card_h_df = max(8.5, len(lines_df) * 3.5 + 3.5)

        card_y_df = self.get_y()
        self.set_fill_color(248, 250, 252)
        self.rect(16, card_y_df, 179, card_h_df, "F")
        self.set_draw_color(203, 213, 225)
        self.rect(16, card_y_df, 179, card_h_df, "D")
        self.set_fill_color(14, 165, 233)
        self.rect(16, card_y_df, 2.5, card_h_df, "F")

        self.set_y(card_y_df + 1.8)
        self.set_x(21)
        self.set_text_color(15, 23, 42)
        self.multi_cell(171, 3.5, dataflow, ln=True)
        self.set_y(card_y_df + card_h_df + 2.5)
        
        # 3. Operational Features
        self.set_font("times", "B", 9.5)
        self.set_text_color(29, 78, 216)
        self.set_x(16)
        self.cell(0, 4.5, "3. Operational Features & Business Rules", ln=True)
        
        self.set_font("times", "", 7.8)
        self.set_text_color(51, 65, 85)
        for feat in features:
            self.set_x(19)
            self.set_text_color(29, 78, 216)
            self.cell(4, 3.6, "[+]", ln=False)
            self.set_text_color(51, 65, 85)
            self.multi_cell(170, 3.6, feat, ln=True)
        self.ln(2.5)
        
        # 4. Detailed Working Process
        self.set_font("times", "B", 9.5)
        self.set_text_color(29, 78, 216)
        self.set_x(16)
        self.cell(0, 4.5, "4. Detailed Working Process & Execution", ln=True)
        
        self.set_draw_color(29, 78, 216)
        self.set_line_width(0.7)
        start_y = self.get_y() + 1
        
        self.set_x(21)
        self.set_font("times", "", 7.8)
        self.set_text_color(51, 65, 85)
        self.multi_cell(173, 3.6, process, ln=True)
        
        self.line(18, start_y, 18, self.get_y() - 1)
        self.ln(2.5)

        # 5. Technical Implementation & Architecture Stack (Dynamic Height Card)
        self.set_font("times", "B", 9.5)
        self.set_text_color(29, 78, 216)
        self.set_x(16)
        self.cell(0, 4.5, "5. Implementation Stack & Progress Blueprint", ln=True)

        card_y_impl = self.get_y()
        self.set_fill_color(241, 245, 249)
        self.rect(16, card_y_impl, 179, 13, "F")
        self.set_draw_color(203, 213, 225)
        self.rect(16, card_y_impl, 179, 13, "D")
        self.set_fill_color(16, 185, 129)
        self.rect(16, card_y_impl, 2.5, 13, "F")

        self.set_y(card_y_impl + 1.5)
        self.set_x(21)
        self.set_font("times", "B", 7.2)
        self.set_text_color(15, 23, 42)
        self.cell(24, 3.4, "UI Stack:", ln=False)
        self.set_font("times", "", 7.2)
        self.set_text_color(30, 64, 175)
        self.cell(64, 3.4, impl_progress["ui"], ln=False)

        self.set_font("times", "B", 7.2)
        self.set_text_color(15, 23, 42)
        self.cell(24, 3.4, "Backend:", ln=False)
        self.set_font("times", "", 7.2)
        self.set_text_color(30, 64, 175)
        self.cell(0, 3.4, impl_progress["backend"], ln=True)

        self.set_x(21)
        self.set_font("times", "B", 7.2)
        self.set_text_color(15, 23, 42)
        self.cell(24, 3.4, "Database:", ln=False)
        self.set_font("times", "", 7.2)
        self.set_text_color(30, 64, 175)
        self.cell(64, 3.4, impl_progress["db"], ln=False)

        self.set_font("times", "B", 7.2)
        self.set_text_color(15, 23, 42)
        self.cell(24, 3.4, "Status:", ln=False)
        self.set_font("times", "B", 7.2)
        self.set_text_color(16, 185, 129)
        self.cell(0, 3.4, impl_progress["status"], ln=True)
        self.set_y(card_y_impl + 15.5)

        # 6. Flowchart (At bottom)
        self.draw_flowchart(flowchart_steps, self.get_y())

def main():
    pdf = ERPManualPDF()
    
    # 1. Cover Page
    pdf.cover_page()
    
    # 2. Table of Contents
    pdf.add_page()
    
    pdf.set_fill_color(29, 78, 216)
    pdf.rect(16, 10, 179, 2, "F")
    
    pdf.ln(8)
    pdf.set_font("times", "B", 18)
    pdf.set_text_color(29, 78, 216)
    pdf.set_x(16)
    pdf.cell(0, 10, "TABLE OF CONTENTS", ln=True, align="C")
    pdf.ln(4)
    
    modules_list = [
        "1. Admission Management", "2. Student Information System (SIS)", 
        "3. Academic Management", "4. Attendance", "5. Examination", 
        "6. Faculty ERP", "7. Learning Management", "8. Placement Cell", 
        "9. Hostel", "10. Transport", "11. Library", "12. Finance", 
        "13. HRMS", "14. Inventory", "15. Accreditation", "16. Communication", 
        "17. Grievance", "18. Alumni", "19. Administration"
    ]
    
    pdf.set_font("times", "", 9.5)
    for i, mod in enumerate(modules_list):
        page_num = i + 3
        if i % 2 == 0:
            pdf.set_fill_color(248, 250, 252)
        else:
            pdf.set_fill_color(255, 255, 255)
            
        pdf.set_x(16)
        pdf.set_text_color(29, 78, 216)
        pdf.cell(12, 8.5, f"CH {i+1:02d}", ln=False, fill=True)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(137, 8.5, f"   {mod.split('. ')[1]}", ln=False, fill=True)
        pdf.set_text_color(29, 78, 216)
        pdf.set_font("times", "B", 9)
        pdf.cell(0, 8.5, f"Page {page_num}   ", ln=True, align="R", fill=True)
        pdf.set_font("times", "", 9.5)
        
        pdf.set_draw_color(226, 232, 240)
        pdf.line(16, pdf.get_y(), 195, pdf.get_y())
        
    # ALL 19 MODULES WITH ZERO-OVERFLOW DYNAMIC WRAPPING
    # 1. Admission Management
    pdf.add_module_page(
        1, "Admission Management",
        [("System Type", "100% Online Portal"), ("Seat Allocation", "Cutoff Engine"), ("Student ID", "Auto-Generated")],
        ["Online Application Portal", "Quota Matrix", "Document Verification", "Fee Receipt Sync", "Seat Allotment Engine", "Roll Number Allocation", "Branch Placement"],
        "[Prospect Reg] -> [Document Verify] -> [Cutoff Calculation] -> [Quota Check] -> [Seat Allot & Roll No]",
        [
            "Interactive student application portal with real-time validation checks for document uploads.",
            "Merit list calculation and automated quota screening (General / Management / NRI).",
            "Automatic student profile creation and institutional registration number generation upon fee payment."
        ],
        "Prospects register online and upload certificates. System validates cutoff percentages, assigns document verification slots, records quota reservations, and locks seats upon fee payment receipt. Finally, branch allocations and roll numbers generate.",
        {
            "ui": "RegisterStudent.tsx, AdmissionDashboard.tsx",
            "backend": "authService.ts, communicationService.ts",
            "db": "students, departments, admission_applications",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Super Admin / Admins": "Full administrative control. Modify cutoff rules, override quota reservations, and approve document waivers.",
            "Principal / Dean": "Approve final seat allocation lists, view merit rank logs, and monitor intake analytics.",
            "Student Applicant": "Fill admission forms, upload certificates, pay registration fees, and track application status."
        },
        ["Registration", "Verification", "Fee Payment", "Seat Allot"]
    )

    # 2. Student Information System (SIS)
    pdf.add_module_page(
        2, "Student Information System (SIS)",
        [("Profile Record", "360 Card View"), ("Certificates", "Instant Generator"), ("Alumni Bridge", "Auto-Graduation")],
        ["Student 360 Card", "Academic History", "Certificate Generator", "Parent Contact Sync", "ID Card Printer", "Discipline Register", "Graduation Audit"],
        "[Enrolled Student] -> [360 Master Profile] -> [Conduct History] -> [Certificate Generator] -> [Alumni Sync]",
        [
            "Central 360-degree digital master profile card for every enrolled student.",
            "Automated certificate generator (Bonafide, Transfer, Conduct, Course Completion).",
            "Continuous record tracking that seamlessly archives profiles into the Alumni database upon graduation."
        ],
        "Students input profile details and upload photo proofs. The system formats printable digital ID cards, maps academic semester records, tracks disciplinary logs, and updates parent details. On graduation, profiles auto-transfer to the Alumni database.",
        {
            "ui": "StudentDashboard.tsx, StudentProfile.tsx",
            "backend": "studentService.ts",
            "db": "students, certificates, parent_details",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Super Admin / Admins": "Full read/write rights. Configure certificate templates and manage disciplinary records.",
            "HOD / Faculty": "View student profile cards, monitor academic progression, and access parent contact details.",
            "Student / Parents": "Read-only access to personal profiles, grade cards, and address change submission."
        },
        ["Profile Reg", "History Log", "ID Card Gen", "Alumni Sync"]
    )

    # 3. Academic Management
    pdf.add_module_page(
        3, "Academic Management",
        [("Curriculum", "CBCS Regulation"), ("Electives", "Merit Auto-Alloc"), ("Timetable", "Clash-Free Engine")],
        ["Academic Calendar", "Semester Structuring", "Course Registration", "Curriculum Regulations", "Credit Banking", "Open Electives", "Visual Timetables"],
        "[Regulation Setup] -> [Curriculum & Semester] -> [Clash-Free Timetable] -> [Elective Selection] -> [Enrollment Approved]",
        [
            "Configurable curriculum regulations (Choice Based Credit System - CBCS / R23 / R20).",
            "Automatic elective course allocation engine based on student preference and merit ranks.",
            "Clash-free visual timetabling matrix mapping classroom capacity and faculty availability."
        ],
        "Deans create semesters and define course codes under regulations. Faculty submit weekly lecture availability. The system compiles visual timetables. Students log in during course registration windows to select open electives.",
        {
            "ui": "DeanAcademicAdmin.tsx, GovernanceView.tsx",
            "backend": "academicService.ts",
            "db": "curriculums, courses, semesters, timetables",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Super Admin / Deans": "Create semesters, regulations, configure course credits, and publish academic calendars.",
            "HOD / Faculty": "Upload syllabus blueprints, verify course mappings, and manage lab allocations.",
            "Student": "Select open electives and complete semester course registrations."
        },
        ["Curriculum", "Semester Set", "Slot Alloc", "Enrollment"]
    )

    # 4. Attendance
    pdf.add_module_page(
        4, "Attendance",
        [("Tracking Mode", "Biometric / RFID"), ("Shortage Alert", "75% Threshold"), ("Parent Alert", "Automated SMS")],
        ["Biometric RFID Sync", "Daily Class Register", "75% Shortage Tracker", "Parent SMS Trigger", "Duty Leave Approvals", "Department Analytics"],
        "[RFID Hardware Check-in] -> [Class Register Entry] -> [75% Shortage Run] -> [Warning List] -> [Parent SMS Dispatch]",
        [
            "Real-time biometric RFID hardware integration pulling turnstile punch logs directly to DB.",
            "Automated attendance shortage calculation flags students below the mandatory 75% threshold.",
            "SMS messaging engine dispatching immediate absentee alerts to registered parent mobile numbers."
        ],
        "Biometric devices capture entry logs. Faculty review and verify class sheets. The shortage calculator evaluates weekly compliance scores, generates warning letters, and triggers SMS alerts to parents.",
        {
            "ui": "AttendanceModule.tsx, AttendanceNotifications.tsx",
            "backend": "attendanceService.ts, notificationController.js",
            "db": "attendance_logs, attendance_shortages, notification_logs",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Super Admin / Admin": "Configure biometric ports, clear hardware buffers, and approve attendance waivers.",
            "HOD / Faculty": "Submit daily class attendance sheets, review department percentages, and sign duty leaves.",
            "Student / Parent": "View monthly attendance percentages, calendar check-in logs, and warning notices."
        },
        ["RFID Check", "Daily Register", "Shortage Run", "Parent Alert"]
    )

    # 5. Examination (COE Suite)
    pdf.add_module_page(
        5, "Examination (Controller Suite)",
        [("Evaluation", "SGPA/CGPA Engine"), ("Security", "AES-256 Lock"), ("Revaluation", "Instant Grade Sync")],
        ["Exam Schedules", "Hall Ticket Clearance", "Encrypted Question Bank", "Exam Centers", "Invigilator Roster", "Seating Matrix", "Grace Marks Board", "Malpractice Verdicts"],
        "[Exam Schedule & Encrypt QP] -> [Hall Ticket Clearance] -> [Seating Matrix] -> [Moderation & Grace Marks] -> [COE Result Publish]",
        [
            "Dedicated Controller of Examinations (COE) Governance Suite with outcome-based SGPA/CGPA computation.",
            "Automated Hall Ticket clearance and withhold controls for fee defaulters or low attendance (<65%).",
            "AES-256 Question Paper encryption, invigilation duty rosters, and anti-malpractice seating matrix.",
            "Board moderation, revaluation grade updates, grace marks (+1/+2) sanctioning, and malpractice verdicts."
        ],
        "Exam branch creates timetables and allocates centers. Candidates clear fee/attendance checks to unlock hall tickets. Question papers undergo AES-256 encryption. Hall invigilators track live attendance. Internal and external marks are moderated, results process to SGPA/CGPA, and grade cards publish.",
        {
            "ui": "DeanExaminationAdmin.tsx, ExaminationControlModule.tsx",
            "backend": "examService.ts",
            "db": "exam_schedules, hall_tickets, results, malpractice_cases",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Controller of Examinations (COE) / Dean": "Complete administrative authority: Approve results, sanction grace marks, execute malpractice verdicts, lock encrypted question papers.",
            "HOD / Faculty": "Upload internal assessment marks, confirm invigilation duties, and verify moderation keys.",
            "Student": "Register for exams, download hall tickets, view SGPA/CGPA results, and apply for revaluation."
        },
        ["Schedule & Encrypt", "Hall Tickets", "Hall Attendance", "COE Result Publish"]
    )

    # 6. Faculty ERP
    pdf.add_module_page(
        6, "Faculty ERP",
        [("Workload", "Weekly Tracker"), ("Research Log", "Scopus & NAAC"), ("Appraisal", "Self-Assessment")],
        ["Faculty Profile", "Workload Manager", "Leave Portal", "Attendance Register", "Research Publications", "Grant Tracker", "Performance Appraisal", "Payroll Ledger"],
        "[Workload Allocation] -> [Lecture & Lab Run] -> [Research Pub Log] -> [Appraisal Scoring] -> [Payroll Review]",
        [
            "Workload manager tracking weekly lecture, tutorial, and lab hours against statutory guidelines.",
            "Research and publication repository cataloging Scopus, Web of Science, and UGC journal papers.",
            "Self-appraisal digital sheets linked directly to NAAC/NBA accreditation criteria."
        ],
        "Faculty update profiles, upload research citations, submit leave requests, and track weekly lecture schedules. Department heads review performance ratings, calculate appraisal scores, and approve leave allocations.",
        {
            "ui": "FacultyDashboard.tsx, FacultyProfile.tsx",
            "backend": "facultyService.ts",
            "db": "faculty_profiles, workloads, leaves, research_publications",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Super Admin / Admin": "Approve promotions, modify salary scale bands, and configure teaching workload limits.",
            "HOD / Dean": "Review faculty workloads, approve research grant requests, and sanction leaves.",
            "Faculty": "Manage personal profiles, submit leave applications, upload research publications, and view payslips."
        },
        ["Workload Map", "Leave Request", "Research Pub", "Appraisal Run"]
    )

    # 7. Learning Management System (LMS)
    pdf.add_module_page(
        7, "Learning Management System",
        [("Content Hub", "PDF / MP4 / Docs"), ("Assessment", "Online Quiz Key"), ("Submission", "Plagiarism Check")],
        ["Study Materials", "Video Lectures", "Digital Assignments", "Online Quiz Engine", "Discussion Forum", "Virtual Classroom", "Gradebook Sync"],
        "[Content Upload] -> [Assignment Posting] -> [Timed Online Quiz] -> [Plagiarism Check] -> [Gradebook Auto-Sync]",
        [
            "Central study material repository supporting PDF notes, video lectures, and presentation decks.",
            "Automated online quiz modules featuring randomized question banks and instant key grading.",
            "Assignment submission portal with deadline enforcement and plagiarism check indicators."
        ],
        "Faculty create course modules, upload study files, and schedule timed quizzes. Students access study materials, watch video lectures, submit assignments, and participate in discussion threads. Quiz scores auto-sync to gradebooks.",
        {
            "ui": "LMSCourseView.tsx, AssignmentSubmission.tsx",
            "backend": "lmsService.ts",
            "db": "lms_courses, materials, assignments, quizzes",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "HOD / Faculty": "Upload course materials, create online quizzes, evaluate assignments, and monitor forums.",
            "Student": "Download study notes, stream video lectures, submit assignments, and attempt online quizzes."
        },
        ["Course Setup", "Material Add", "Assignments", "Quiz Grade"]
    )

    # 8. Placement Cell
    pdf.add_module_page(
        8, "Placement Cell",
        [("Eligibility", "CGPA / Backlog Filter"), ("Recruiter Portal", "Job & Drive Post"), ("Analytics", "Package & Highest")],
        ["Company Registry", "Job Drive Postings", "Eligibility Screener", "Student Applications", "Aptitude Testing", "Interview Schedule", "Offer Letter Vault", "Placement Analytics"],
        "[Recruiter Drive Post] -> [CGPA & Backlog Filter] -> [Aptitude Test & Interview] -> [Digital Offer Letter] -> [Package Stats]",
        [
            "Automated eligibility criteria filter screening candidates by minimum CGPA and active backlog limits.",
            "Corporate recruiter portal for posting vacancies, filtering candidate resumes, and managing drive schedules.",
            "Placement analytics dashboard visualizing branch-wise placement percentages, average packages, and top recruiters."
        ],
        "Placement officer registers corporate recruiters. Companies post vacancies with criteria. Eligible students apply. System schedules online aptitude tests and interview panels. Selected candidates receive digital offer letters.",
        {
            "ui": "PlacementDashboard.tsx, DriveDetailsModal.tsx",
            "backend": "placementService.ts",
            "db": "placement_drives, job_applications, offer_letters",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Placement Officer (TPO)": "Register corporate profiles, set CGPA eligibility thresholds, schedule drives, and log offer letters.",
            "Recruiter": "Post job drives, review filtered student profiles, and update candidate hiring status.",
            "Student": "View active placement drives, check eligibility status, submit applications, and download offer letters."
        },
        ["Eligibility", "Jobs Listing", "Interviews", "Offer Placed"]
    )

    # 9. Hostel Management
    pdf.add_module_page(
        9, "Hostel Management",
        [("Room Matrix", "Live Vacancy Map"), ("Attendance", "Night Check-in"), ("Pass System", "Digital Outing")],
        ["Room Allocation", "Night Attendance", "Hostel Fee Ledger", "Visitor Registry", "Outing Gatepasses", "Maintenance Complaints", "Mess Menu Manager"],
        "[Online Room App] -> [Fee Verification] -> [Bed Matrix Alloc] -> [Night Biometric Sync] -> [Outing & Complaints]",
        [
            "Live bed matrix displaying vacant, occupied, and maintenance-blocked room allocations in real time.",
            "Digital night attendance register with mobile biometric check-in integration for wardens.",
            "Automated complaint ticketing system routing plumbing, electrical, and mess issues to maintenance staff."
        ],
        "Students apply for hostel rooms online. System verifies fee clearance and allocates bed numbers. Wardens record daily night attendance. Outing gatepasses require warden approval and security gate validation.",
        {
            "ui": "HostelDashboard.tsx, RoomMatrixView.tsx",
            "backend": "hostelService.ts",
            "db": "hostel_rooms, hostel_allocations, night_attendance, outing_passes",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Hostel Warden": "Allocate rooms, verify night attendance logs, approve outing passes, and resolve maintenance tickets.",
            "Accounts Manager": "Post hostel fees, track payment dues, and issue clearance receipts.",
            "Student Resident": "Apply for room allocation, submit outing requests, log maintenance complaints, and rate mess menus."
        },
        ["Room Request", "Outing Pass", "Check-in Log", "Complaints"]
    )

    # 10. Transport Management (Clean Multi-Line Dataflow)
    pdf.add_module_page(
        10, "Transport Management",
        [("Tracking", "Live GPS Coordinates"), ("Routes", "Stop & Capacity Map"), ("Pass Control", "QR / RFID Pass")],
        ["Route Management", "Bus Capacity Map", "Live GPS Tracking", "Driver Allocations", "Transport Fee Ledger", "Digital Bus Passes", "Vehicle Maintenance"],
        "[Route & Stop Setup] -> [Route Opt & Fee Pay] -> [Digital Bus Pass] -> [Live GPS Streaming] -> [Fleet Maintenance]",
        [
            "Route mapper tracking bus stops, fare zones, and seating capacities across fleet vehicles.",
            "Live GPS vehicle location integration feeding real-time coordinates to student/parent dashboards.",
            "Digital transport fee collection register linked directly to automated bus boarding pass issuance."
        ],
        "Transport manager defines bus routes, pick-up stops, and assigns drivers. Students select routes and pay transport fees online. Digital bus passes generate, and live GPS coordinates stream during transit hours.",
        {
            "ui": "TransportDashboard.tsx, GPSLiveTracker.tsx",
            "backend": "transportService.ts",
            "db": "bus_routes, vehicles, transport_allocations, bus_passes",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Transport Officer": "Define routes, assign vehicles and drivers, monitor maintenance schedules, and audit fleet logs.",
            "Accounts Cell": "Manage transport fee receipts and issue digital bus boarding passes.",
            "Student / Parent": "View bus route schedules, track live GPS locations on mobile devices, and download bus passes."
        },
        ["Route Mapped", "Bus Allocation", "GPS Live", "Pass Release"]
    )

    # 11. Library Management
    pdf.add_module_page(
        11, "Library Management",
        [("Search Engine", "OPAC Catalog"), ("Tracking", "Barcode / RFID"), ("Fine Calculator", "Auto-Dues Sync")],
        ["OPAC Book Catalog", "Barcode Issue / Return", "Overdue Fine Calculator", "Digital E-Books", "Journal Subscription", "Member Registry", "Book Reservation"],
        "[OPAC Book Catalog] -> [Barcode/RFID Checkout] -> [Return Due Tracking] -> [Overdue Fine Run] -> [Student Fee Dues Sync]",
        [
            "Online Public Access Catalog (OPAC) index for physical books, journals, and digital research papers.",
            "Barcode/RFID scanner integration executing check-outs and returns within seconds.",
            "Automated library fine calculation engine linked directly to student financial fee ledgers."
        ],
        "Librarians scan book barcodes for check-outs. System monitors return due dates and sends overdue reminders. Overdue fines auto-calculate daily and sync to the student fee ledger.",
        {
            "ui": "LibraryDashboard.tsx, OPACCatalogView.tsx",
            "backend": "libraryService.ts",
            "db": "library_books, book_issues, fines, digital_resources",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Librarian": "Manage book catalog, scan barcodes, override library fines, upload e-books, and monitor circulation.",
            "Student / Faculty": "Search OPAC catalog, reserve books online, view checkout history, access e-books, and pay fines."
        },
        ["Catalog Find", "Barcode Scan", "Book Issue", "Fine Sync"]
    )

    # 12. Finance & Accounting
    pdf.add_module_page(
        12, "Finance & Accounting",
        [("Ledger", "Tuition & Fee Dues"), ("Scholarships", "Scheme Adjustments"), ("Auditing", "GST & Balance Sheet")],
        ["Tuition Fee Ledger", "Online Payment Gateway", "Scholarship Adjustments", "Staff Payroll Disbursements", "Vendor Invoices", "GST Compliance", "Financial Balance Sheets"],
        "[Fee Structure Setup] -> [Online Payment Gateway] -> [Scholarship Ledger Adjust] -> [Vendor & Payroll] -> [Annual Audit Sheet]",
        [
            "Tuition fee ledger managing online payment gateways, installment plans, and transaction receipts.",
            "Scholarship adjustment engine mapping government schemes, merit concessions, and fee waivers.",
            "Automated balance sheet, P&L statement, TDS filing, and GST compliance report generator."
        ],
        "Finance department generates fee structures. Students pay fees online via payment gateways. Accounts verify scholarship grants, process vendor bills, execute staff payroll disbursements, and generate annual audit ledgers.",
        {
            "ui": "FinanceDashboard.tsx, FeeReceiptModal.tsx",
            "backend": "financeService.ts",
            "db": "fee_structures, fee_payments, scholarships, vendor_invoices",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Super Admin / Finance Head": "Full financial control: Modify fee structures, approve vendor payments, generate balance sheets.",
            "Accounts Team": "Collect tuition fees, verify scholarship adjustments, disburse staff salaries, and file GST returns.",
            "Student / Parent": "View fee balance ledgers, make online tuition payments, and download official fee receipts."
        },
        ["Tuition Bills", "Scholarships", "Ledger Entry", "Audit Sheets"]
    )

    # 13. HRMS & Staff Payroll
    pdf.add_module_page(
        13, "HRMS & Staff Payroll",
        [("Personnel", "Digital Staff Files"), ("Attendance", "Biometric Sync"), ("Payroll", "Scale & Allowances")],
        ["Employee Directory", "Recruitment Portal", "Biometric Attendance Sync", "Leave Approval Workflow", "Salary Scale Engine", "Pay Slip Generator", "Service History Log"],
        "[Employee Registration] -> [Biometric Punch Sync] -> [Leave Deduction Run] -> [Payroll Calculation] -> [Digital Payslip Release]",
        [
            "Central employee digital repository storing qualifications, service history, and statutory documents.",
            "Biometric RFID check-in sync evaluating working hours, overtime, and leave deductions automatically.",
            "Automated payroll disbursement engine calculating basic pay, DA, HRA, PF, TDS, and generating PDF payslips."
        ],
        "HR creates employee profiles. Biometric hardware syncs daily staff attendance. Department heads approve leaves. Payroll engine computes monthly salaries, applies tax/PF deductions, and generates digital payslips.",
        {
            "ui": "HRMSDashboard.tsx, PayslipViewerModal.tsx",
            "backend": "hrmsService.ts",
            "db": "employees, staff_attendance, leave_requests, payrolls",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Super Admin / HR Manager": "Create employee records, configure salary bands, approve leaves, and disburse payroll.",
            "Accounts Officer": "Manage tax deductions, process PF ledgers, and execute bank salary transfer files.",
            "Faculty / Staff": "View personal service profile, submit leave requests, track biometric logs, and download payslips."
        },
        ["Profile Reg", "Biometric Sync", "Leave Approval", "Disburse Pay"]
    )

    # 14. Inventory & Asset Control
    pdf.add_module_page(
        14, "Inventory & Asset Control",
        [("Asset Ledger", "WDV Depreciation"), ("Stock Alert", "Low Volume Warning"), ("Security", "Gatepass Audit")],
        ["Asset Master Register", "Lab Equipment Log", "Purchase Order (PO)", "Consumables Stock", "Depreciation Calculator", "Maintenance Tickets", "Outward Gatepasses"],
        "[PO Request & Approve] -> [Asset Log & WDV Depreciation] -> [Stock Level Warning] -> [Maintenance Ticket] -> [Outward Gatepass]",
        [
            "Asset register tracking initial capital costs, location assignments, and Written Down Value (WDV) depreciation.",
            "Stock consumable indicator raising automatic warnings when lab supplies drop below safety thresholds.",
            "Outward gatepass log tracking equipment sent out for servicing, calibration, or inter-campus transfer."
        ],
        "Department custodians log equipment details. Purchase requests are approved. Stock levels auto-adjust on item issuance. Maintenance tickets trigger repair schedules, and gatepasses authorize security checks.",
        {
            "ui": "InventoryDashboard.tsx, GatepassModal.tsx",
            "backend": "inventoryService.ts",
            "db": "assets, purchase_orders, inventory_stock, gatepasses",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Super Admin / Admin": "Full asset ledger authority: Approve purchase orders, authorize gatepasses, and write off assets.",
            "Accounts": "Verify purchase order invoices, update asset ledger values, and execute stock inventory audits.",
            "HOD / Lab Custodian": "Log equipment status, request consumables restocking, and create maintenance tickets."
        },
        ["PO Request", "Stock Check", "Asset Logging", "Gatepass Log"]
    )

    # 15. Accreditation (NBA / NAAC)
    pdf.add_module_page(
        15, "Accreditation (NBA / NAAC)",
        [("NAAC SSR", "Criteria 1-7 Vault"), ("NBA OBE", "CO-PO Attainment"), ("Certificates", "Auto Generator")],
        ["NAAC Criteria Repository", "NBA CO-PO Attainment", "NIRF / AISHE Exporter", "Event Proposals", "Participant Check-in", "Evidence Vault", "Digital Certificate Signer"],
        "[Event Proposal] -> [Principal & HOD Sign] -> [Event Check-in & Evidence Ingest] -> [CO-PO Attainment] -> [NAAC Vault & Certs]",
        [
            "NAAC Self-Study Report (SSR) evidence repository supporting criteria-wise document categorization.",
            "NBA Outcome-Based Education (OBE) matrix mapping Course Outcomes (CO) to Program Outcomes (PO).",
            "Event workflow engine managing approval flows, attendance verification, and auto-signed digital certificates."
        ],
        "Faculty submit event proposals. HOD and Principal approve. Students register and attend. Event coordinators upload reports and photo proofs into the accreditation vault. System generates signed participant certificates.",
        {
            "ui": "AdminAccreditation.tsx, EventProposalModal.tsx",
            "backend": "accreditationService.ts, accreditationController.js",
            "db": "accreditation_events, accreditation_evidence, co_po_mappings",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Super Admin": "Manage accreditation parameters, export NAAC/NBA datasets, and oversee evidence repositories.",
            "Principal / Dean": "Approve event proposals, verify accreditation criteria files, and authorize final SSR submissions.",
            "HOD / Coordinator": "Map CO-PO metrics, upload department evidence files, mark event attendance, and issue certificates.",
            "Student": "Register for academic events, check-in to sessions, and download verified participation certificates."
        },
        ["Event Proposal", "Event Approved", "Certificates", "Evidence Safe"]
    )

    # 16. Communication & Circulars
    pdf.add_module_page(
        16, "Communication & Circulars",
        [("Channels", "SMS / Email / Push"), ("Broadcasting", "Instant Dispatch"), ("Archive", "Public Circulars")],
        ["Multi-Channel Broadcast", "Official Circulars", "Parent SMS Engine", "Email Newsletter", "Push Notifications", "Notice Board Portal", "Delivery Logs"],
        "[Circular Draft] -> [Select Target Roles] -> [Multi-Channel Broadcast] -> [Notice Board Feed] -> [Delivery Audit Log]",
        [
            "Multi-channel broadcast engine dispatching announcements via SMS, Email, Push Notifications, and WhatsApp.",
            "Official circular archive displaying verified administrative orders on role dashboards.",
            "Automated trigger notifications for fee payment reminders, exam dates, emergency holidays, and event updates."
        ],
        "Authorized staff draft announcements and select target audiences (Students / Parents / Staff). Dispatch engine transmits bulk messages across channels while simultaneously publishing circulars to user dashboards.",
        {
            "ui": "AdminCommunication.tsx, BroadcastComposer.tsx",
            "backend": "communicationService.ts, communicationController.js",
            "db": "communication_broadcasts, circulars, notification_logs",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Super Admin / Admins": "Send institution-wide notifications, publish official circulars, and monitor delivery logs.",
            "HOD / Faculty": "Message department students, broadcast class announcements, and issue academic notices.",
            "Student / Parents": "Read-only access to circular notice boards and notification inbox feeds."
        },
        ["Circular Draft", "Select Channel", "Bulk Dispatch", "Delivery Log"]
    )

    # 17. Grievance & Redressal
    pdf.add_module_page(
        17, "Grievance & Redressal",
        [("Privacy", "100% Anonymous Mode"), ("Compliance", "Anti-Ragging Vault"), ("Tracking", "Resolution Tickets")],
        ["Anonymous Complaint Box", "Anti-Ragging Committee", "Women Cell Portal", "Case Assignment", "Investigation Log", "Hearing Schedule", "Resolution Audit"],
        "[File Complaint (Anonymous/Named)] -> [Committee Ticket Route] -> [Hearing & Evidence] -> [Resolution Order] -> [Case Closed]",
        [
            "100% anonymous complaint submission option preserving student and staff privacy during sensitive filings.",
            "Legal compliance trackers for Anti-Ragging, Internal Complaints Committee (ICC), and Women Cell regulations.",
            "Resolution ticketing system tracking case assignments, hearing dates, investigation notes, and final orders."
        ],
        "Complainant registers a grievance online. System assigns a confidential tracking ticket. Designated committee reviews details, conducts hearings, logs investigation notes, and issues official resolution orders.",
        {
            "ui": "GrievancePortal.tsx, CaseDetailsModal.tsx",
            "backend": "grievanceService.ts",
            "db": "grievances, grievance_hearings, resolution_orders",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Grievance Committee": "Review filed complaints, assign investigators, record hearing notes, and issue resolution orders.",
            "Super Admin": "Monitor grievance resolution statistics, verify legal compliance, and audit pending case logs.",
            "Student / Staff": "Submit grievances (anonymous or named), upload supporting evidence, and track ticket status."
        },
        ["Complaint File", "Case Routing", "Investigate", "Resolve Close"]
    )

    # 18. Alumni Relations
    pdf.add_module_page(
        18, "Alumni Relations",
        [("Directory", "Verified Alumni Log"), ("Mentorship", "Student Match"), ("Donations", "80G Tax Receipt")],
        ["Alumni Directory", "Career Job Portal", "Mentorship Network", "Reunion Events", "Donation Gateway", "Success Stories", "80G Tax Receipts"],
        "[Graduation Database Sync] -> [Alumni Directory Update] -> [Mentorship & Job Posting] -> [Donation] -> [80G Tax Receipt]",
        [
            "Verified alumni directory automatically populated from student graduation database records.",
            "Mentorship network pairing experienced alumni professionals with current students for career guidance.",
            "Secure donation gateway issuing official tax benefit receipts (80G) for institutional contributions."
        ],
        "Graduating students transition to the alumni directory. Alumni update employment details, post job referral openings, offer mentorship slots, and make institutional donations. System issues automated tax receipts.",
        {
            "ui": "AlumniDashboard.tsx, MentorshipModal.tsx",
            "backend": "alumniService.ts",
            "db": "alumni_profiles, mentorship_requests, alumni_donations",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Alumni Officer / Admin": "Verify alumni directory records, organize reunion events, and manage donation ledgers.",
            "Alumni": "Update professional profiles, post job/internship openings, offer mentorship, and donate funds.",
            "Student": "Browse alumni directory, apply for alumni job referrals, and request mentorship pairings."
        },
        ["Graduate Log", "Mentors Match", "RSVP Event", "Donation Slip"]
    )

    # 19. Administration & Security
    pdf.add_module_page(
        19, "Administration & Security",
        [("RBAC", "19-Module Matrix"), ("Audit Log", "Immutable Tracking"), ("DB Backup", "Automated Schedules")],
        ["Role Permissions Matrix", "Unified User Control", "Immutable Audit Logs", "System Configuration", "Security Hardening", "Automated DB Backups", "Global Analytics"],
        "[Define RBAC Permissions] -> [User Access Hardening] -> [Immutable Audit Trail Log] -> [Encrypted Nightly DB Backup]",
        [
            "Granular Role-Based Access Control (RBAC) engine configuring permissions across all 19 system modules.",
            "Immutable audit trail logging every user login, database modification, API request, and export action.",
            "Automated database backup cron-jobs creating daily encrypted snapshots with single-click restore capabilities."
        ],
        "Super admins configure role permissions and assign user credentials. The system logs all user actions in an immutable audit ledger. Nightly cron-jobs create encrypted database backups and monitor system health.",
        {
            "ui": "AdminGovernanceView.tsx, UserManagementModal.tsx",
            "backend": "adminService.ts, authMiddleware.js",
            "db": "users, roles, permissions, audit_logs, backup_logs",
            "status": "Production-Ready (100% Operational)"
        },
        {
            "Super Admin": "Complete system control: Configure RBAC matrix, manage system settings, view audit logs, schedule backups.",
            "Auditors / Deans": "View system health metrics, monitor user activity audit logs, and export governance reports."
        },
        ["Define Roles", "Audit Track", "Backup DB", "Analytics View"]
    )

    # Save PDF
    output_filename = "college_erp_user_manual.pdf"
    pdf.output(output_filename)
    print(f"SUCCESS: Zero-Overflow User Manual PDF generated successfully as '{output_filename}'!")

if __name__ == "__main__":
    main()
