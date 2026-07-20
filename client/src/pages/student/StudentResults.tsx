import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import api from '@/lib/api';

const gradePoints: Record<string, number> = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  F: 0.0,
};

export function StudentResults() {
  const [resultsList, setResultsList] = useState<any[]>([]);
  const [gpaData, setGpaData] = useState<any[]>([]);
  const [cgpa, setCgpa] = useState('0.0');
  const [totalCredits, setTotalCredits] = useState('0');
  const [gradeDist, setGradeDist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get('/api/student-module/results');
        if (res.data?.success && res.data?.data && res.data.data.length > 0) {
          const dbResults = res.data.data;
          setResultsList(dbResults);

          // Calculate grade points, CGPA, total credits
          let totalPts = 0;
          let totalCreds = 0;
          const distMap: Record<string, number> = {};

          dbResults.forEach((r: any) => {
            const credits = r.credits || 3;
            const grade = r.grade || 'A';
            const gp = gradePoints[grade] !== undefined ? gradePoints[grade] : 3.0;

            totalPts += gp * credits;
            totalCreds += credits;

            distMap[grade] = (distMap[grade] || 0) + 1;
          });

          const calculatedCgpa = (totalPts / totalCreds).toFixed(2);
          setCgpa(calculatedCgpa);
          setTotalCredits(String(totalCreds));

          // Grade distribution
          const totalSubjects = dbResults.length;
          const newGradeDist = Object.keys(distMap)
            .map((grade) => ({
              grade,
              count: distMap[grade],
              percentage: `${Math.round((distMap[grade] / totalSubjects) * 100)}%`,
            }))
            .sort((a, b) => b.grade.localeCompare(a.grade));
          setGradeDist(newGradeDist);

          // Group by semester and calculate average GPA
          const semMap: Record<string, { totalPoints: number; totalCredits: number }> = {};
          dbResults.forEach((r: any) => {
            const sem = r.semester || 'Sem 5';
            const grade = r.grade || 'A';
            const credits = r.credits || 3;
            const gp = gradePoints[grade] !== undefined ? gradePoints[grade] : 3.0;

            if (!semMap[sem]) {
              semMap[sem] = { totalPoints: 0, totalCredits: 0 };
            }
            semMap[sem].totalPoints += gp * credits;
            semMap[sem].totalCredits += credits;
          });

          const newGpaHistory = Object.keys(semMap)
            .map((sem) => {
              const gpa = Number((semMap[sem].totalPoints / semMap[sem].totalCredits).toFixed(2));
              return {
                semester: sem,
                gpa,
                credits: semMap[sem].totalCredits,
              };
            })
            .sort((a, b) => a.semester.localeCompare(b.semester));

          setGpaData(newGpaHistory);
        }
      } catch (err) {
        console.error('Error loading student results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Results & GPA"
        desc="View your academic results, semester-wise GPA, and overall performance analytics."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 font-medium">
            <Download className="size-4" /> Download Report
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {loading
          ? [1, 2, 3, 4].map((n) => (
              <Card key={n} className="h-24 animate-pulse bg-muted/40">
                <div />
              </Card>
            ))
          : [
              {
                label: 'Current GPA',
                value: gpaData[gpaData.length - 1]?.gpa || '0.0',
                tone: 'success' as const,
              },
              { label: 'CGPA', value: cgpa, tone: 'success' as const },
              { label: 'Total Credits', value: totalCredits, tone: 'info' as const },
              { label: 'Class Rank', value: 'N/A', tone: 'info' as const },
            ].map((stat) => (
              <Card key={stat.label}>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-2xl font-bold mt-2">{stat.value}</div>
                <Badge tone={stat.tone} className="mt-3">
                  Current
                </Badge>
              </Card>
            ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">GPA Progress</h3>
            {!loading && <Badge tone="success">{cgpa}</Badge>}
          </div>
          <div className="h-72">
            {loading ? (
              <div className="h-full w-full bg-muted/20 animate-pulse rounded-xl" />
            ) : gpaData.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={gpaData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="semester" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                  <Line type="monotone" dataKey="gpa" stroke="#4F46E5" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-xl">
                No GPA progress records found in database.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-5 text-indigo" />
            <h3 className="font-semibold">Grade Distribution</h3>
          </div>
          <div className="space-y-3">
            {loading
              ? [1, 2, 3].map((n) => (
                  <div key={n} className="h-14 bg-muted/20 animate-pulse rounded-xl border" />
                ))
              : gradeDist.map((item) => (
                  <div
                    key={item.grade}
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border"
                  >
                    <span className="text-sm font-medium">{item.grade}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{item.count} subjects</span>
                      <Badge tone="info">{item.percentage}</Badge>
                    </div>
                  </div>
                ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Subject-wise Results</h3>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-xl animate-pulse bg-muted/10">
            Loading academic results ledger...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {['Subject', 'Credits', 'Grade', 'Marks', 'Semester'].map((column) => (
                    <th
                      key={column}
                      className="text-left py-3 px-4 font-semibold text-muted-foreground"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {resultsList.map((result, index) => (
                  <tr key={index} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium">{result.subject}</td>
                    <td className="py-3 px-4">{result.credits}</td>
                    <td className="py-3 px-4">
                      <Badge tone={result.grade.startsWith('A') ? 'success' : 'info'}>
                        {result.grade}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium">{result.marks}%</td>
                    <td className="py-3 px-4">
                      <Badge tone="info">{result.semester}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Credits Summary</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? [1, 2, 3, 4].map((n) => (
                <div key={n} className="h-16 animate-pulse bg-muted/20 border rounded-xl" />
              ))
            : gpaData.map((item) => (
                <div key={item.semester} className="p-4 rounded-xl bg-gradient-soft border">
                  <div className="text-sm font-medium">{item.semester}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{item.credits} credits</span>
                    <Badge tone="success">{item.gpa} GPA</Badge>
                  </div>
                </div>
              ))}
        </div>
      </Card>
    </div>
  );
}
