export interface StudentAnalytics {
  studentId: string;
  studentName: string;
  averageScore: number;
  attendanceRate: number;
  subjectScores: Record<string, number>;
  termScores: Record<string, number>;
  isAtRisk: boolean;
}

export interface ClassAnalytics {
  className: string;
  averageScore: number;
  averageAttendance: number;
  topPerformers: any[];
  atRiskStudents: any[];
  scoreDistribution: Record<string, number>;
  attendanceTrend: any[];
  subjectDifficulty: Record<string, number>;
}

export function calculateStudentAnalytics(
  marksData: any[],
  attendanceData: any[]
): Map<string, StudentAnalytics> {
  const analytics = new Map<string, StudentAnalytics>();

  // Group marks by student
  const marksGrouped = new Map<string, any[]>();
  marksData.forEach(record => {
    if (!marksGrouped.has(record.student_id)) {
      marksGrouped.set(record.student_id, []);
    }
    marksGrouped.get(record.student_id)!.push(record);
  });

  // Group attendance by student
  const attendanceGrouped = new Map<string, any[]>();
  attendanceData.forEach(record => {
    if (!attendanceGrouped.has(record.student_id)) {
      attendanceGrouped.set(record.student_id, []);
    }
    attendanceGrouped.get(record.student_id)!.push(record);
  });

  // Calculate analytics for each student
  marksGrouped.forEach((records, studentId) => {
    const studentName = records[0]?.student_name || studentId;
    
    // Calculate average score
    const totalScore = records.reduce((sum, r) => sum + parseFloat(r.score || 0), 0);
    const totalMaxScore = records.reduce((sum, r) => sum + parseFloat(r.max_score || 0), 0);
    const averageScore = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

    // Calculate attendance rate
    const attendance = attendanceGrouped.get(studentId) || [];
    const presentCount = attendance.filter(a => a.status === "PRESENT").length;
    const attendanceRate = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;

    // Subject scores
    const subjectScores: Record<string, number> = {};
    records.forEach(r => {
      if (!subjectScores[r.subject]) {
        subjectScores[r.subject] = 0;
      }
      const score = parseFloat(r.score || 0) / parseFloat(r.max_score || 1);
      subjectScores[r.subject] = (subjectScores[r.subject] + score) / 2;
    });

    // Term scores
    const termScores: Record<string, { score: number; max: number; count: number }> = {};
    records.forEach(r => {
      if (!termScores[r.term]) {
        termScores[r.term] = { score: 0, max: 0, count: 0 };
      }
      termScores[r.term].score += parseFloat(r.score || 0);
      termScores[r.term].max += parseFloat(r.max_score || 0);
      termScores[r.term].count += 1;
    });

    const termScoresCalculated: Record<string, number> = {};
    Object.entries(termScores).forEach(([term, data]) => {
      termScoresCalculated[term] = data.max > 0 ? (data.score / data.max) * 100 : 0;
    });

    analytics.set(studentId, {
      studentId,
      studentName,
      averageScore,
      attendanceRate,
      subjectScores: Object.fromEntries(
        Object.entries(subjectScores).map(([subj, score]) => [subj, score * 100])
      ),
      termScores: termScoresCalculated,
      isAtRisk: averageScore < 60 || attendanceRate < 75,
    });
  });

  return analytics;
}

export function calculateClassAnalytics(
  marksData: any[],
  attendanceData: any[]
): ClassAnalytics {
  const studentAnalytics = calculateStudentAnalytics(marksData, attendanceData);

  const className = marksData[0]?.class || "Class";
  const averageScore =
    Array.from(studentAnalytics.values()).reduce((sum, s) => sum + s.averageScore, 0) /
      studentAnalytics.size || 0;
  const averageAttendance =
    Array.from(studentAnalytics.values()).reduce((sum, s) => sum + s.attendanceRate, 0) /
      studentAnalytics.size || 0;

  // Top performers
  const topPerformers = Array.from(studentAnalytics.values())
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5);

  // At-risk students
  const atRiskStudents = Array.from(studentAnalytics.values()).filter(s => s.isAtRisk);

  // Score distribution
  const scoreDistribution: Record<string, number> = {
    "90-100": 0,
    "80-89": 0,
    "70-79": 0,
    "60-69": 0,
    "Below 60": 0,
  };

  Array.from(studentAnalytics.values()).forEach(s => {
    if (s.averageScore >= 90) scoreDistribution["90-100"]++;
    else if (s.averageScore >= 80) scoreDistribution["80-89"]++;
    else if (s.averageScore >= 70) scoreDistribution["70-79"]++;
    else if (s.averageScore >= 60) scoreDistribution["60-69"]++;
    else scoreDistribution["Below 60"]++;
  });

  // Subject difficulty
  const subjectDifficulty: Record<string, number> = {};
  const subjectStats: Record<string, { sum: number; count: number }> = {};

  marksData.forEach(record => {
    if (!subjectStats[record.subject]) {
      subjectStats[record.subject] = { sum: 0, count: 0 };
    }
    const score = (parseFloat(record.score || 0) / parseFloat(record.max_score || 1)) * 100;
    subjectStats[record.subject].sum += score;
    subjectStats[record.subject].count += 1;
  });

  Object.entries(subjectStats).forEach(([subject, data]) => {
    subjectDifficulty[subject] = data.count > 0 ? data.sum / data.count : 0;
  });

  return {
    className,
    averageScore,
    averageAttendance,
    topPerformers,
    atRiskStudents,
    scoreDistribution,
    attendanceTrend: [],
    subjectDifficulty,
  };
}