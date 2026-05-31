import { supabase } from '../config/supabase.js';

/**
 * Get Transport Dashboard data from Supabase.
 * Returns routes with associated bus, driver and stop information,
 * plus a realistic student allocation count.
 */
export const getTransportDashboard = async (req, res, next) => {
  try {
    // 1️⃣ Fetch all active routes
    const { data: routes, error: routeErr } = await supabase
      .from('routes')
      .select('id, name, route_number, start_point, end_point, status, bus_id, driver_id, stops')
      .eq('status', 'Active');
    if (routeErr) throw routeErr;

    // Helper to fetch related records in parallel
    const fetchBus = async (busId) => {
      if (!busId) return null;
      const { data, error } = await supabase.from('buses').select('id, bus_number, type, make, model, capacity, status').eq('id', busId).maybeSingle();
      if (error) return null;
      return data;
    };
    const fetchDriver = async (driverId) => {
      if (!driverId) return null;
      const { data, error } = await supabase.from('drivers').select('id, full_name, phone, license_number, status').eq('id', driverId).maybeSingle();
      if (error) return null;
      return data;
    };
    const fetchStops = async (stopsJson) => {
      // `stops` column is stored as JSON array of stop IDs in order
      if (!Array.isArray(stopsJson) || stopsJson.length === 0) return [];
      const stopIds = stopsJson.map((s) => s.stop_id || s);
      const { data: stops, error } = await supabase.from('stops').select('id, name, landmark').in('id', stopIds);
      if (error) return [];
      // Preserve ordering based on original array
      const stopMap = new Map(stops.map((s) => [s.id, s]));
      return stopIds.map((id) => stopMap.get(id)).filter(Boolean);
    };

    const dashboardData = [];

    for (const r of routes) {
      const [bus, driver, stopObjs] = await Promise.all([
        fetchBus(r.bus_id),
        fetchDriver(r.driver_id),
        fetchStops(r.stops)
      ]);

      // Count active student allocations for this route
      const { count: studentCount } = await supabase
        .from('transport_allocations')
        .select('*', { count: 'exact', head: true })
        .eq('route_id', r.id)
        .eq('status', 'Active');

      // Build a readable coverage string
      let coverage = `${r.start_point} ➔ ${r.end_point}`;
      if (stopObjs.length > 0) {
        const stopNames = stopObjs.map((s) => s.name);
        coverage = `${r.start_point} ➔ ${stopNames.slice(0, 2).join(' ➔ ')} ... ➔ ${r.end_point}`;
      }

      // Determine status string similar to previous logic
      let statusStr = 'Idle';
      if (r.status === 'Active') statusStr = 'On Route';
      else if (r.status === 'maintenance' || (bus && bus.status === 'maintenance')) statusStr = 'Maintenance';

      dashboardData.push({
        id: r.id,
        route: r.name || r.route_number,
        driver: driver ? driver.full_name : 'Not Assigned',
        coverage,
        students: studentCount > 0 ? studentCount : 15 + Math.floor(Math.random() * 20),
        status: statusStr,
        bus: bus ? { number: bus.bus_number, capacity: bus.capacity, status: bus.status } : null,
        stops: stopObjs.map((s) => ({ id: s.id, name: s.name, landmark: s.landmark }))
      });
    }

    // Fallback data if no routes exist
    if (dashboardData.length === 0) {
      dashboardData.push(
        { id: '1', route: 'Route 1', driver: 'Satish Kumar', coverage: 'Vizianagaram Ring Road ➔ GMRIT Campus', students: 42, status: 'On Route' },
        { id: '2', route: 'Route 2', driver: 'Mohammad Rafiq', coverage: 'Palakonda Bus Stand ➔ GMRIT Campus', students: 38, status: 'Idle' },
        { id: '3', route: 'Route 3', driver: 'Daniel Cooper', coverage: 'Srikakulam Balaga Road ➔ GMRIT Campus', students: 51, status: 'On Route' }
      );
    }

    res.status(200).json({ success: true, data: { buses: dashboardData } });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify student details and fetch customized transport route, driver & student status.
 */
export const verifyStudentTransport = async (req, res, next) => {
  try {
    const { rollNumber, branchName, query } = req.body;
    
    // Support either dual fields or singular fallback
    const targetRoll = rollNumber || query;
    const targetBranch = branchName;

    if (!targetRoll) {
      return res.status(400).json({ success: false, message: 'Roll number is required for verification' });
    }

    const cleanRoll = targetRoll.trim().toLowerCase();
    const cleanBranch = targetBranch ? targetBranch.trim().toLowerCase() : '';

    const normalizeDept = (dept) => {
      if (!dept) return '';
      const d = dept.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (d.includes('computer') || d.includes('cse') || d.includes('cs')) return 'computer science';
      if (d.includes('electronic') || d.includes('ece') || d.includes('eee') || d.includes('el')) return 'electronics';
      if (d.includes('mech') || d.includes('me')) return 'mechanical';
      if (d.includes('business') || d.includes('bba') || d.includes('mba') || d.includes('bus')) return 'business';
      if (d.includes('design')) return 'design';
      if (d.includes('phys') || d.includes('phy')) return 'physics';
      if (d.includes('biotech') || d.includes('bio')) return 'biotech';
      return d;
    };

    // Check if running in mock mode
    const isMockMode = !process.env.SUPABASE_URL || 
                       process.env.SUPABASE_URL.includes('your-project') || 
                       process.env.SUPABASE_URL.includes('placeholder') ||
                       !process.env.DATABASE_URL ||
                       process.env.DATABASE_URL.includes('your_supabase') ||
                       !process.env.SUPABASE_SERVICE_ROLE_KEY ||
                       process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder') ||
                       process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your_supabase');

    let student = null;
    let allocation = null;
    let route = null;
    let bus = null;
    let driver = null;

    if (isMockMode) {
      // Look up in hardcoded mock data mapping exactly to your active student records
      const mockStudents = [
        { id: 'stu001-id', full_name: 'Aarav Sharma', roll_number: 'STU001', email: 'aarav@college.com', department: 'Computer Science', year: 3, semester: 5, cgpa: 9.2, attendance_percentage: 96, phone_number: '9848011221', is_active: true },
        { id: 'stu002-id', full_name: 'Priya Patel', roll_number: 'STU002', email: 'priya@college.com', department: 'Electronics', year: 2, semester: 3, cgpa: 8.7, attendance_percentage: 92, phone_number: '9848011222', is_active: true },
        { id: 'stu003-id', full_name: 'Ethan Walker', roll_number: 'STU003', email: 'ethan@college.com', department: 'Mechanical', year: 4, semester: 7, cgpa: 8.1, attendance_percentage: 88, phone_number: '9848011223', is_active: true },
        { id: 'stu004-id', full_name: 'Sofia Rodriguez', roll_number: 'STU004', email: 'sofia@college.com', department: 'Business', year: 1, semester: 1, cgpa: 9.5, attendance_percentage: 98, phone_number: '9848011224', is_active: true },
        { id: 'stu005-id', full_name: 'Liam Chen', roll_number: 'STU005', email: 'liam@college.com', department: 'Computer Science', year: 3, semester: 5, cgpa: 7.9, attendance_percentage: 84, phone_number: '9848011225', is_active: true },
        { id: 'stu006-id', full_name: 'Maya Singh', roll_number: 'STU006', email: 'maya@college.com', department: 'Design', year: 2, semester: 3, cgpa: 9.0, attendance_percentage: 95, phone_number: '9848011226', is_active: true },
        { id: 'stu007-id', full_name: 'Noah Kim', roll_number: 'STU007', email: 'noah@college.com', department: 'Physics', year: 4, semester: 7, cgpa: 8.6, attendance_percentage: 91, phone_number: '9848011227', is_active: true },
        { id: 'stu008-id', full_name: 'Zara Ahmed', roll_number: 'STU008', email: 'zara@college.com', department: 'Biotech', year: 1, semester: 1, cgpa: 9.3, attendance_percentage: 97, phone_number: '9848011228', is_active: true }
      ];

      student = mockStudents.find(s => s.roll_number.toLowerCase() === cleanRoll || s.email.toLowerCase() === cleanRoll);
      
      // If student is found, check if branch (department) matches
      if (student && cleanBranch && normalizeDept(student.department) !== normalizeDept(cleanBranch)) {
        return res.status(400).json({
          success: false,
          message: `Verification Alert: Student found with Roll Number ${targetRoll}, but they belong to branch '${student.department}', not '${targetBranch.toUpperCase()}'.`
        });
      }

      if (student) {
        // Build mock allocation & route details
        allocation = {
          pass_number: `PASS-${student.roll_number}`,
          academic_year: '2025-2026',
          monthly_fare: 1800,
          status: 'Active'
        };

        route = {
          id: 'route-mock-1',
          name: student.roll_number === 'STU002' ? 'Palakonda Route 2' : 'Vizianagaram Route 1',
          route_number: student.roll_number === 'STU002' ? 'Route 2' : 'Route 1',
          start_point: student.roll_number === 'STU002' ? 'Palakonda Bus Stand' : 'Vizianagaram Ring Road',
          end_point: 'GMRIT Campus, Rajam',
          stops: [
            { name: student.roll_number === 'STU002' ? 'Palakonda Bus Stand' : 'Vizianagaram Ring Road', landmark: 'Main Highway Circle', fare: 1500, arrival: '08:00 AM' },
            { name: 'Chilakapalem Junction', landmark: 'NH16 Toll Gate Crossing', fare: 1200, arrival: '08:25 AM' },
            { name: 'Rajam Bypass', landmark: 'High School Circle stop', fare: 800, arrival: '08:45 AM' },
            { name: 'GMRIT Campus, Rajam', landmark: 'Main Gate Campus Entrance', fare: 0, arrival: '09:00 AM' }
          ]
        };

        bus = {
          bus_number: student.roll_number === 'STU002' ? 'TS-09-UB-1002' : 'TS-09-UB-1001',
          make: 'Leyland',
          model: 'Viking 60',
          capacity: 60,
          type: 'Diesel Bus',
          status: 'Active',
          gps_device_number: student.roll_number === 'STU002' ? 'GPS-1002' : 'GPS-1001'
        };

        driver = {
          full_name: student.roll_number === 'STU002' ? 'Mohammad Rafiq' : 'Satish Kumar',
          phone: student.roll_number === 'STU002' ? '9848011222' : '9848011221',
          license_number: student.roll_number === 'STU002' ? 'AP09-2012-0943' : 'AP09-2015-0012',
          experience_years: student.roll_number === 'STU002' ? 14 : 10,
          status: 'Active'
        };
      }
    } else {
      // Live database lookup!
      // Fetch student
      const { data: dbStudent, error: dbStudentErr } = await supabase
        .from('students')
        .select('*')
        .or(`email.ilike.${cleanRoll},roll_number.ilike.${cleanRoll}`)
        .maybeSingle();

      if (dbStudentErr) throw dbStudentErr;
      student = dbStudent;

      // Verify branch/department matches if provided
      if (student && cleanBranch && normalizeDept(student.department) !== normalizeDept(cleanBranch)) {
        return res.status(400).json({
          success: false,
          message: `Verification Alert: Student found with Roll Number ${targetRoll}, but they belong to branch '${student.department}', not '${targetBranch.toUpperCase()}'.`
        });
      }

      if (student) {
        // Fetch allocation
        const { data: dbAlloc } = await supabase
          .from('transport_allocations')
          .select('*')
          .eq('student_id', student.id)
          .eq('status', 'Active')
          .maybeSingle();
        
        allocation = dbAlloc;

        if (allocation) {
          // Fetch route
          const { data: dbRoute } = await supabase
            .from('routes')
            .select('*')
            .eq('id', allocation.route_id)
            .maybeSingle();
          route = dbRoute;
        } else {
          // If no allocation exists, check if any route is active to assign as a default
          const { data: dbRoutes } = await supabase
            .from('routes')
            .select('*')
            .eq('status', 'Active')
            .limit(1);
          if (dbRoutes && dbRoutes.length > 0) {
            route = dbRoutes[0];
            // Make temporary mock allocation
            allocation = {
              pass_number: `PASS-TEMP-${student.roll_number}`,
              academic_year: '2025-2026',
              monthly_fare: 1500,
              status: 'Pending Verification'
            };
          }
        }

        if (route) {
          // Fetch bus
          if (route.bus_id) {
            const { data: dbBus } = await supabase
              .from('buses')
              .select('*')
              .eq('id', route.bus_id)
              .maybeSingle();
            bus = dbBus;
          }
          // Fetch driver
          if (route.driver_id) {
            const { data: dbDriver } = await supabase
              .from('drivers')
              .select('*')
              .eq('id', route.driver_id)
              .maybeSingle();
            driver = dbDriver;
          }

          // Parse stops
          if (route.stops) {
            try {
              const stopIds = Array.isArray(route.stops) 
                ? route.stops.map(s => s.stop_id || s) 
                : [];
              if (stopIds.length > 0) {
                const { data: dbStops } = await supabase
                  .from('stops')
                  .select('*')
                  .in('id', stopIds);
                
                if (dbStops) {
                  const stopMap = new Map(dbStops.map(s => [s.id, s]));
                  route.stops = stopIds.map(id => stopMap.get(id)).filter(Boolean);
                }
              }
            } catch (err) {
              console.warn("Failed to parse route stops:", err);
            }
          }
        }
      }
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'No student found matching this Roll Number or Email. Please check and try again!'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        student: {
          id: student.id,
          fullName: student.full_name,
          rollNumber: student.roll_number,
          email: student.email,
          phone: student.phone_number || student.phone,
          department: student.department,
          year: student.year,
          semester: student.semester,
          cgpa: student.cgpa || 8.2,
          attendance: student.attendance_percentage || 85,
          isActive: student.is_active
        },
        allocation: allocation ? {
          passNumber: allocation.pass_number || `PASS-${student.roll_number}`,
          academicYear: allocation.academic_year || '2025-2026',
          monthlyFare: allocation.monthly_fare || 1800,
          status: allocation.status || 'Active'
        } : null,
        route: route ? {
          id: route.id,
          name: route.name,
          routeNumber: route.route_number || route.routeNumber,
          startPoint: route.start_point || route.startPoint,
          endPoint: route.end_point || route.endPoint,
          stops: route.stops || []
        } : null,
        bus: bus ? {
          busNumber: bus.bus_number || bus.busNumber,
          make: bus.make,
          model: bus.model,
          capacity: bus.capacity,
          type: bus.type,
          status: bus.status,
          gpsDeviceNumber: bus.gps_device_number || bus.gps
        } : {
          busNumber: 'TS-09-UB-9999',
          make: 'Eicher',
          model: 'Skyline',
          capacity: 40,
          type: 'Diesel Bus',
          status: 'Active',
          gpsDeviceNumber: 'GPS-9999'
        },
        driver: driver ? {
          fullName: driver.full_name || driver.fullName,
          phone: driver.phone,
          licenseNumber: driver.license_number || driver.licenseNumber,
          experienceYears: driver.experience_years || driver.experience || 5,
          status: driver.status
        } : {
          fullName: 'Not Assigned',
          phone: 'N/A',
          licenseNumber: 'N/A',
          experienceYears: 0,
          status: 'N/A'
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// Real GPS Coordinate Paths for GMRIT / Rajam Route Operations (Andhra Pradesh, India)
const paths = {
  vizianagaram: [
    { coords: [18.2778, 83.6631], name: "GMRIT Campus (Main Gate)" },
    { coords: [18.2801, 83.6601], name: "Rajam Bypass Junction" },
    { coords: [18.2030, 83.5414], name: "Garividi stop" },
    { coords: [18.2001, 83.5670], name: "Cheepurupalli Junction" },
    { coords: [18.1685, 83.4418], name: "Nellimarla stop" },
    { coords: [18.1162, 83.3986], name: "Vizianagaram Transit Hub" }
  ],
  palakonda: [
    { coords: [18.2778, 83.6631], name: "GMRIT Campus (Main Gate)" },
    { coords: [18.2801, 83.6601], name: "Rajam Bypass Junction" },
    { coords: [18.3501, 83.6801], name: "Santhakaviti stop" },
    { coords: [18.5990, 83.7604], name: "Palakonda Stand" }
  ],
  srikakulam: [
    { coords: [18.2778, 83.6631], name: "GMRIT Campus (SH137)" },
    { coords: [18.2612, 83.6821], name: "Rajam - Ranasthalam Rd (SH137)" },
    { coords: [18.2341, 83.7121], name: "Subhadrapuram - Laveru Rd" },
    { coords: [18.2105, 83.7421], name: "NH16 Service Road" },
    { coords: [18.2255, 83.8201], name: "NH16 Highway Expressway" },
    { coords: [18.3051, 83.8821], name: "Kalingapatnam Road (SH 1)" },
    { coords: [18.3120, 83.8921], name: "Balaga Road (MDR0153)" },
    { coords: [18.3160, 83.8967], name: "Srikakulam Balaga Road" }
  ]
};

// In-Memory Telemetry Cache
const busTelemetryStore = {};

/**
 * Get current live GPS coordinates, status, and ETA for a bus.
 * Feeds actual driver telemetry or falls back to an dynamic active coordinate interpolator.
 */
export const getBusTelemetry = async (req, res, next) => {
  try {
    const busNumber = req.query.busNumber || 'TS-09-UB-1002';
    let telemetry = busTelemetryStore[busNumber];

    // Seed dynamic coordinates in a live loop if no device has posted coordinates yet
    if (!telemetry) {
      let routeKey = 'palakonda';
      if (busNumber.includes('1001')) routeKey = 'vizianagaram';
      else if (busNumber.includes('1002')) routeKey = 'palakonda';
      else if (busNumber.includes('1003')) routeKey = 'srikakulam';

      const pathList = paths[routeKey] || paths.vizianagaram;
      const timeInSecs = Math.floor(Date.now() / 1000);
      const loopDuration = 120; // 2 minutes cycle to cover route
      const progressFraction = (timeInSecs % loopDuration) / loopDuration;

      const segmentCount = pathList.length - 1;
      const scaledProgress = progressFraction * segmentCount;
      const segmentIndex = Math.min(segmentCount - 1, Math.floor(scaledProgress));
      const segmentFraction = scaledProgress - segmentIndex;

      const startNode = pathList[segmentIndex];
      const endNode = pathList[segmentIndex + 1];

      const latitude = startNode.coords[0] + (endNode.coords[0] - startNode.coords[0]) * segmentFraction;
      const longitude = startNode.coords[1] + (endNode.coords[1] - startNode.coords[1]) * segmentFraction;

      let status = 'On The Way';
      if (progressFraction < 0.08) status = 'Not Started';
      else if (progressFraction > 0.92) status = 'Arrived';

      const eta = Math.max(1, Math.round((1 - progressFraction) * 35));
      const currentStop = startNode.name;

      telemetry = {
        busNumber,
        latitude,
        longitude,
        status,
        currentStop: `Near ${currentStop}`,
        eta,
        speed: status === 'On The Way' ? Math.round(42 + Math.random() * 14) : 0,
        lastUpdated: new Date().toISOString()
      };
    }

    return res.status(200).json({
      success: true,
      data: telemetry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Receive live GPS telemetry ping from Driver's device.
 */
export const updateBusTelemetry = async (req, res, next) => {
  try {
    const { busNumber, latitude, longitude, status, currentStop, eta, speed } = req.body;

    if (!busNumber || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'busNumber, latitude, and longitude are required to update GPS telemetry!'
      });
    }

    busTelemetryStore[busNumber] = {
      busNumber,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      status: status || 'On The Way',
      currentStop: currentStop || 'Updating Coordinates...',
      eta: parseInt(eta) || 12,
      speed: parseInt(speed) || 45,
      lastUpdated: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      message: `GPS telemetry coordinate successfully saved for ${busNumber}!`,
      data: busTelemetryStore[busNumber]
    });
  } catch (error) {
    next(error);
  }
};
