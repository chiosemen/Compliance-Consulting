import { supabase } from './supabase';
import type { AlertTriggerResult, DAFData, Donor, Filing990 } from '@/types/alerts';

/**
 * Check if DAF ratio increased by more than 20% year-over-year
 */
export async function checkDAFRatioIncrease(organizationId: string): Promise<AlertTriggerResult | null> {
  try {
    // Get the two most recent years of DAF data
    const { data: dafData, error } = await supabase
      .from('daf_data')
      .select('*')
      .eq('organization_id', organizationId)
      .order('year', { ascending: false })
      .limit(2);

    if (error) throw error;

    if (!dafData || dafData.length < 2) {
      return null; // Not enough data to compare
    }

    const [currentYear, previousYear] = dafData as DAFData[];
    const ratioIncrease = currentYear.daf_ratio - previousYear.daf_ratio;
    const percentageIncrease = (ratioIncrease / previousYear.daf_ratio) * 100;

    if (percentageIncrease > 20) {
      const severity = percentageIncrease > 50 ? 'high' : percentageIncrease > 35 ? 'medium' : 'low';

      return {
        shouldTrigger: true,
        severity,
        title: `DAF Ratio Increased by ${percentageIncrease.toFixed(1)}% YoY`,
        description: `The DAF ratio increased from ${previousYear.daf_ratio}% (${previousYear.year}) to ${currentYear.daf_ratio}% (${currentYear.year}), representing a ${percentageIncrease.toFixed(1)}% year-over-year increase.`,
        metadata: {
          current_year: currentYear.year,
          current_ratio: currentYear.daf_ratio,
          previous_year: previousYear.year,
          previous_ratio: previousYear.daf_ratio,
          percentage_increase: percentageIncrease,
        },
      };
    }

    return null;
  } catch (error) {
    console.error('Error checking DAF ratio increase:', error);
    return null;
  }
}

/**
 * Check if top donor contributes more than 60% of total contributions
 */
export async function checkTopDonorConcentration(organizationId: string, year?: number): Promise<AlertTriggerResult | null> {
  try {
    const currentYear = year || new Date().getFullYear();

    // Get all donors for the specified year
    const { data: donors, error } = await supabase
      .from('donors')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('contribution_year', currentYear)
      .order('total_contribution', { ascending: false });

    if (error) throw error;

    if (!donors || donors.length === 0) {
      return null; // No donor data available
    }

    const donorList = donors as Donor[];
    const totalContributions = donorList.reduce((sum, donor) => sum + Number(donor.total_contribution), 0);
    const topDonor = donorList[0];
    const topDonorPercentage = (Number(topDonor.total_contribution) / totalContributions) * 100;

    if (topDonorPercentage > 60) {
      const severity = topDonorPercentage > 80 ? 'high' : topDonorPercentage > 70 ? 'medium' : 'low';

      return {
        shouldTrigger: true,
        severity,
        title: `Top Donor Concentration at ${topDonorPercentage.toFixed(1)}%`,
        description: `The top donor (${topDonor.name}) contributed ${topDonorPercentage.toFixed(1)}% of total contributions in ${currentYear}, exceeding the 60% threshold. Total: $${Number(topDonor.total_contribution).toLocaleString()} of $${totalContributions.toLocaleString()}.`,
        metadata: {
          year: currentYear,
          top_donor_name: topDonor.name,
          top_donor_amount: topDonor.total_contribution,
          total_contributions: totalContributions,
          percentage: topDonorPercentage,
          donor_count: donorList.length,
        },
      };
    }

    return null;
  } catch (error) {
    console.error('Error checking top donor concentration:', error);
    return null;
  }
}

/**
 * Check if 990 filing is missing for more than 18 months
 */
export async function checkMissing990Filing(organizationId: string): Promise<AlertTriggerResult | null> {
  try {
    // Get the most recent 990 filing
    const { data: filings, error } = await supabase
      .from('filings_990')
      .select('*')
      .eq('organization_id', organizationId)
      .order('filing_date', { ascending: false })
      .limit(1);

    if (error) throw error;

    const now = new Date();
    const eighteenMonthsAgo = new Date(now.getTime() - (18 * 30 * 24 * 60 * 60 * 1000)); // Approximate 18 months

    // No filings at all
    if (!filings || filings.length === 0) {
      return {
        shouldTrigger: true,
        severity: 'high',
        title: 'No 990 Filings Found',
        description: 'This organization has no 990 filings on record, which is a significant compliance concern.',
        metadata: {
          last_filing_date: null,
          months_overdue: null,
        },
      };
    }

    const lastFiling = filings[0] as Filing990;
    const lastFilingDate = new Date(lastFiling.filing_date);
    const monthsOverdue = Math.floor((now.getTime() - lastFilingDate.getTime()) / (30 * 24 * 60 * 60 * 1000));

    if (lastFilingDate < eighteenMonthsAgo) {
      const severity = monthsOverdue > 30 ? 'high' : monthsOverdue > 24 ? 'medium' : 'low';

      return {
        shouldTrigger: true,
        severity,
        title: `990 Filing Overdue by ${monthsOverdue} Months`,
        description: `The most recent 990 filing was on ${lastFilingDate.toLocaleDateString()} (${monthsOverdue} months ago), exceeding the 18-month threshold. Tax year: ${lastFiling.tax_year}.`,
        metadata: {
          last_filing_date: lastFiling.filing_date,
          last_tax_year: lastFiling.tax_year,
          months_overdue: monthsOverdue,
          days_overdue: Math.floor((now.getTime() - lastFilingDate.getTime()) / (24 * 60 * 60 * 1000)),
        },
      };
    }

    return null;
  } catch (error) {
    console.error('Error checking missing 990 filing:', error);
    return null;
  }
}

/**
 * Run all alert checks for an organization and create alerts if triggered
 */
export async function evaluateAlertsForOrganization(organizationId: string): Promise<void> {
  const checks = [
    { type: 'daf_ratio_increase', fn: () => checkDAFRatioIncrease(organizationId) },
    { type: 'top_donor_concentration', fn: () => checkTopDonorConcentration(organizationId) },
    { type: 'missing_990', fn: () => checkMissing990Filing(organizationId) },
  ];

  for (const check of checks) {
    const result = await check.fn();

    if (result && result.shouldTrigger) {
      // Check if this alert already exists to avoid duplicates
      const { data: existingAlerts } = await supabase
        .from('alerts')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('alert_type', check.type)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Within last 7 days
        .limit(1);

      if (!existingAlerts || existingAlerts.length === 0) {
        // Create the alert
        await supabase.from('alerts').insert({
          organization_id: organizationId,
          alert_type: check.type,
          severity: result.severity,
          title: result.title,
          description: result.description,
          metadata: result.metadata,
        });
      }
    }
  }
}
