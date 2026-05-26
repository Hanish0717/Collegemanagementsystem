import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  GraduationCap, Users, BookOpen, Calendar, Bus, Building2, Bell, BarChart3,
  Sparkles, ArrowRight, Check, Star, LayoutDashboard, Brain, Database,
  Cpu, HardDrive, Network, Shield, Target, TrendingUp, Award, Briefcase,
  Building, Microscope, Wrench, TreePine, FlaskConical, Gamepad2, Music,
  Camera, Trophy, Coffee, Users as UsersIcon, GraduationCap as GradCap, Zap, Heart,
  Package, Monitor, Search, Cloud, Facebook, Twitter, Linkedin, Instagram, Mail
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";



export function Landing() {
  const [activeSection, setActiveSection] = useState("about");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["about", "departments", "facilities", "placements", "campus", "contact"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { id: "about", label: "About" },
    { id: "departments", label: "Departments" },
    { id: "facilities", label: "Facilities" },
    { id: "placements", label: "Placements" },
    { id: "campus", label: "Campus Life" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Nav */}
      <header className="sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="glass rounded-2xl flex items-center justify-between px-5 py-3 shadow-soft">
            <Link to="/" className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center text-white">
                <GraduationCap className="size-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">College Management System</span>
            </Link>
            <nav className="hidden md:flex items-center gap-7 text-sm">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`transition relative ${
                    activeSection === item.id
                      ? "text-gradient font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-primary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm px-3 py-1.5 rounded-lg hover:bg-accent transition">Student Portal</Link>
              <Link to="/dashboard" className="text-sm px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground glow-primary font-medium">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-28 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs font-medium mb-6">
              <Sparkles className="size-3.5 text-indigo" />
              <span>Excellence in Engineering Education — Since 1981</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05]">
              Empowering Students Through <br /> <span className="text-gradient">Smart Digital Campus Management</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              A premier engineering institution dedicated to academic excellence, innovation, and holistic development. 
              Transforming futures through world-class education and cutting-edge research.
            </p>
            <div className="mt-9 flex items-center justify-center gap-3">
              <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-medium glow-primary animate-pulse-glow">
                Explore Campus ERP <ArrowRight className="size-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-card font-medium">
                <LayoutDashboard className="size-4" /> Student Portal
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Check className="size-4 text-indigo" /> AICTE Approved</span>
              <span className="inline-flex items-center gap-1"><Check className="size-4 text-indigo" /> NBA Accredited</span>
              <span className="inline-flex items-center gap-1"><Check className="size-4 text-indigo" /> 92% Placement Record</span>
            </div>
          </motion.div>

          {/* Floating preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative max-w-5xl mx-auto"
          >
            <div className="absolute -inset-4 bg-gradient-primary rounded-3xl blur-2xl opacity-20" />
            <div className="relative glass-card rounded-2xl p-3 shadow-soft">
              <div className="rounded-xl overflow-hidden bg-background border">
                <div className="h-9 border-b flex items-center gap-1.5 px-3">
                  <div className="size-2.5 rounded-full bg-red-400" />
                  <div className="size-2.5 rounded-full bg-yellow-400" />
                  <div className="size-2.5 rounded-full bg-green-400" />
                </div>
                <div className="grid grid-cols-12 gap-3 p-4">
                  <div className="col-span-2 space-y-2">
                    {["Dashboard","Students","Faculty","Exams","Fees","Library"].map((i, idx) => (
                      <div key={i} className={`text-xs px-2.5 py-2 rounded-lg ${idx===0? "bg-gradient-primary text-white" : "bg-muted/60"}`}>{i}</div>
                    ))}
                  </div>
                  <div className="col-span-10 grid grid-cols-4 gap-3">
                    {[1,2,3,4].map(i=>(
                      <div key={i} className="rounded-xl p-3 bg-gradient-soft border">
                        <div className="text-[10px] text-muted-foreground">Metric {i}</div>
                        <div className="text-lg font-bold mt-1">{(i*2480).toLocaleString()}</div>
                        <div className="h-12 mt-2 bg-gradient-primary opacity-70 rounded-md" />
                      </div>
                    ))}
                    <div className="col-span-3 rounded-xl border p-4 h-40 bg-card">
                      <div className="text-xs font-medium mb-2">Weekly Attendance</div>
                      <div className="flex items-end gap-2 h-24">
                        {[60,75,55,82,72,90,68].map((h,i)=>(
                          <div key={i} className="flex-1 rounded-md bg-gradient-primary" style={{height:`${h}%`}} />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border p-4 h-40 bg-gradient-violet text-white">
                      <div className="text-xs opacity-80">Events</div>
                      <div className="text-2xl font-bold mt-2">12</div>
                      <div className="text-xs opacity-80 mt-1">Upcoming this month</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="text-xs uppercase tracking-widest text-indigo font-semibold">About Our College</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold">Excellence in Education Since 1981</h2>
            <p className="mt-4 text-muted-foreground">
              A premier institution dedicated to academic excellence, innovation, and holistic development of students.
              Our smart ERP system ensures seamless campus management and enhanced learning experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold mb-4">Our Vision & Mission</h3>
              <p className="text-muted-foreground mb-4">
                To be a global leader in education by fostering innovation, research, and ethical values.
                We aim to transform students into responsible citizens and future leaders.
              </p>
              <ul className="space-y-3">
                {[
                  "Academic Excellence through innovative curriculum",
                  "State-of-the-art infrastructure and facilities",
                  "Industry partnerships for practical exposure",
                  "Focus on research and development",
                  "Holistic student development programs"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-indigo" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { v: "5,000+", l: "Students", icon: Users },
                { v: "250+", l: "Faculty", icon: GradCap },
                { v: "7", l: "Departments", icon: Building },
                { v: "92%", l: "Placements", icon: TrendingUp },
              ].map((stat) => (
                <div key={stat.l} className="glass-card rounded-2xl p-6 text-center">
                  <stat.icon className="size-8 text-indigo mx-auto mb-2" />
                  <div className="text-3xl font-bold text-gradient">{stat.v}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.l}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-24 bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="text-xs uppercase tracking-widest text-indigo font-semibold">Academic Departments</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold">Our Departments</h2>
            <p className="mt-4 text-muted-foreground">
              Explore our diverse departments offering cutting-edge programs and world-class education.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              { name: "CSE", icon: Cpu, faculty: 45, students: 850, desc: "Computer Science & Engineering" },
              { name: "AIML", icon: Brain, faculty: 32, students: 380, desc: "Artificial Intelligence & ML" },
              { name: "AI&DS", icon: Database, faculty: 28, students: 350, desc: "AI & Data Science" },
              { name: "ECE", icon: Microscope, faculty: 38, students: 620, desc: "Electronics & Communication" },
              { name: "EEE", icon: Zap, faculty: 42, students: 580, desc: "Electrical & Electronics" },
              { name: "Mechanical", icon: Wrench, faculty: 35, students: 520, desc: "Mechanical Engineering" },
              { name: "Civil", icon: Building, faculty: 28, students: 450, desc: "Civil Engineering" },
            ].map((dept, index) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 hover:scale-105 transition cursor-pointer"
              >
                <div className="size-12 rounded-xl bg-gradient-primary text-white grid place-items-center mb-4">
                  <dept.icon className="size-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{dept.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{dept.desc}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{dept.faculty} Faculty</span>
                  <span className="text-muted-foreground">{dept.students} Students</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="text-xs uppercase tracking-widest text-indigo font-semibold">ERP Capabilities</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold">Smart Campus Management</h2>
            <p className="mt-4 text-muted-foreground">
              Comprehensive ERP system to manage every aspect of your institution efficiently.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Attendance Management", icon: Users, desc: "Real-time attendance tracking with biometric integration" },
              { name: "Fee Management", icon: Briefcase, desc: "Online payment processing and receipt generation" },
              { name: "Library Management", icon: BookOpen, desc: "Digital library with barcode scanning system" },
              { name: "Hostel Management", icon: Building2, desc: "Room allocation and mess management system" },
              { name: "Transport Management", icon: Bus, desc: "GPS-enabled fleet tracking and route optimization" },
              { name: "Placement Management", icon: Target, desc: "Complete placement cell management and analytics" },
              { name: "AI Analytics", icon: Brain, desc: "Predictive analytics for student performance" },
              { name: "Online Exams", icon: BarChart3, desc: "Secure online examination platform with AI proctoring" },
            ].map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 hover:scale-105 transition"
              >
                <div className="size-12 rounded-xl bg-gradient-primary text-white grid place-items-center mb-4">
                  <feature.icon className="size-6" />
                </div>
                <h3 className="font-semibold mb-2">{feature.name}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Placements Section */}
      <section id="placements" className="py-24 bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="text-xs uppercase tracking-widest text-indigo font-semibold">Placements</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold">Industry Partnerships</h2>
            <p className="mt-4 text-muted-foreground">
              Our students are placed in top companies with excellent packages through our dedicated placement cell.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              { v: "92%", l: "Placement Rate", icon: Award },
              { v: "₹24 LPA", l: "Highest Package", icon: TrendingUp },
              { v: "₹8.5 LPA", l: "Average Package", icon: BarChart3 },
              { v: "150+", l: "Recruiters", icon: Building2 },
            ].map((stat) => (
              <motion.div
                key={stat.l}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <stat.icon className="size-8 text-indigo mx-auto mb-2" />
                <div className="text-3xl font-bold text-gradient">{stat.v}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.l}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-center mb-8">Top Recruiters</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { name: "Infosys", icon: Building, label: "Hiring Partner", offers: "150+ Offers" },
                { name: "TCS", icon: Briefcase, label: "Campus Recruiter", offers: "200+ Offers" },
                { name: "Wipro", icon: Cpu, label: "Top Recruiter", offers: "180+ Offers" },
                { name: "Amazon", icon: Package, label: "Placement Partner", offers: "80+ Offers" },
                { name: "Microsoft", icon: Monitor, label: "Hiring Partner", offers: "60+ Offers" },
                { name: "Google", icon: Search, label: "Top Recruiter", offers: "40+ Offers" },
                { name: "Accenture", icon: Users, label: "Campus Recruiter", offers: "120+ Offers" },
                { name: "IBM", icon: Database, label: "Placement Partner", offers: "90+ Offers" },
                { name: "Oracle", icon: Cloud, label: "Hiring Partner", offers: "70+ Offers" },
                { name: "Cisco", icon: Network, label: "Mass Recruiter", offers: "100+ Offers" },
              ].map((company, index) => (
                <div
                  key={company.name}
                  className="glass-card rounded-xl p-5 text-center hover:scale-105 transition cursor-pointer group"
                >
                  <div className="size-12 rounded-lg bg-gradient-primary text-white grid place-items-center mx-auto mb-3 group-hover:scale-110 transition">
                    <company.icon className="size-6" />
                  </div>
                  <div className="font-semibold text-sm mb-1">{company.name}</div>
                  <div className="text-xs text-indigo font-medium mb-2">{company.label}</div>
                  <div className="text-xs text-muted-foreground">{company.offers}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Notice Board Section */}
      <section className="py-16 bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Bell className="size-5 text-indigo" />
              <div className="text-xs uppercase tracking-widest text-indigo font-semibold">Notice Board</div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Latest Announcements</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: "Exams", title: "End Semester Exams", date: "May 15-30, 2026", icon: Calendar },
              { type: "Placements", title: "TCS Campus Drive", date: "June 5, 2026", icon: Briefcase },
              { type: "Admissions", title: "B.Tech Admissions 2026", date: "Open Now", icon: GraduationCap },
              { type: "Events", title: "Tech Fest 2026", date: "June 15-17, 2026", icon: Trophy },
            ].map((notice, index) => (
              <motion.div
                key={notice.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-xl p-5 hover:scale-105 transition cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-3">
                  <notice.icon className="size-4 text-indigo" />
                  <span className="text-xs font-medium text-indigo">{notice.type}</span>
                </div>
                <h3 className="font-semibold text-sm mb-2">{notice.title}</h3>
                <p className="text-xs text-muted-foreground">{notice.date}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Life Section */}
      <section id="campus" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="text-xs uppercase tracking-widest text-indigo font-semibold">Campus Life</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold">Beyond Academics</h2>
            <p className="mt-4 text-muted-foreground">
              Vibrant campus life with numerous clubs, events, sports, and cultural activities.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              { name: "Technical Clubs", icon: Cpu, count: 15, desc: "Robotics, Coding, Innovation" },
              { name: "Cultural Events", icon: Music, count: 25, desc: "Music, Dance, Drama" },
              { name: "Sports Activities", icon: Trophy, count: 20, desc: "Cricket, Football, Basketball" },
              { name: "Workshops", icon: UsersIcon, count: 30, desc: "Skill development programs" },
              { name: "Photography Club", icon: Camera, count: 12, desc: "Visual arts and media" },
              { name: "Social Service", icon: Heart, count: 18, desc: "Community outreach programs" },
            ].map((activity, index) => (
              <motion.div
                key={activity.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 hover:scale-105 transition"
              >
                <div className="size-12 rounded-xl bg-gradient-primary text-white grid place-items-center mb-4">
                  <activity.icon className="size-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{activity.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{activity.desc}</p>
                <div className="text-sm font-medium text-indigo">{activity.count} Active Groups</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-center mb-8">Upcoming Events</h3>
            <div className="space-y-4">
              {[
                { event: "Annual Tech Fest", date: "June 15-17, 2026", type: "Technical" },
                { event: "Cultural Night", date: "June 20, 2026", type: "Cultural" },
                { event: "Sports Week", date: "July 5-10, 2026", type: "Sports" },
                { event: "Alumni Meet", date: "July 25, 2026", type: "Networking" },
              ].map((event, index) => (
                <div
                  key={event.event}
                  className="glass-card rounded-xl p-4 flex items-center justify-between hover:scale-105 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-gradient-primary text-white grid place-items-center">
                      <Calendar className="size-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{event.event}</div>
                      <div className="text-xs text-muted-foreground">{event.date}</div>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-gradient-primary text-white">{event.type}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-24 bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="text-xs uppercase tracking-widest text-indigo font-semibold">Campus Facilities</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold">World-Class Infrastructure</h2>
            <p className="mt-4 text-muted-foreground">
              State-of-the-art facilities designed to provide the best learning environment for our students.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Central Library", icon: BookOpen, desc: "50,000+ books, digital resources, reading rooms" },
              { name: "Hostel Facilities", icon: Building2, desc: "AC rooms, mess, 24/7 security, Wi-Fi" },
              { name: "Transport Service", icon: Bus, desc: "GPS-enabled buses covering entire city" },
              { name: "Smart Classrooms", icon: Monitor, desc: "Projectors, smart boards, video conferencing" },
              { name: "Advanced Laboratories", icon: FlaskConical, desc: "Well-equipped labs for all departments" },
              { name: "Sports Complex", icon: Trophy, desc: "Indoor stadium, gym, playgrounds, courts" },
            ].map((facility, index) => (
              <motion.div
                key={facility.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 hover:scale-105 transition"
              >
                <div className="size-12 rounded-xl bg-gradient-primary text-white grid place-items-center mb-4">
                  <facility.icon className="size-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{facility.name}</h3>
                <p className="text-xs text-muted-foreground">{facility.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section id="preview" className="py-24">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-indigo font-semibold">Institutional Dashboard</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold">Your Campus Command Center</h2>
            <p className="mt-4 text-muted-foreground">Institutional dashboards with real-time analytics, academic performance metrics, student engagement tracking, and compliance reporting — all accessible from any device.</p>
            <ul className="mt-6 space-y-3">
              {["Department-Specific Dashboards","Live Academic Analytics","Customizable Dashboard Widgets","24/7 Accessibility & Monitoring"].map(x=>(
                <li key={x} className="flex items-center gap-2 text-sm"><Check className="size-4 text-indigo" /> {x}</li>
              ))}
            </ul>
            <Link to="/dashboard" className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-medium glow-primary">
              View Live Dashboard <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-cyan rounded-3xl blur-2xl opacity-20" />
            <div className="relative glass-card rounded-2xl p-5 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {[1,2,3].map(i=>(
                  <div key={i} className="rounded-xl bg-gradient-soft p-3 border">
                    <div className="text-xs text-muted-foreground">KPI {i}</div>
                    <div className="font-bold text-lg">{(i*1234).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-4 bg-card border">
                <div className="text-xs font-medium mb-3">Performance</div>
                <svg viewBox="0 0 300 80" className="w-full h-20">
                  <defs>
                    <linearGradient id="g" x1="0" x2="1">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                  <path d="M0 60 C 40 20, 80 70, 120 40 S 200 10, 240 30 S 300 20, 300 25" stroke="url(#g)" strokeWidth="3" fill="none" />
                </svg>
              </div>
              <div className="rounded-xl p-4 bg-gradient-primary text-white">
                <div className="text-xs opacity-90">Top Department</div>
                <div className="text-2xl font-bold mt-1">Computer Science</div>
                <div className="text-xs opacity-80 mt-1">CGPA avg 8.9 · 4,200 students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs uppercase tracking-widest text-indigo font-semibold">Trusted by Leadership</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold">What Educators Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "Dr. Anjali Mehra", role: "Dean of Academic Affairs, IIT", quote: "The integrated platform replaced our fragmented systems. Faculty engagement increased by 45%, and administrative load decreased significantly. Best decision we made this decade." },
              { name: "Rohan Verma", role: "Registrar & Senior Administrator", quote: "Compliance reporting that took our office weeks now generates in hours. The dashboards provide unprecedented visibility into institutional performance. Our stakeholders are impressed." },
              { name: "Prof. Sarah Chen", role: "Head of Department, Computer Science", quote: "Automated attendance, seamless grading, instant student feedback — it's transformed how we teach and mentor. Students appreciate the transparency, and we have more time for what matters." },
            ].map(t=>(
              <div key={t.name} className="glass-card rounded-2xl p-6">
                <div className="flex gap-1 text-indigo">{[...Array(5)].map((_,i)=><Star key={i} className="size-4 fill-current" />)}</div>
                <p className="mt-3 text-sm">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-primary" />
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-12 text-center text-white shadow-soft">
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold">Join the Future of Higher Education</h2>
              <p className="mt-3 opacity-90 max-w-xl mx-auto">Transform your institution with an integrated digital ecosystem trusted by 150+ universities and colleges worldwide.</p>
              <div className="mt-8 flex justify-center gap-3">
                <Link to="/dashboard" className="px-6 py-3 rounded-xl bg-white text-foreground font-medium hover:scale-105 transition">Request Campus Demo</Link>
                <Link to="/login" className="px-6 py-3 rounded-xl glass text-white font-medium">Explore ERP Features</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="text-xs uppercase tracking-widest text-indigo font-semibold">Contact Us</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold">Get in Touch</h2>
            <p className="mt-4 text-muted-foreground">
              Have questions? Reach out to us for admissions, placements, or general inquiries.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Building, title: "Address", content: "College Campus, Main Road, City - 500001" },
              { icon: Users, title: "Phone", content: "+91 98765 43210" },
              { icon: Mail, title: "Email", content: "info@college.edu" },
            ].map((contact, index) => (
              <motion.div
                key={contact.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <div className="size-12 rounded-xl bg-gradient-primary text-white grid place-items-center mx-auto mb-4">
                  <contact.icon className="size-6" />
                </div>
                <h3 className="font-semibold mb-2">{contact.title}</h3>
                <p className="text-sm text-muted-foreground">{contact.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-lg bg-gradient-primary grid place-items-center text-white"><GraduationCap className="size-4" /></div>
                <span className="font-semibold">College Management System</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Empowering students through smart digital campus management. Excellence in engineering education since 1981.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Twitter, label: "Twitter" },
                  { icon: Linkedin, label: "LinkedIn" },
                  { icon: Instagram, label: "Instagram" },
                ].map((social) => (
                  <a key={social.label} href="#" className="size-8 rounded-lg bg-muted flex items-center justify-center hover:bg-gradient-primary hover:text-white transition">
                    <social.icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition">Home</Link></li>
                <li><button onClick={() => scrollToSection("about")} className="hover:text-foreground transition">About</button></li>
                <li><button onClick={() => scrollToSection("departments")} className="hover:text-foreground transition">Departments</button></li>
                <li><button onClick={() => scrollToSection("placements")} className="hover:text-foreground transition">Placements</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Important Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-foreground transition">Student Portal</Link></li>
                <li><Link to="/dashboard" className="hover:text-foreground transition">Admin Login</Link></li>
                <li><a href="#" className="hover:text-foreground transition">Admissions</a></li>
                <li><a href="#" className="hover:text-foreground transition">Exam Results</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© 2026 College Management System. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">AICTE Approved | NBA Accredited | ISO 9001:2015 Certified</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
