import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { 
  Bus, MapPin, User, Users, Search, ShieldCheck, Phone, ShieldAlert, Navigation, Lock,
  Compass, Map, Layers, Activity, PlusCircle, ArrowRight, Eye 
} from "lucide-react";
import { 
  fetchTransportData, 
  verifyStudentTransportApi, 
  getBusTelemetryApi,
  updateBusTelemetryApi,
  type BusItem, 
  type StudentTransportDetails,
  type BusTelemetry
} from "@/services/transportService";
import { fetchDepartments, type DepartmentOption } from "@/services/studentService";

export function TransportDashboard() {
  const [buses, setBuses] = useState<BusItem[]>([]);
  const [loadingBuses, setLoadingBuses] = useState(true);
  const [departments, setDepartments] = useState<DepartmentOption[]>([
    { code: "CSE", name: "Computer Science & Engineering" },
    { code: "AIML", name: "Artificial Intelligence & Machine Learning" },
    { code: "AIDS", name: "Artificial Intelligence & Data Science" },
    { code: "ECE", name: "Electronics & Communication Engineering" },
    { code: "EEE", name: "Electrical & Electronics Engineering" }
  ]);
  
  // Verification states
  const [rollNumberInput, setRollNumberInput] = useState("");
  const [branchNameInput, setBranchNameInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedData, setVerifiedData] = useState<StudentTransportDetails | null>(null);
  
  // Interactive Fixed Route selection states
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [is3DActive, setIs3DActive] = useState(false);

  // Real GPS & Leaflet States ("Where is my Train" Style)
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [selectedBusNumber, setSelectedBusNumber] = useState("TS-09-UB-1002");
  const [liveTelemetry, setLiveTelemetry] = useState<BusTelemetry | null>(null);
  const [isDriverSimActive, setIsDriverSimActive] = useState(true);
  const [driverSimProgress, setDriverSimProgress] = useState(0);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const routeCoordsRef = useRef<any[]>([]);
  const [routeCoordsForSnapping, setRouteCoordsForSnapping] = useState<any[]>([]);

  // New route form states
  const [showNewRouteForm, setShowNewRouteForm] = useState(false);
  const [newRouteStart, setNewRouteStart] = useState("");
  const [newRouteEnd, setNewRouteEnd] = useState("");
  const [savingRoute, setSavingRoute] = useState(false);
  // Custom route coordinate store: { [routeId]: { start: [lat,lng], end: [lat,lng] } }
  const [customRouteCoords, setCustomRouteCoords] = useState<Record<number, { start: number[]; end: number[] }>>({});

  const defaultRoutes = [
    {
      id: 1,
      routeNumber: "Route 1",
      coverage: "Rajam to Vizianagaram",
      startPoint: "Rajam Main Road",
      endPoint: "Vizianagaram Ring Road",
      time: "1 hour 15 mins",
      distance: "52 km",
      driverName: "Satish Kumar",
      driverPhone: "9848011221",
      fare: "₹2,200 / Month",
      busNumber: "TS-09-UB-1001",
      busDetails: "Tata Starbus 50 (50 seats)",
      stops: ["GMRIT Gate", "Rajam Bypass", "Garividi", "Cheepurupalli Junction", "Nellimarla", "Vizianagaram Hub"]
    },
    {
      id: 2,
      routeNumber: "Route 2",
      coverage: "Rajam to Palakonda",
      startPoint: "Rajam Bypass",
      endPoint: "Palakonda Bus Stand",
      time: "35 mins",
      distance: "22 km",
      driverName: "Mohammad Rafiq",
      driverPhone: "9848011222",
      fare: "₹1,500 / Month",
      busNumber: "TS-09-UB-1002",
      busDetails: "Leyland Viking 60 (60 seats)",
      stops: ["GMRIT Gate", "Rajam Bypass", "Santhakaviti Stop", "Palakonda Stand"]
    },
    {
      id: 3,
      routeNumber: "Route 3",
      coverage: "Rajam to Srikakulam (via Ranasthalam Road, NH16)",
      startPoint: "Rajam Bypass",
      endPoint: "Srikakulam Balaga Road",
      time: "1 hour 10 mins",
      distance: "55 km",
      driverName: "Ramesh Yadav",
      driverPhone: "9848011223",
      fare: "₹1,800 / Month",
      busNumber: "TS-09-UB-1003",
      busDetails: "Eicher Skyline 40 (40 seats)",
      stops: [
        "GMRIT Campus",
        "Laveru Junction",
        "Ranasthalam",
        "Chilakapalem",
        "Srikakulam Balaga Rd"
      ]
    }
  ];

  const [allRoutes, setAllRoutes] = useState(defaultRoutes);

  // Geocode a place name to [lat, lng] using OpenStreetMap Nominatim
  const geocodePlace = async (placeName: string): Promise<number[]> => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&limit=1`
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    throw new Error(`Could not find location: ${placeName}`);
  };

  // Handle saving a new custom route
  const handleSaveNewRoute = async () => {
    if (!newRouteStart.trim() || !newRouteEnd.trim()) return;
    setSavingRoute(true);
    try {
      const [startCoords, endCoords] = await Promise.all([
        geocodePlace(newRouteStart.trim()),
        geocodePlace(newRouteEnd.trim())
      ]);

      // Direct OSRM Fetch to pre-populate distance, time, and fare instantly!
      let distanceStr = "Calculating...";
      let timeStr = "Calculating...";
      let fareStr = "₹TBD / Month";

      try {
        const osrmRes = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=false`
        );
        const osrmData = await osrmRes.json();
        if (osrmData && osrmData.routes && osrmData.routes.length > 0) {
          const summary = osrmData.routes[0];
          const distanceKm = Math.round(summary.distance / 1000);
          const timeMins = Math.round(summary.duration / 60);

          distanceStr = `${distanceKm} km`;
          
          if (timeMins >= 60) {
            const hrs = Math.floor(timeMins / 60);
            const mins = timeMins % 60;
            timeStr = `${hrs} hr ${mins > 0 ? `${mins} mins` : ""}`;
          } else {
            timeStr = `${timeMins} mins`;
          }

          const calculatedFare = Math.max(1200, Math.round(distanceKm * 40));
          fareStr = `₹${calculatedFare.toLocaleString()} / Month`;
        }
      } catch (osrmErr) {
        console.warn("Direct OSRM fetch failed, falling back to map calculation:", osrmErr);
      }

      const newId = allRoutes.length + 1;
      const newRoute = {
        id: newId,
        routeNumber: `Route ${newId}`,
        coverage: `${newRouteStart.trim()} to ${newRouteEnd.trim()}`,
        startPoint: newRouteStart.trim(),
        endPoint: newRouteEnd.trim(),
        time: timeStr,
        distance: distanceStr,
        driverName: "To Be Assigned",
        driverPhone: "—",
        fare: fareStr,
        busNumber: `TS-09-UB-${1000 + newId}`,
        busDetails: "To Be Assigned",
        stops: [newRouteStart.trim(), newRouteEnd.trim()]
      };

      setAllRoutes(prev => [...prev, newRoute]);
      setCustomRouteCoords(prev => ({
        ...prev,
        [newId]: { start: startCoords, end: endCoords }
      }));

      // Auto-select the new route
      setSelectedRouteId(newId);
      setNewRouteStart("");
      setNewRouteEnd("");
      setShowNewRouteForm(false);
    } catch (err: any) {
      alert(err.message || "Failed to geocode one of the locations. Please try a more specific name.");
    } finally {
      setSavingRoute(false);
    }
  };



  // Map settings and telemetry simulations
  const [mapMode, setMapMode] = useState<"streets" | "satellite">("streets");
  const [trafficActive, setTrafficActive] = useState(true);
  const [busProgress, setBusProgress] = useState(25);
  const [simulatedETA, setSimulatedETA] = useState(18);

  // Snapping function to find the closest coordinate on the OSRM route path
  const getSnappedCoordinate = (lat: number, lng: number) => {
    if (!routeCoordsForSnapping || routeCoordsForSnapping.length === 0) {
      return [lat, lng];
    }
    
    let closestPt = routeCoordsForSnapping[0];
    let minDistance = Infinity;
    
    for (const pt of routeCoordsForSnapping) {
      const dLat = pt[0] - lat;
      const dLng = pt[1] - lng;
      const dist = dLat * dLat + dLng * dLng;
      if (dist < minDistance) {
        minDistance = dist;
        closestPt = pt;
      }
    }
    
    return closestPt;
  };

  // Load general buses
  useEffect(() => {
    fetchTransportData()
      .then((res) => {
        setBuses(res.buses);
        setLoadingBuses(false);
      })
      .catch((err) => {
        console.warn("Failed to load live transport data:", err);
        setBuses([]);
        setLoadingBuses(false);
      });
      
    fetchDepartments()
      .then((res) => setDepartments(res))
      .catch((err) => console.warn("Failed to load departments:", err));
  }, []);

  // 1️⃣ Dynamic Asset Loader for Leaflet + Leaflet Routing Machine CSS & JS
  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const leafletCss = document.createElement("link");
    leafletCss.rel = "stylesheet";
    leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(leafletCss);

    const routingCss = document.createElement("link");
    routingCss.rel = "stylesheet";
    routingCss.href = "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css";
    document.head.appendChild(routingCss);

    // Bulletproof CSS Injection to permanently hide default directions overlay box
    const customStyle = document.createElement("style");
    customStyle.innerHTML = `
      .leaflet-routing-container, .leaflet-routing-error {
        display: none !important;
      }
    `;
    document.head.appendChild(customStyle);

    const leafletJs = document.createElement("script");
    leafletJs.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    leafletJs.async = true;
    leafletJs.onload = () => {
      const routingJs = document.createElement("script");
      routingJs.src = "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js";
      routingJs.async = true;
      routingJs.onload = () => {
        setLeafletLoaded(true);
      };
      document.body.appendChild(routingJs);
    };
    document.body.appendChild(leafletJs);
  }, []);

  // 2️⃣ Real-time backend Telemetry Polling Loop ("Where is my Train" Style - Every 3 seconds)
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const data = await getBusTelemetryApi(selectedBusNumber);
        setLiveTelemetry(data);
        
        // Update classic simulated variables so other card widgets stay in sync beautifully
        if (data) {
          setSimulatedETA(data.eta);
          
          const progressMap: Record<string, number> = {
            'Not Started': 5,
            'On The Way': 55,
            'Arrived': 100
          };
          setBusProgress(progressMap[data.status] || 55);
        }
      } catch (err) {
        console.warn("Telemetry polling failed:", err);
      }
    };

    fetchTelemetry(); // Instant load
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, [selectedBusNumber]);

  // 3️⃣ Active Driver Device GPS Telemetry Simulator Loop (POSTs to backend every 3 seconds)
  useEffect(() => {
    if (!isDriverSimActive) return;

    const routeGPSPaths = {
      vizianagaram: [
        [18.2778, 83.6631], // GMRIT Campus
        [18.2801, 83.6601], // Rajam Bypass
        [18.2030, 83.5414], // Garividi
        [18.2001, 83.5670], // Cheepurupalli Junction
        [18.1685, 83.4418], // Nellimarla
        [18.1162, 83.3986]  // Vizianagaram Hub
      ],
      palakonda: [
        [18.2778, 83.6631], // GMRIT Campus
        [18.2801, 83.6601], // Rajam Bypass
        [18.3501, 83.6801], // Santhakaviti stop
        [18.5990, 83.7604]  // Palakonda Stand
      ],
      srikakulam: [
        [18.2778, 83.6631], // GMRIT Campus (SH137)
        [18.2612, 83.6821], // Rajam - Ranasthalam Rd (SH137)
        [18.2341, 83.7121], // Subhadrapuram - Laveru Rd
        [18.2105, 83.7421], // NH16 Service Road
        [18.2255, 83.8201], // NH16 Highway Expressway
        [18.3051, 83.8821], // Kalingapatnam Rd (SH 1)
        [18.3120, 83.8921], // Balaga Rd (MDR0153)
        [18.3160, 83.8967]  // Srikakulam Balaga Road
      ]
    };

    const simTimer = setInterval(async () => {
      setDriverSimProgress((prevProgress) => {
        const nextProgress = prevProgress >= 100 ? 0 : prevProgress + 4;
        
        let routeKey = 'vizianagaram';
        if (selectedBusNumber.includes('1001')) routeKey = 'vizianagaram';
        else if (selectedBusNumber.includes('1002')) routeKey = 'palakonda';
        else if (selectedBusNumber.includes('1003')) routeKey = 'srikakulam';

        const rawPath = routeGPSPaths[routeKey as keyof typeof routeGPSPaths] || routeGPSPaths.vizianagaram;
        
        let lat = 0;
        let lng = 0;
        let currentStopName = "Transit Way";

        if (routeCoordsRef.current && routeCoordsRef.current.length > 0) {
          const path = routeCoordsRef.current;
          const totalPoints = path.length;
          const currentPointIdx = Math.min(totalPoints - 1, Math.floor((nextProgress / 100) * totalPoints));
          const pt = path[currentPointIdx];
          lat = pt[0];
          lng = pt[1];
          
          const stopsMap = {
            vizianagaram: ["GMRIT Gate", "Rajam Bypass", "Garividi", "Cheepurupalli Junction", "Nellimarla", "Vizianagaram Hub"],
            palakonda: ["GMRIT Gate", "Rajam Bypass", "Santhakaviti Stop", "Palakonda Stand"],
            srikakulam: ["GMRIT Campus", "Laveru Junction", "Ranasthalam", "Chilakapalem", "Srikakulam Balaga Road"]
          };
          const landmarks = stopsMap[routeKey as keyof typeof stopsMap] || [];
          const landmarkIdx = Math.min(landmarks.length - 1, Math.floor((nextProgress / 100) * landmarks.length));
          currentStopName = landmarks[landmarkIdx] || "Highway Roadway";
        } else {
          // Fallback to static coordinate interpolation if OSRM hasn't loaded yet
          const segmentCount = rawPath.length - 1;
          const scaled = (nextProgress / 100) * segmentCount;
          const idx = Math.min(segmentCount - 1, Math.floor(scaled));
          const fraction = scaled - idx;
          const startPt = rawPath[idx];
          const endPt = rawPath[idx + 1] || startPt;
          lat = startPt[0] + (endPt[0] - startPt[0]) * fraction;
          lng = startPt[1] + (endPt[1] - startPt[1]) * fraction;
          
          const stopsMap = {
            vizianagaram: ["GMRIT Gate", "Rajam Bypass", "Garividi", "Cheepurupalli Junction", "Nellimarla", "Vizianagaram Hub"],
            palakonda: ["GMRIT Gate", "Rajam Bypass", "Santhakaviti Stop", "Palakonda Stand"],
            srikakulam: ["GMRIT Campus", "Laveru Junction", "Ranasthalam", "Chilakapalem", "Srikakulam Balaga Road"]
          };
          currentStopName = stopsMap[routeKey as keyof typeof stopsMap][idx] || "Transit Way";
        }

        let status: 'Not Started' | 'On The Way' | 'Arrived' = 'On The Way';
        if (nextProgress < 8) status = 'Not Started';
        else if (nextProgress > 92) status = 'Arrived';

        let totalMinutes = 35; // Default (Palakonda Route 2)
        let avgSpeed = 48; // km/h
        if (selectedBusNumber.includes('1001')) {
          totalMinutes = 75; // Vizianagaram Route 1
          avgSpeed = 45;
        } else if (selectedBusNumber.includes('1003')) {
          totalMinutes = 70; // Srikakulam Route 3 (NH16)
          avgSpeed = 55;
        }

        const remainingEta = Math.max(1, Math.round((1 - (nextProgress / 100)) * totalMinutes));

        updateBusTelemetryApi({
          busNumber: selectedBusNumber,
          latitude: lat,
          longitude: lng,
          status,
          currentStop: currentStopName,
          eta: status === 'Arrived' ? 0 : remainingEta,
          speed: status === 'On The Way' ? avgSpeed : 0
        }).catch(err => console.warn("Driver sim transmission failed:", err));

        return nextProgress;
      });
    }, 3000);

    return () => clearInterval(simTimer);
  }, [isDriverSimActive, selectedBusNumber]);

  // Handle student verification request
  const handleVerify = async (manualRoll?: string, manualBranch?: string) => {
    const activeRoll = manualRoll || rollNumberInput;
    const activeBranch = manualBranch || branchNameInput;

    if (!activeRoll.trim()) {
      setVerificationError("Verification Alert: Roll Number is required!");
      return;
    }

    setVerifying(true);
    setVerificationError(null);
    try {
      const data = await verifyStudentTransportApi(activeRoll, activeBranch);
      setVerifiedData(data);
      if (data.bus?.busNumber) {
        setSelectedBusNumber(data.bus.busNumber);
      }
      // Synchronize map route endpoints with the student's route if present
      setBusProgress(15); // Start track loop fresh
      if (data.route) {
        setSimulatedETA(15);
      }
      setIsDriverSimActive(true);
      setDriverSimProgress(0);
      routeCoordsRef.current = [];
      setRouteCoordsForSnapping([]);
    } catch (err: any) {
      console.error("Verification failed:", err);
      setVerificationError(
        err.response?.data?.message || 
        "No matching student found. Make sure both Roll Number and Branch Name are correct!"
      );
      setVerifiedData(null);
    } finally {
      setVerifying(false);
    }
  };

  // Quick Demo Selector tool
  const triggerQuickVerify = (demoRoll: string, demoBranch: string) => {
    setRollNumberInput(demoRoll);
    setBranchNameInput(demoBranch);
    handleVerify(demoRoll, demoBranch);
  };

  // Confirm and Track chosen route in 3D Satellite projection
  const handleConfirmRoute3D = (route: typeof allRoutes[0]) => {
    if (!verifiedData) {
      setVerificationError("Access Denied: Please verify your student credentials in the Verification Portal above first to unlock live transit map tracking!");
      const portalElem = document.getElementById("verification-portal-card");
      if (portalElem) {
        portalElem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSelectedBusNumber(route.busNumber);
    setVerifiedData({
      student: verifiedData.student,
      allocation: {
        passNumber: `PASS-${route.routeNumber}`,
        academicYear: "2025-2026",
        monthlyFare: parseInt(route.fare.replace(/[^0-9]/g, "")),
        status: "Active"
      },
      route: {
        id: `route-${route.id}`,
        name: `${route.routeNumber} (${route.coverage})`,
        routeNumber: route.routeNumber,
        startPoint: route.startPoint,
        endPoint: route.endPoint,
        stops: route.stops.map((stop, idx) => ({
          id: String(idx + 1),
          name: stop,
          landmark: "Major Junction",
          fare: 1500,
          arrival: `07:${15 * (idx + 1)} AM`
        }))
      },
      bus: {
        busNumber: route.busNumber,
        make: route.busDetails.split(" ")[0],
        model: route.busDetails,
        capacity: 50,
        type: "Diesel",
        status: "Active",
        gpsDeviceNumber: "GPS-3D-LIVE"
      },
      driver: {
        fullName: route.driverName,
        phone: route.driverPhone,
        licenseNumber: "AP09-3D-2026",
        experienceYears: 12,
        status: "Active"
      }
    });

    setMapMode("satellite");
    setIs3DActive(true);
    setBusProgress(0); // Restart route tracking
    setSimulatedETA(45);
    setIsDriverSimActive(true);
    setDriverSimProgress(0);
    routeCoordsRef.current = [];
    setRouteCoordsForSnapping([]);

    // Smooth scroll down to map element
    setTimeout(() => {
      const mapElem = document.getElementById("gps-tracking-canvas");
      if (mapElem) {
        mapElem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  };



  // Calculate coordinates along a simulated bezier route based on progress percentage
  // Map dimensions are roughly 100% x 100% in relative space
  const getSimulatedBusCoordinates = (progress: number) => {
    const p = progress / 100;
    let x = 0;
    let y = 0;
    let rotate = 0;

    // Defines a winding isometric street path going through city intersections
    if (p < 0.35) {
      const t = p / 0.35;
      x = 20 + t * 25; // 20% to 45%
      y = 65 - t * 13; // 65% to 52%
      rotate = -15;
    } else if (p < 0.70) {
      const t = (p - 0.35) / 0.35;
      x = 45 + t * 15; // 45% to 60%
      y = 52 - t * 16; // 52% to 36%
      rotate = -35;
    } else {
      const t = (p - 0.70) / 0.30;
      x = 60 + t * 20; // 60% to 80%
      y = 36 - t * 21; // 36% to 15%
      rotate = -45;
    }

    return { x: `${x}%`, y: `${y}%`, rotate };
  };

  // 4️⃣ Live Leaflet & OSRM Map Initialization
  useEffect(() => {
    if (!(window as any).L) return;
    if (!selectedRouteId) return;

    // Check if the selected route is a custom geocoded route
    const customCoords = selectedRouteId ? customRouteCoords[selectedRouteId] : null;

    let endpoints: any;

    if (customCoords) {
      // Use the geocoded coordinates for custom routes
      endpoints = customCoords;
    } else {
      let routeKey = 'palakonda';
      if (selectedBusNumber.includes('1001')) routeKey = 'vizianagaram';
      else if (selectedBusNumber.includes('1002')) routeKey = 'palakonda';
      else if (selectedBusNumber.includes('1003')) routeKey = 'srikakulam';

      const routeGPSPaths = {
        vizianagaram: { start: [18.2778, 83.6631], end: [18.1162, 83.3986] },
        palakonda: { start: [18.2778, 83.6631], end: [18.5990, 83.7604] },
        srikakulam: { start: [18.2778, 83.6631], end: [18.3160, 83.8967] }
      };
      endpoints = routeGPSPaths[routeKey as keyof typeof routeGPSPaths] || routeGPSPaths.vizianagaram;
    }

    // Ensure the container exists in the DOM before initializing the map
    const mapElement = document.getElementById('leaflet-live-map');
    if (!mapElement) {
      console.warn("Leaflet map element not found in DOM yet. Delaying initialization.");
      return;
    }

    // Reset Leaflet DOM container
    const container = (window as any).L.DomUtil.get('leaflet-live-map');
    if (container) {
      (container as any)._leaflet_id = null;
    }

    // Instantiate map centring on GMRIT campus Rajam
    const map = (window as any).L.map('leaflet-live-map', {
      zoomControl: false,
      attributionControl: false
    }).setView(endpoints.start, 11);

    // Set tile provider style based on satellite mode
    const tileUrl = mapMode === 'satellite' 
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      
    (window as any).L.tileLayer(tileUrl, {
      maxZoom: 19
    }).addTo(map);

    // 1. Add markers for GMRIT Campus and Terminal Destination
    const campusIcon = (window as any).L.divIcon({
      html: `
        <div class="relative flex flex-col items-center select-none">
          <div class="size-7 bg-gradient-to-br from-indigo-600 to-violet-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-white animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.2 7.8 16.2 16.2 7.8 16.2 7.8 7.8 16.2 7.8"/></svg>
          </div>
        </div>
      `,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    // Determine labels for start and end markers
    const activeRouteForMap = selectedRouteId ? allRoutes.find(r => r.id === selectedRouteId) : null;
    const startLabel = activeRouteForMap?.startPoint || "GMRIT Campus";
    const endLabel = activeRouteForMap?.endPoint || "Destination";

    (window as any).L.marker(endpoints.start, { icon: campusIcon }).addTo(map)
      .bindTooltip(startLabel, { permanent: true, direction: "top", className: "bg-indigo-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow border-none font-sans" });

    const destIcon = (window as any).L.divIcon({
      html: `
        <div class="relative flex flex-col items-center select-none animate-bounce-slow">
          <!-- Premium Glowing Red Map Pin SVG -->
          <svg viewBox="0 0 24 24" class="w-8 h-8 text-rose-600 drop-shadow-md filter saturate-150" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
    (window as any).L.marker(endpoints.end, { icon: destIcon }).addTo(map)
      .bindTooltip(endLabel, { permanent: true, direction: "right", className: "bg-slate-900 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow border-none font-sans" });

    // 2. Setup OSRM / Leaflet Routing Machine path
    let routeControl: any = null;
    if ((window as any).L.Routing) {
      routeControl = (window as any).L.Routing.control({
        waypoints: [
          (window as any).L.latLng(endpoints.start[0], endpoints.start[1]),
          (window as any).L.latLng(endpoints.end[0], endpoints.end[1])
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        createMarker: () => null, // Hide default leaflet markers
        show: false, // Turn off the instructions itinerary card overlay completely!
        lineOptions: {
          styles: [
            { color: '#1E293B', opacity: 0.15, weight: 10 }, // Shadow border
            { color: '#6366F1', opacity: 0.85, weight: 6 }  // Active line
          ]
        }
      }).addTo(map);

      // Listen to exact road shape coordinates computed by OSRM!
      routeControl.on('routesfound', (e: any) => {
        const routeData = e.routes[0];
        const coords = routeData.coordinates;
        if (coords && coords.length > 0) {
          const formattedCoords = coords.map((c: any) => [c.lat, c.lng]);
          routeCoordsRef.current = formattedCoords;
          setRouteCoordsForSnapping(formattedCoords);
        }

        // Extract exact road distance & time to cover
        if (routeData.summary) {
          const distanceKm = Math.round(routeData.summary.totalDistance / 1000);
          const timeMins = Math.round(routeData.summary.totalTime / 60);

          if (selectedRouteId && selectedRouteId > 3) {
            setAllRoutes(prev => prev.map(r => {
              if (r.id === selectedRouteId && r.distance === "Calculating...") {
                // Realistic fare calculation (e.g. ₹40 / km, minimum of ₹1200)
                const calculatedFare = Math.max(1200, Math.round(distanceKm * 40));
                
                let timeStr = `${timeMins} mins`;
                if (timeMins >= 60) {
                  const hrs = Math.floor(timeMins / 60);
                  const mins = timeMins % 60;
                  timeStr = `${hrs} hr ${mins > 0 ? `${mins} mins` : ""}`;
                }

                return {
                  ...r,
                  distance: `${distanceKm} km`,
                  time: timeStr,
                  fare: `₹${calculatedFare.toLocaleString()} / Month`
                };
              }
              return r;
            }));
          }
        }
      });
    }

    // 3. Setup live-updating vehicle marker with custom White Toy Van SVG
    const telemetryLat = liveTelemetry?.latitude || endpoints.start[0];
    const telemetryLng = liveTelemetry?.longitude || endpoints.start[1];
    const [snappedLat, snappedLng] = getSnappedCoordinate(telemetryLat, telemetryLng);
    
    // Calculate rotation dynamically
    let angle = 0;
    if (selectedBusNumber.includes('1001')) angle = -15;
    else if (selectedBusNumber.includes('1003')) angle = -35;
    else angle = -45;

    const vanIcon = (window as any).L.divIcon({
      html: `
        <div class="relative flex flex-col items-center select-none" style="transform: rotate(${angle}deg);">
          <!-- Pulsing Radar ring -->
          <div class="absolute size-16 bg-indigo-500/25 rounded-full -translate-y-2.5 animate-ping"></div>
          <!-- Toy Shuttle Van SVG -->
          <svg viewBox="0 0 54 36" class="w-14 h-9 drop-shadow-xl">
            <ellipse cx="27" cy="29" rx="20" ry="5" fill="#000000" opacity="0.15" />
            <ellipse cx="15" cy="27" rx="5" ry="4" fill="#1E293B" />
            <ellipse cx="37" cy="27" rx="5" ry="4" fill="#1E293B" />
            <ellipse cx="15" cy="27" rx="2" ry="1.5" fill="#E2E8F0" />
            <ellipse cx="37" cy="27" rx="2" ry="1.5" fill="#E2E8F0" />
            <path d="M 6 10 C 6 10 10 7 15 7 L 40 7 C 43 7 45 9 47 13 L 50 17 L 50 25 C 50 26 49 27 47 27 L 8 27 C 7 27 6 26 6 25 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
            <path d="M 40 7 L 47 13 L 44 16 L 37 10 Z" fill="#38BDF8" opacity="0.85" />
            <rect x="11" y="11" width="7" height="6" rx="1.5" fill="#334155" />
            <rect x="20" y="11" width="7" height="6" rx="1.5" fill="#334155" />
            <rect x="29" y="11" width="7" height="6" rx="1.5" fill="#334155" />
            <circle cx="49.5" cy="20.5" r="1.5" fill="#FBBF24" />
            <rect x="6" y="20" width="32" height="1.5" fill="#6366F1" />
          </svg>
        </div>
      `,
      className: '',
      iconSize: [52, 40],
      iconAnchor: [26, 20]
    });

    const busMarker = (window as any).L.marker([snappedLat, snappedLng], { icon: vanIcon }).addTo(map);
    markerRef.current = busMarker;

    // Bind tooltip showing active plates
    busMarker.bindTooltip(selectedBusNumber, { 
      permanent: true, 
      direction: "bottom", 
      className: "bg-slate-900 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow border-none font-sans" 
    });

    return () => {
      if (routeControl) {
        map.removeControl(routeControl);
      }
      map.remove();
      markerRef.current = null;
    };
  }, [leafletLoaded, selectedBusNumber, mapMode, verifiedData, selectedRouteId, customRouteCoords]);

  // 5️⃣ Smooth Marker Translation (Zero Map Fluctuation)
  useEffect(() => {
    if (!markerRef.current || !liveTelemetry) return;
    const lat = liveTelemetry.latitude;
    const lng = liveTelemetry.longitude;
    if (lat && lng) {
      const [snappedLat, snappedLng] = getSnappedCoordinate(lat, lng);
      markerRef.current.setLatLng([snappedLat, snappedLng]);
    }
  }, [liveTelemetry?.latitude, liveTelemetry?.longitude, routeCoordsForSnapping]);

  const getRouteFleetStatus = (busNum: string) => {
    if (selectedBusNumber === busNum) {
      if (!isDriverSimActive) return "Not Started";
      return liveTelemetry?.status || "Not Started";
    }
    return "Not Started";
  };

  // Dynamic computed route info based on grid selection or verified state
  const activeSelectedRoute = allRoutes.find(r => r.id === selectedRouteId);

  const displayRouteNumber = activeSelectedRoute 
    ? activeSelectedRoute.routeNumber 
    : (verifiedData?.route?.routeNumber || "Route 2");
    
  const displayStartPoint = activeSelectedRoute 
    ? activeSelectedRoute.startPoint 
    : (verifiedData?.route?.startPoint || "Rajam Bypass");
    
  const displayEndPoint = activeSelectedRoute 
    ? activeSelectedRoute.endPoint 
    : (verifiedData?.route?.endPoint || "Palakonda Bus Stand");

  const displayDriverName = activeSelectedRoute
    ? activeSelectedRoute.driverName
    : (verifiedData?.driver?.fullName || "Mohammad Rafiq");

  const displayDriverPhone = activeSelectedRoute
    ? activeSelectedRoute.driverPhone
    : (verifiedData?.driver?.phone || "9848011222");

  const displayBusNumber = activeSelectedRoute
    ? activeSelectedRoute.busNumber
    : (verifiedData?.bus?.busNumber || "TS-09-UB-1002");

  const displayBusModel = activeSelectedRoute
    ? activeSelectedRoute.busDetails
    : (verifiedData?.bus?.model || "Leyland Viking 60 (60 seats)");

  const displayFare = activeSelectedRoute
    ? activeSelectedRoute.fare
    : (verifiedData?.allocation?.monthlyFare ? `₹${verifiedData.allocation.monthlyFare.toLocaleString()} / Month` : "₹1,500 / Month");

  return (
    <div className="space-y-8 pb-12 text-slate-700">
      {/* Premium Page Header with Home Portal Link */}
      <PageHeader
        title="Smart Fleet & Transport Hub"
        desc="Real-time GPS Tracking, Live Database Verification, and Automated Route Coordination."
        actions={
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-1.5"
          >
            <ArrowRight className="size-3.5 rotate-180 text-indigo-500" />
            Back to Dashboard
          </Link>
        }
      />

      {/* SECTION 1: SECURE VERIFICATION PORTAL (LIGHT INTEGRATED THEME) */}
      <Card id="verification-portal-card" className="border border-indigo-100 bg-white shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Compass className="size-48 text-indigo-600 rotate-12" />
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-9 rounded-xl bg-indigo-50 border border-indigo-100 grid place-items-center text-indigo-600">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Secure Student Verification Portal</h2>
              <p className="text-xs text-slate-500">Search student credentials to unlock personalized allocation columns and real-time telemetry.</p>
            </div>
          </div>

          {/* Form and Search Inputs */}
          <div className="grid md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-9 grid sm:grid-cols-2 gap-3">
              {/* Field 1: Roll Number */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-450" />
                <input
                  type="text"
                  placeholder="Roll Number (e.g. CS2026101)"
                  value={rollNumberInput}
                  onChange={(e) => setRollNumberInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all duration-300"
                />
              </div>

              {/* Field 2: Branch Name / Department */}
              <div className="flex gap-2">
                <select
                  value={branchNameInput}
                  onChange={(e) => setBranchNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all duration-300 cursor-pointer"
                >
                  <option value="" disabled className="text-slate-400">Select Branch</option>
                  {(departments || []).map((dep) => (
                    <option key={dep.code} value={dep.code}>
                      {dep.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleVerify()}
                  disabled={verifying}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-600/10 transition-all duration-300 active:scale-95 shrink-0"
                >
                  {verifying ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>

            <div className="md:col-span-3 flex flex-wrap gap-2 items-center justify-start md:justify-end text-xs text-slate-500">
              <span className="font-medium text-slate-450">Quick Demos:</span>
              <button
                onClick={() => triggerQuickVerify("CS2026101", "CSE")}
                className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-650 hover:text-indigo-600 rounded-md transition-all duration-200"
              >
                Hanish (CSE)
              </button>
              <button
                onClick={() => triggerQuickVerify("AM2026102", "AIML")}
                className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-650 hover:text-indigo-600 rounded-md transition-all duration-200"
              >
                Bhavya (AIML)
              </button>
            </div>
          </div>

          {/* Verification Status Feedback Alerts */}
          {verificationError && (
            <div className="mt-3 flex items-start gap-2.5 p-3 rounded-xl border border-red-100 bg-red-50 text-red-700 text-xs">
              <ShieldAlert className="size-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Verification Alert:</span> {verificationError}
              </div>
            </div>
          )}

          {verifiedData && (
            <div className="mt-3 flex items-start gap-2.5 p-3 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 text-xs animate-in fade-in duration-300">
              <ShieldCheck className="size-4 shrink-0 mt-0.5 text-emerald-600 animate-bounce" />
              <div className="flex-1 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <span className="font-bold">Access Granted:</span> Personalized route and tracking logs successfully synchronized for <span className="font-semibold text-emerald-800">{verifiedData.student.fullName}</span>!
                </div>
                <button 
                  onClick={() => setVerifiedData(null)}
                  className="text-[10px] uppercase font-bold tracking-wider hover:underline text-slate-500 hover:text-slate-800"
                >
                  Clear Session
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* SECTION 1.5: FIXED ROUTE AREA SELECTION */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden relative transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Map className="size-48 text-indigo-600 rotate-12" />
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-9 rounded-xl bg-indigo-50 border border-indigo-100 grid place-items-center text-indigo-600">
              <Compass className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Fixed Transit Route Selector</h2>
              <p className="text-xs text-slate-500">Select one of our standard operating routes to display details, calculate fares, and start live 3D satellite tracking.</p>
            </div>
          </div>

          {/* Route Cards Grid */}
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allRoutes.map((route) => {
              const isActive = selectedRouteId === route.id;
              const isCustom = route.id > 3;
              return (
                <div
                  key={route.id}
                  onClick={() => {
                    setSelectedRouteId(route.id);
                    setSelectedBusNumber(route.busNumber);
                    setIsDriverSimActive(true);
                    setDriverSimProgress(0);
                    routeCoordsRef.current = [];
                    setRouteCoordsForSnapping([]);
                  }}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-28 ${
                    isActive 
                      ? "border-indigo-600 bg-indigo-50/20 shadow-md ring-1 ring-indigo-500/10" 
                      : isCustom
                        ? "border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-sm"
                        : "border-slate-250 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                      isActive ? "bg-indigo-600 text-white" : isCustom ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"
                    }`}>
                      {route.routeNumber}{isCustom ? " ★" : ""}
                    </span>
                    <Bus className={`size-4 ${isActive ? "text-indigo-600 animate-pulse" : isCustom ? "text-emerald-500" : "text-slate-400"}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{route.coverage}</h4>
                    <span className="text-[10px] text-slate-400 block">From: {route.startPoint}</span>
                  </div>
                </div>
              );
            })}

            {/* Add New Route Card */}
            <div
              onClick={() => setShowNewRouteForm(true)}
              className={`cursor-pointer rounded-2xl p-4 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center min-h-28 gap-2 ${
                showNewRouteForm
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-slate-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/30"
              }`}
            >
              <PlusCircle className="size-6 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">Add New Route</span>
            </div>
          </div>

          {/* New Route Form (appears below cards when toggled) */}
          {showNewRouteForm && (
            <div className="mt-5 p-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 mb-4">
                <PlusCircle className="size-5 text-emerald-600" />
                <h4 className="font-bold text-slate-800 text-sm">Create New Travel Route</h4>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Starting Place</label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad, Visakhapatnam"
                    value={newRouteStart}
                    onChange={(e) => setNewRouteStart(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Destination Place</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajam, Srikakulam"
                    value={newRouteEnd}
                    onChange={(e) => setNewRouteEnd(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveNewRoute}
                  disabled={savingRoute || !newRouteStart.trim() || !newRouteEnd.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingRoute ? (
                    <><Activity className="size-3.5 animate-spin" /> Locating Places...</>
                  ) : (
                    <><ShieldCheck className="size-3.5" /> Save Route</>
                  )}
                </button>
                <button
                  onClick={() => { setShowNewRouteForm(false); setNewRouteStart(""); setNewRouteEnd(""); }}
                  className="px-4 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Route Details expansion panel below */}
          {selectedRouteId && (() => {
            const activeRoute = allRoutes.find(r => r.id === selectedRouteId);
            if (!activeRoute) return null;
            return (
              <div className="mt-6 pt-5 border-t border-slate-100 animate-in fade-in duration-300">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-3 mb-4">
                    <div>
                      <h4 className="font-bold text-slate-850 text-sm">Routings & Transit Details for {activeRoute.coverage}</h4>
                      <p className="text-[11px] text-slate-500">Please review coverage specs, fares, and active driver information below.</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Est. Fare</span>
                      <span className="font-bold text-indigo-600 text-base">{activeRoute.fare}</span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4">
                    <div className="bg-white border border-slate-150 p-3 rounded-xl shadow-sm">
                      <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Time to Cover</span>
                      <span className="font-bold text-slate-700 text-xs">{activeRoute.time}</span>
                    </div>
                    <div className="bg-white border border-slate-150 p-3 rounded-xl shadow-sm">
                      <span className="text-slate-450 block text-[9px] uppercase tracking-wider mb-0.5">Route Distance</span>
                      <span className="font-bold text-slate-700 text-xs">{activeRoute.distance}</span>
                    </div>
                    <div className="bg-white border border-slate-150 p-3 rounded-xl shadow-sm">
                      <span className="text-slate-450 block text-[9px] uppercase tracking-wider mb-0.5">Assigned Driver</span>
                      <span className="font-bold text-slate-700 text-xs block leading-tight">{activeRoute.driverName}</span>
                      <span className="text-[10px] text-indigo-600 font-medium">Ph: {activeRoute.driverPhone}</span>
                    </div>
                    <div className="bg-white border border-slate-150 p-3 rounded-xl shadow-sm">
                      <span className="text-slate-450 block text-[9px] uppercase tracking-wider mb-0.5">Vehicle Specs</span>
                      <span className="font-bold text-slate-700 text-xs block leading-tight">{activeRoute.busNumber}</span>
                      <span className="text-[10px] text-slate-500">{activeRoute.busDetails}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-4 mt-6">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-550">
                      <ShieldCheck className="size-4 text-indigo-600 shrink-0" />
                      <span>If details are correct, press the confirm button to launch 3D Satellite live tracking!</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConfirmRoute3D(activeRoute)}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/10 flex items-center gap-2 transition-all active:scale-95"
                    >
                      <Navigation className="size-3.5 animate-bounce-slow" /> Confirm Route & Open 3D Map
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </Card>

      {/* SECTION 2: PERSONALIZED LAYOUT (UNLOCKED COLUMNS - LIGHT CARD STYLES) */}
      {verifiedData && (
        <div className="grid lg:grid-cols-12 gap-6 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Column A: Student Pass & Allocation Info */}
          <div className="lg:col-span-5 flex flex-col">
            <Card className="flex-1 border border-slate-100 bg-white flex flex-col justify-between overflow-hidden relative shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <User className="size-4 text-indigo-600" /> Student Verification Pass
                  </h3>
                  <Badge tone="success" className="text-[10px] py-0.5 px-2">
                    Verified Active
                  </Badge>
                </div>

                {/* Glassmorphic ID Card Design (Light Vibrant Blue Gradients) */}
                <div className="relative rounded-2xl p-4 bg-gradient-to-br from-indigo-50 via-slate-50 to-white border border-indigo-150 shadow-sm mb-6 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-200/30 to-cyan-200/30 rounded-full blur-xl opacity-50" />
                  
                  <div className="flex items-start gap-4">
                    {/* Student Profile Initials Avatar */}
                    <div className="size-16 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                      {verifiedData.student.fullName.split(" ").map(n => n[0]).join("")}
                    </div>

                    <div className="space-y-1 flex-1">
                      <h4 className="font-bold text-slate-800 text-base">{verifiedData.student.fullName}</h4>
                      <p className="text-[11px] text-slate-500 tracking-wider uppercase font-mono">{verifiedData.student.rollNumber}</p>
                      
                      <div className="pt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Branch</span>
                          <span className="text-slate-700 font-semibold">{verifiedData.student.department}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Sem / Year</span>
                          <span className="text-slate-700 font-semibold">Sem {verifiedData.student.semester} / Yr {verifiedData.student.year}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pass Barcode simulation */}
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Pass Number</span>
                      <span className="text-indigo-600 font-mono text-xs font-bold">{verifiedData.allocation?.passNumber || "NOT_ALLOCATED"}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Pass Status</span>
                      <span className="text-emerald-600 font-bold text-xs">{verifiedData.allocation?.status || "Active"}</span>
                    </div>
                  </div>
                </div>

                {/* Student Analytics */}
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                    <span className="text-slate-400 text-[10px] uppercase block mb-0.5">CGPA</span>
                    <span className="font-bold text-slate-700 text-sm">{verifiedData.student.cgpa}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                    <span className="text-slate-400 text-[10px] uppercase block mb-0.5">Attendance</span>
                    <span className="font-bold text-slate-700 text-sm">{verifiedData.student.attendance}%</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                    <span className="text-slate-400 text-[10px] uppercase block mb-0.5">Monthly Fare</span>
                    <span className="font-bold text-indigo-650 text-sm">{displayFare.split(" /")[0]}</span>
                  </div>
                </div>
              </div>

              {/* Verified Stops Timeline */}
              <div className="mt-auto border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Allocated Route Coverage</h4>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <MapPin className="size-4 text-indigo-500 shrink-0" />
                  <div className="flex-1 truncate text-slate-700">
                    <span className="font-semibold text-slate-500">From</span> {displayStartPoint} <span className="font-semibold text-slate-500">➔</span> {displayEndPoint}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Column B: Driver & Vehicle Allocation Details */}
          <div className="lg:col-span-7 flex flex-col">
            <Card className="flex-1 border border-slate-100 bg-white flex flex-col justify-between overflow-hidden relative shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-50 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Bus className="size-4 text-cyan-600" /> Driver & Vehicle Allocation details
                  </h3>
                  <div className="flex gap-2">
                    <Badge tone="info" className="text-[10px] py-0.5 px-2">
                      Route: {displayRouteNumber}
                    </Badge>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Driver Profile */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full bg-slate-100 border border-slate-200 grid place-items-center text-slate-400 overflow-hidden shadow-inner">
                        <User className="size-6 text-slate-455" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{displayDriverName}</h4>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{verifiedData.driver.status} Driver</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-slate-100 py-1.5">
                        <span className="text-slate-450">Contact Number:</span>
                        <a href={`tel:${displayDriverPhone}`} className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold">
                          <Phone className="size-3" /> {displayDriverPhone}
                        </a>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 py-1.5">
                        <span className="text-slate-450">License ID:</span>
                        <span className="text-slate-700 font-mono font-semibold">{verifiedData.driver.licenseNumber}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 py-1.5">
                        <span className="text-slate-455">Experience:</span>
                        <span className="text-slate-700 font-semibold">{verifiedData.driver.experienceYears} Years Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle details */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-1">Allocated Bus</span>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-cyan-50 text-cyan-600 grid place-items-center">
                          <Bus className="size-5" />
                        </div>
                        <div>
                          <span className="font-mono font-bold text-slate-800 text-sm block leading-tight">{displayBusNumber}</span>
                          <span className="text-[10px] text-slate-500">{displayBusModel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-slate-100 py-1.5">
                        <span className="text-slate-455">Bus Seating Capacity:</span>
                        <span className="text-slate-700 font-semibold">{verifiedData.bus.capacity} seats</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 py-1.5">
                        <span className="text-slate-455">Fuel Specification:</span>
                        <span className="text-slate-700 font-semibold capitalize">{verifiedData.bus.type}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 py-1.5">
                        <span className="text-slate-455">GPS Device ID:</span>
                        <span className="text-cyan-600 font-mono font-semibold">{verifiedData.bus.gpsDeviceNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance Status Warning Banner */}
              <div className="mt-6 p-2.5 rounded-xl border border-indigo-50 bg-indigo-50/30 text-indigo-700 text-xs flex items-center gap-2 font-medium">
                <Activity className="size-4 shrink-0 animate-pulse text-indigo-650" />
                <span>GPS telemetry verification checks completed. All safety logs active.</span>
              </div>
            </Card>
          </div>

        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* GPS Google Maps Container */}
        <div className="lg:col-span-8 flex flex-col">
          <Card id="gps-tracking-canvas" className="flex-1 p-0 border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col relative group">
            
            {/* Map Top Bar Control Overlay */}
            <div className="absolute top-3 left-3 right-3 z-10 flex gap-2 justify-between items-center pointer-events-none">
              
              {/* Left Side: Mock Address Bar */}
              <div className="flex items-center gap-2 bg-white/95 border border-slate-200 px-3 py-1.5 rounded-xl shadow-md pointer-events-auto max-w-xs md:max-w-md">
                <Compass className="size-4 text-indigo-600 animate-spin-slow shrink-0" />
                <span className="text-[11px] text-slate-750 font-bold truncate">
                  {verifiedData ? verifiedData.route?.startPoint : "North Campus Transit Line"} ➔ College Campus
                </span>
              </div>

              {/* Right Side: Map Toggles */}
              <div className="flex gap-1 bg-white/95 border border-slate-200 p-1 rounded-xl shadow-md pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setMapMode("streets")}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all duration-200 flex items-center gap-1 ${mapMode === "streets" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-750"}`}
                >
                  <Map className="size-3" /> Map
                </button>
                <button
                  type="button"
                  onClick={() => setMapMode("satellite")}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all duration-200 flex items-center gap-1 ${mapMode === "satellite" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-750"}`}
                >
                  <Layers className="size-3" /> Satellite
                </button>
                <button
                  type="button"
                  onClick={() => setIs3DActive(!is3DActive)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all duration-200 flex items-center gap-1 ${is3DActive ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-755"}`}
                >
                  <Layers className={`size-3 ${is3DActive ? "animate-spin-slow" : ""}`} /> 3D View
                </button>
                <button
                  type="button"
                  onClick={() => setTrafficActive(!trafficActive)}
                  className={`ml-1 px-2 py-1 text-[10px] font-bold rounded-lg transition-all duration-200 flex items-center gap-1 ${trafficActive ? "bg-amber-100 text-amber-800 border border-amber-250" : "text-slate-400 hover:text-slate-500"}`}
                >
                  <Activity className="size-3" /> Traffic
                </button>
              </div>
            </div>

            {/* Real-time Interactive Leaflet Map Wrapper */}
            <div className="relative h-[480px] overflow-hidden rounded-xl bg-slate-100 shadow-inner animate-all duration-500">
              {/* Leaflet actual map canvas element */}
              <div id="leaflet-live-map" className="w-full h-full z-0" />

              {/* SECURE MAP LOCK OVERLAY */}
              {!verifiedData && (
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-md z-[2000] flex flex-col items-center justify-center text-center p-6 transition-all duration-300">
                  <div className="size-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center text-white mb-4 animate-pulse">
                    <Lock className="size-7 text-indigo-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">🔒 Live GPS Tracking Locked</h3>
                  <p className="text-xs text-indigo-150 max-w-sm leading-relaxed mb-6">
                    Verification Required. Please verify your student credentials in the Verification Portal above to unlock the high-fidelity live transit map and real-time GPS tracking.
                  </p>
                  <button
                    onClick={() => {
                      const portalElem = document.getElementById("verification-portal-card");
                      if (portalElem) {
                        portalElem.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                    className="px-5 py-2.5 bg-white hover:bg-slate-50 text-indigo-600 hover:text-indigo-500 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    Go to Verification Portal
                  </button>
                </div>
              )}

              {/* Map Floating Control Overlay */}
              <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
                <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-slate-200/80 flex items-center gap-1">
                  <button 
                    onClick={() => setMapMode("streets")} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mapMode === "streets" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-slate-600 hover:bg-slate-105"}`}
                  >
                    <Compass className="inline size-3.5 mr-1" />
                    Streets Map
                  </button>
                  <button 
                    onClick={() => setMapMode("satellite")} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mapMode === "satellite" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-slate-600 hover:bg-slate-105"}`}
                  >
                    <Layers className="inline size-3.5 mr-1" />
                    Satellite View
                  </button>
                </div>
              </div>

              {/* Active Selection Floating Bar */}
              <div className="absolute top-4 right-4 z-[1000]">
                <div className="bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-705 flex items-center gap-2">
                  <span className="size-2 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tracking Bus:</span>
                  <span className="text-xs font-bold text-white font-mono">{selectedBusNumber}</span>
                </div>
              </div>
            </div>

            {/* Google Map Telemetry Dashboard Bottom Bar */}
            <div className="bg-white border-t border-slate-100 p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                
                {/* Telemetry Item 1: Active Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Route Progress</span>
                    <span className="font-semibold text-slate-700">{busProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${busProgress}%` }}
                    />
                  </div>
                </div>

                {/* Telemetry Item 2: Speedometer (Dynamic) */}
                <div className="flex items-center gap-2 border-l border-slate-100 md:pl-4">
                  <div className="size-8 rounded-lg bg-indigo-50 grid place-items-center text-indigo-600 shrink-0">
                    <Activity className="size-4 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block leading-none">GPS Speed</span>
                    <span className="font-bold text-slate-800 text-sm font-mono">{liveTelemetry?.speed || 0} km/h</span>
                  </div>
                </div>

                {/* Telemetry Item 3: Estimated Time of Arrival (ETA) */}
                <div className="flex items-center gap-2 border-l border-slate-100 md:pl-4">
                  <div className="size-8 rounded-lg bg-cyan-50 grid place-items-center text-cyan-600 shrink-0">
                    <Navigation className="size-4 animate-bounce-slow" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block leading-none">Live ETA Status</span>
                    <span className="font-bold text-slate-800 text-sm font-mono">{liveTelemetry?.eta || 25} mins left</span>
                  </div>
                </div>

                {/* Telemetry Item 4: Connection Indicator */}
                <div className="flex items-center gap-2 border-l border-slate-100 md:pl-4">
                  <div className="size-8 rounded-lg bg-emerald-50 grid place-items-center text-emerald-600 shrink-0">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block leading-none">GPS Stop Location</span>
                    <span className="text-slate-700 font-bold text-xs truncate max-w-[130px] block font-sans" title={liveTelemetry?.currentStop || 'Locating Stop...'}>
                      {liveTelemetry?.currentStop || 'Near Campus...'}
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </Card>


        </div>

        {/* Column C: Live Active Fleet Status Center */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Active Allocations overview (Light white card style) */}
          <Card className="border border-slate-100 bg-white flex-1 flex flex-col justify-between shadow-sm min-h-[480px]">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2.5 text-sm flex items-center gap-2">
                <Activity className="size-4 text-cyan-600" /> Active fleet Status
              </h3>
              <p className="text-xs text-slate-500 mb-4">Overview of all active route allocations currently operating in the fleet.</p>
              
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {allRoutes.map((route) => {
                  const status = getRouteFleetStatus(route.busNumber);
                  return (
                    <div 
                      key={route.id} 
                      className={`p-3 border rounded-xl text-xs flex justify-between items-center gap-3 transition-all ${
                        selectedBusNumber === route.busNumber 
                          ? "bg-indigo-50/50 border-indigo-200 shadow-sm ring-1 ring-indigo-500/10" 
                          : "bg-slate-50 border-slate-100 hover:bg-slate-100/55"
                      }`}
                    >
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">{route.routeNumber}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({route.busNumber})</span>
                        </div>
                        <span className="text-[10px] text-slate-550 block mt-0.5 truncate font-medium">
                          {route.coverage}
                        </span>
                      </div>
                      <Badge 
                        tone={
                          status === "On The Way" 
                            ? "success" 
                            : status === "Arrived"
                            ? "info" 
                            : "warn"
                        } 
                        className={`text-[9px] py-1 px-2 shrink-0 font-bold tracking-wide ${
                          status === "On The Way" ? "animate-pulse" : ""
                        }`}
                      >
                        {status === "On The Way" ? "On Route" : status === "Arrived" ? "Reached" : "Not Started"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 mt-6">
              <span>Total Active Lines: {allRoutes.length}</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold animate-pulse">
                <span className="size-2 bg-emerald-500 rounded-full animate-ping" />
                Live Feed Sync
              </span>
            </div>
          </Card>

        </div>

      </div>

      {/* Embedded High-Fidelity Styling Stylesheet */}
      <style>{`
        /* Styled Map Grids simulating Google Maps street overlays */
        .grid-bg-streets {
          background-size: 35px 35px;
          background-image: 
            linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
        }
        
        .grid-bg-satellite {
          background-size: 50px 50px;
          background-image: 
            radial-gradient(circle, rgba(99, 102, 241, 0.07) 1px, transparent 1px),
            linear-gradient(to right, rgba(6, 182, 212, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.02) 1px, transparent 1px);
        }

        .bg-radial-gradient-dark {
          background: radial-gradient(circle at center, transparent 30%, #020617 95%);
        }

        /* SVG Dash line travel animation */
        @keyframes dash-scroll {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-dash {
          animation: dash-scroll 8s linear infinite;
        }

        /* Custom transitions and slow floating */
        @keyframes floating-bounce {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .animate-bounce-slow {
          animation: floating-bounce 3s ease-in-out infinite;
        }

        @keyframes spinning-slow {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spinning-slow 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
