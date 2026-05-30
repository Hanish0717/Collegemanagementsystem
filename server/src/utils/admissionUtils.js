import { supabase } from '../config/supabase.js';

const DEPT_CODES = {
  CSE: "CSE",
  AIML: "AIML",
  AIDS: "AIDS",
  CYBERSECURITY: "CY",
  IT: "IT",
  ECE: "ECE",
  EEE: "EEE",
  MECH: "MECH",
  CIVIL: "CIV"
};

/**
 * Normalizes department string into a standardized code
 */
export const getDeptCode = (dept) => {
  if (!dept) return 'CSE';
  const clean = dept.toUpperCase().trim();
  
  if (DEPT_CODES[clean]) return DEPT_CODES[clean];
  
  // keyword matching
  if (clean.includes('COMPUTER SCIENCE') || clean.includes('CSE')) return 'CSE';
  if ((clean.includes('ARTIFICIAL') && clean.includes('MACHINE')) || clean.includes('AIML')) return 'AIML';
  if ((clean.includes('ARTIFICIAL') && clean.includes('DATA')) || clean.includes('AIDS')) return 'AIDS';
  if (clean.includes('CYBER') || clean.includes('CSD') || clean.includes('CY')) return 'CY';
  if (clean.includes('INFORMATION TECHNOLOGY') || clean.includes('IT')) return 'IT';
  if (clean.includes('COMMUNICATION') || clean.includes('ECE')) return 'ECE';
  if (clean.includes('ELECTRICAL') || clean.includes('EEE')) return 'EEE';
  if (clean.includes('MECHANICAL') || clean.includes('MECH')) return 'MECH';
  if (clean.includes('CIVIL') || clean.includes('CIV')) return 'CIV';
  
  return clean.slice(0, 4); // fallback to first 4 chars
};

/**
 * Generates the next sequential unique admission number for a department
 */
export const generateAdmissionNumber = async (department) => {
  const yearPrefix = String(new Date().getFullYear()).slice(-2); // e.g. "26"
  const deptCode = getDeptCode(department);
  const prefix = `${yearPrefix}${deptCode}`; // e.g. "26CSE"

  // Query students matching the prefix
  const { data: existing, error } = await supabase
    .from('students')
    .select('admission_number')
    .like('admission_number', `${prefix}%`);

  if (error) {
    console.error("Error fetching students for admission number generation:", error);
    throw error;
  }

  let maxSeq = 0;
  if (existing && existing.length > 0) {
    existing.forEach(s => {
      if (s.admission_number) {
        const suffixStr = s.admission_number.substring(prefix.length);
        const seq = parseInt(suffixStr, 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });
  }

  const nextSeq = maxSeq + 1;
  const admissionNumber = `${prefix}${String(nextSeq).padStart(2, '0')}`;
  return admissionNumber;
};
