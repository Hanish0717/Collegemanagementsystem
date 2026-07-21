/**
 * seedService.ts
 * Auto-seeds Supabase tables with default data if they are empty.
 * Called during app startup / first fetch of each resource.
 */
import { supabase } from "@/lib/supabaseClient";

// ── Default Departments ───────────────────────────────────────────────────────
const DEFAULT_DEPARTMENTS = [
  { code: "CSE", name: "Computer Science & Engineering" },
  { code: "ECE", name: "Electronics & Communication Engineering" },
  { code: "EEE", name: "Electrical & Electronics Engineering" },
  { code: "MECH", name: "Mechanical Engineering" },
  { code: "CIVIL", name: "Civil Engineering" },
  { code: "IT", name: "Information Technology" },
  { code: "AIDS", name: "Artificial Intelligence & Data Science" },
  { code: "CSBS", name: "Computer Science & Business Systems" },
  { code: "MBA", name: "Master of Business Administration" },
  { code: "MCA", name: "Master of Computer Applications" },
];

export async function seedDepartmentsIfEmpty(): Promise<void> {
  try {
    const { count } = await supabase
      .from("departments")
      .select("code", { count: "exact", head: true });

    if ((count ?? 0) === 0) {
      console.info("[seed] Departments table is empty – seeding default departments…");
      const { error } = await supabase.from("departments").insert(DEFAULT_DEPARTMENTS);
      if (error) {
        console.error("[seed] Failed to seed departments:", error.message);
      } else {
        console.info("[seed] Departments seeded successfully.");
      }
    }
  } catch (err) {
    console.error("[seed] Error checking/seeding departments:", err);
  }
}

// ── Default Hostels, Blocks & Rooms ──────────────────────────────────────────
const DEFAULT_HOSTELS = [
  { name: "Vivekananda Boys Hostel", type: "Boys", total_rooms: 100, capacity: 400 },
  { name: "Sarojini Girls Hostel", type: "Girls", total_rooms: 80, capacity: 320 },
];

export async function seedHostelsIfEmpty(): Promise<void> {
  try {
    const { count } = await supabase
      .from("hostels")
      .select("id", { count: "exact", head: true });

    if ((count ?? 0) > 0) return; // already has data

    console.info("[seed] Hostels table is empty – seeding default hostel data…");

    for (const hostelData of DEFAULT_HOSTELS) {
      // Insert hostel
      const { data: hostel, error: hostelErr } = await supabase
        .from("hostels")
        .insert([hostelData])
        .select()
        .single();

      if (hostelErr || !hostel) {
        console.error("[seed] Failed to seed hostel:", hostelData.name, hostelErr?.message);
        continue;
      }

      // Insert 2 blocks per hostel
      const blocks = [
        { hostel_id: hostel.id, name: "Block A", total_rooms: Math.floor(hostelData.total_rooms / 2) },
        { hostel_id: hostel.id, name: "Block B", total_rooms: hostelData.total_rooms - Math.floor(hostelData.total_rooms / 2) },
      ];

      for (const blockData of blocks) {
        const { data: block, error: blockErr } = await supabase
          .from("hostel_blocks")
          .insert([blockData])
          .select()
          .single();

        if (blockErr || !block) {
          console.error("[seed] Failed to seed block:", blockData.name, blockErr?.message);
          continue;
        }

        // Insert 5 rooms per block across 2 floors
        const rooms: any[] = [];
        const blockPrefix = blockData.name.replace("Block ", "");
        for (let floor = 1; floor <= 2; floor++) {
          for (let room = 1; room <= 5; room++) {
            const roomNumber = `${blockPrefix}${floor}0${room}`;
            rooms.push({
              hostel_id: hostel.id,
              block_id: block.id,
              room_number: roomNumber,
              floor,
              type: room % 2 === 0 ? "AC" : "Non-AC",
              capacity: 4,
              occupants: 0,
            });
          }
        }

        const { error: roomsErr } = await supabase.from("hostel_rooms").insert(rooms);
        if (roomsErr) {
          console.error("[seed] Failed to seed rooms for block:", block.id, roomsErr.message);
        }
      }
    }

    console.info("[seed] Hostel data seeded successfully.");
  } catch (err) {
    console.error("[seed] Error checking/seeding hostels:", err);
  }
}

// ── Default System Notifications ─────────────────────────────────────────────
const DEFAULT_NOTIFICATIONS = [
  { id: `HN-${Date.now() % 1000000}-1`, title: "Hostel fee payment reminder — Q1 2026", type: "Fee", time: "1h ago", unread: true },
  { id: `HN-${Date.now() % 1000000}-2`, title: "New room allocation complaint submitted", type: "Complaint", time: "2h ago", unread: true },
  { id: `HN-${Date.now() % 1000000}-3`, title: "Hostel policy update: Gate closing time changed to 10 PM", type: "Policy", time: "1d ago", unread: true },
  { id: `HN-${Date.now() % 1000000}-4`, title: "Mess menu updated for next week", type: "Mess", time: "2d ago", unread: false },
  { id: `HN-${Date.now() % 1000000}-5`, title: "Maintenance work scheduled: Water supply cut on 3rd floor", type: "Maintenance", time: "3d ago", unread: false },
  { id: `HN-${Date.now() % 1000000}-6`, title: "New resident check-in: Room A101", type: "Info", time: "3d ago", unread: false },
];

export async function seedNotificationsIfEmpty(): Promise<void> {
  try {
    const { count } = await supabase
      .from("system_notifications")
      .select("id", { count: "exact", head: true });

    if ((count ?? 0) === 0) {
      console.info("[seed] system_notifications table is empty – seeding default notifications…");
      const { error } = await supabase.from("system_notifications").insert(DEFAULT_NOTIFICATIONS);
      if (error) {
        console.error("[seed] Failed to seed notifications:", error.message);
      } else {
        console.info("[seed] Notifications seeded successfully.");
      }
    }
  } catch (err) {
    console.error("[seed] Error checking/seeding notifications:", err);
  }
}
