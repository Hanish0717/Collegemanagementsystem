import { hodApi } from '../api/hodApi';
import { DepartmentCode } from '../types';
import { hodStore } from './hodStore';

export interface MentoringItem {
  id: string;
  name: string;
  rollNumber: string;
  sem: number;
  sec: string;
  mentor: string;
  lastMeeting: string;
  nextMeeting: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  attendance: number;
  cgpa: number;
  status: string;
}

export interface ResearchPublicationItem {
  id: string;
  faculty: string;
  title: string;
  journal: string;
  year: number;
  doi: string;
  indexing: string;
  citations: number;
  status: string;
}

export interface EventItem {
  id: string;
  name: string;
  category: string;
  organizer: string;
  coordinator: string;
  venue: string;
  date: string;
  participants: number;
  status: string;
  budget: string;
}

export async function fetchDepartmentMentoring(deptCode: DepartmentCode = 'AIML') {
  try {
    const data = await hodApi.get<{
      success: boolean;
      summary: any;
      mentoringList: MentoringItem[];
    }>('/api/hod/mentoring', {}, deptCode);
    if (data.mentoringList && data.mentoringList.length > 0) return data;
  } catch (err) {
    console.warn('Backend mentoring fetch using persistent store');
  }

  const list = hodStore.getMentoringList(deptCode);
  return {
    summary: {
      totalMentors: 12,
      studentsAssigned: 480,
      pendingMeetings: 8,
      completedMeetings: 42,
      studentsAtRisk: 5,
      parentMeetings: 3,
      mentoringSessions: 50,
      counselingCases: 4,
      avgMentorRating: 4.8,
      openActionItems: 2,
    },
    mentoringList: list,
  };
}

export async function fetchDepartmentResearch(deptCode: DepartmentCode = 'AIML') {
  try {
    const data = await hodApi.get<{
      success: boolean;
      summary: any;
      publications: ResearchPublicationItem[];
    }>('/api/hod/research', {}, deptCode);
    return data;
  } catch (err) {
    console.warn('Backend research fetch fallback to isolated dataset');
    return getFallbackResearch(deptCode);
  }
}

export async function fetchDepartmentEvents(deptCode: DepartmentCode = 'AIML') {
  try {
    const data = await hodApi.get<{
      success: boolean;
      summary: any;
      events: EventItem[];
    }>('/api/hod/events', {}, deptCode);
    return data;
  } catch (err) {
    console.warn('Backend events fetch fallback to isolated dataset');
    return getFallbackEvents(deptCode);
  }
}

function getFallbackResearch(deptCode: DepartmentCode) {
  return {
    summary: {
      researchPapers: 28,
      scopusPublications: 18,
      sciJournals: 10,
      patents: 4,
      researchGrants: 3,
      books: 2,
      bookChapters: 6,
      conferencePapers: 12,
      facultyProjects: 5,
      studentProjects: 14,
    },
    publications: [
      { id: 'PUB-101', faculty: 'Dr. Ramesh Kumar', title: 'Deep Vision Transformers for Medical Imaging', journal: 'IEEE Transactions on AI', year: 2026, doi: '10.1109/TAI.2026.101', indexing: 'SCI / Scopus Q1', citations: 42, status: 'Published' },
      { id: 'PUB-102', faculty: 'Prof. Sneha Verma', title: 'Low-Resource Neural Machine Translation', journal: 'ACM Transactions on Asian Language Processing', year: 2025, doi: '10.1145/TALP.2025.102', indexing: 'Scopus Q1', citations: 19, status: 'Published' },
    ],
  };
}

function getFallbackEvents(deptCode: DepartmentCode) {
  return {
    summary: {
      upcomingEvents: 3,
      completedEvents: 14,
      seminars: 4,
      workshops: 5,
      guestLectures: 3,
      industrialVisits: 2,
      hackathons: 2,
      fdps: 3,
      studentParticipation: 380,
    },
    events: [
      { id: 'EVT-101', name: 'International Symposium on Generative AI', category: 'Symposium', organizer: `${deptCode} Department`, coordinator: 'Dr. Ramesh Kumar', venue: 'Auditorium Main', date: '2026-08-15', participants: 250, status: 'Upcoming', budget: '₹1.5 Lakhs' },
      { id: 'EVT-102', name: 'Hands-on PyTorch & CUDA Optimization Workshop', category: 'Workshop', organizer: `${deptCode} Department`, coordinator: 'Prof. Vikram Rathore', venue: 'Lab 402', date: '2026-07-22', participants: 60, status: 'Completed', budget: '₹30,000' },
    ],
  };
}
