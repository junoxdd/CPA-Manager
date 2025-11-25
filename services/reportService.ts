import { Report, User } from '../types';
import { supabase } from '../lib/supabase';

export const getReports = (userId: string): Report[] => {
  return [];
};

export const generateReportMock = async (user: User, period: 'daily' | 'weekly' | 'monthly'): Promise<Report> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const newReport: Report = {
    id: crypto.randomUUID(),
    userId: user.id,
    period,
    urlPdf: '#',
    createdAt: Date.now()
  };

  try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return newReport;

      const currentReports = currentUser.user_metadata?.reports || [];
      const updatedReports = [newReport, ...currentReports].slice(0, 20);

      await supabase.auth.updateUser({
          data: { reports: updatedReports }
      });
      
  } catch (e) {
      console.error("Error saving report", e);
  }

  return newReport;
};