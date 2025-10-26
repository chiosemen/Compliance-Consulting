import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface OrganizationInfo {
  name: string;
  ein?: string;
  mission?: string;
}

interface ReportSummary {
  total_grants: number;
  total_funding: number;
  avg_grant_size: number;
  risk_level: string;
  risk_score: number | null;
  dependency_ratio: number | null;
  transparency_index: number | null;
}

interface Grant {
  id: string;
  amount: number;
  year: number;
  confirmed?: boolean;
}

interface RiskScore {
  score: number;
  dependency_ratio: number;
  transparency_index: number;
  year: number;
}

export interface ReportData {
  id: string;
  org_id: string;
  organization: OrganizationInfo;
  report_type: string;
  year: number;
  generated_at: string;
  status?: string;
  format?: string;
  summary: ReportSummary;
  key_findings: string[];
  recommendations?: string[] | null;
  data: {
    grants: Grant[];
    risk_score: RiskScore | null;
  };
}

/**
 * Generate a PDF report from report data
 * @param reportData The report data to convert to PDF
 * @returns A readable stream containing the PDF
 */
export async function generatePDFReport(reportData: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors
      const primaryColor = '#1e40af'; // blue-800
      const secondaryColor = '#64748b'; // slate-500
      const accentColor = '#0ea5e9'; // sky-500
      const dangerColor = '#dc2626'; // red-600
      const warningColor = '#f59e0b'; // amber-500
      const successColor = '#16a34a'; // green-600

      // Header
      doc
        .fontSize(24)
        .fillColor(primaryColor)
        .text('Compliance Report', { align: 'center' });

      doc
        .fontSize(12)
        .fillColor(secondaryColor)
        .text(getReportTypeTitle(reportData.report_type), { align: 'center' })
        .moveDown(0.5);

      // Organization Info Section
      doc
        .fontSize(18)
        .fillColor(primaryColor)
        .text('Organization Information', { underline: true })
        .moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor('#000000')
        .text(`Name: ${reportData.organization.name}`, { continued: false });

      if (reportData.organization.ein) {
        doc.text(`EIN: ${reportData.organization.ein}`, { continued: false });
      }

      if (reportData.organization.mission) {
        doc
          .text(`Mission: `, { continued: true })
          .font('Helvetica')
          .text(reportData.organization.mission, { continued: false });
        doc.font('Helvetica-Bold');
      }

      doc.moveDown(1);

      // Report Metadata
      doc
        .fontSize(10)
        .fillColor(secondaryColor)
        .text(`Report ID: ${reportData.id}`)
        .text(`Generated: ${new Date(reportData.generated_at).toLocaleString()}`)
        .text(`Reporting Year: ${reportData.year}`)
        .moveDown(1.5);

      // Summary Section
      doc
        .fontSize(18)
        .fillColor(primaryColor)
        .text('Executive Summary', { underline: true })
        .moveDown(0.5);

      const { summary } = reportData;

      // Risk Level Badge
      let riskColor = successColor;
      if (summary.risk_level === 'high') riskColor = dangerColor;
      else if (summary.risk_level === 'medium') riskColor = warningColor;

      doc
        .fontSize(12)
        .fillColor('#000000')
        .text('Overall Risk Level: ', { continued: true })
        .fillColor(riskColor)
        .text(summary.risk_level.toUpperCase(), { continued: false });

      doc
        .fillColor('#000000')
        .text(`Total Grants: ${summary.total_grants}`)
        .text(`Total Funding: $${summary.total_funding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
        .text(`Average Grant Size: $${summary.avg_grant_size.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

      if (summary.risk_score !== null) {
        doc.text(`Risk Score: ${summary.risk_score.toFixed(2)}/100`);
      }

      if (summary.dependency_ratio !== null) {
        doc.text(`Donor Dependency Ratio: ${(summary.dependency_ratio * 100).toFixed(1)}%`);
      }

      if (summary.transparency_index !== null) {
        doc.text(`Transparency Index: ${summary.transparency_index.toFixed(2)}/100`);
      }

      doc.moveDown(1.5);

      // Key Findings Section
      if (reportData.key_findings && reportData.key_findings.length > 0) {
        doc
          .fontSize(18)
          .fillColor(primaryColor)
          .text('Key Findings', { underline: true })
          .moveDown(0.5);

        doc.fontSize(12).fillColor('#000000');

        reportData.key_findings.forEach((finding, index) => {
          doc.text(`${index + 1}. ${finding}`, {
            indent: 20,
            continued: false,
          });
          doc.moveDown(0.3);
        });

        doc.moveDown(1);
      }

      // Recommendations Section
      if (reportData.recommendations && reportData.recommendations.length > 0) {
        doc
          .fontSize(18)
          .fillColor(primaryColor)
          .text('Recommendations', { underline: true })
          .moveDown(0.5);

        doc.fontSize(12).fillColor('#000000');

        reportData.recommendations.forEach((rec, index) => {
          doc.text(`${index + 1}. ${rec}`, {
            indent: 20,
            continued: false,
          });
          doc.moveDown(0.3);
        });

        doc.moveDown(1);
      }

      // Detailed Data Section
      if (reportData.data.grants && reportData.data.grants.length > 0) {
        // Check if we need a new page
        if (doc.y > 600) {
          doc.addPage();
        }

        doc
          .fontSize(18)
          .fillColor(primaryColor)
          .text('Grant Details', { underline: true })
          .moveDown(0.5);

        doc.fontSize(10).fillColor('#000000');

        // Table header
        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 200;
        const col3 = 300;
        const col4 = 450;

        doc
          .font('Helvetica-Bold')
          .text('Grant ID', col1, tableTop)
          .text('Year', col2, tableTop)
          .text('Amount', col3, tableTop)
          .text('Status', col4, tableTop);

        doc.moveDown(0.5);

        // Draw line under header
        doc
          .moveTo(col1, doc.y)
          .lineTo(550, doc.y)
          .stroke();

        doc.moveDown(0.3);

        // Table rows
        doc.font('Helvetica');
        reportData.data.grants.forEach((grant) => {
          const currentY = doc.y;

          // Check if we need a new page
          if (currentY > 700) {
            doc.addPage();
            doc.fontSize(10);
          }

          doc
            .text(grant.id.substring(0, 20), col1, doc.y, { width: 140 })
            .text(grant.year.toString(), col2, currentY)
            .text(`$${grant.amount.toLocaleString()}`, col3, currentY)
            .text(grant.confirmed ? 'Confirmed' : 'Pending', col4, currentY);

          doc.moveDown(0.5);
        });

        doc.moveDown(1);
      }

      // Risk Score Details
      if (reportData.data.risk_score) {
        // Check if we need a new page
        if (doc.y > 650) {
          doc.addPage();
        }

        doc
          .fontSize(18)
          .fillColor(primaryColor)
          .text('Risk Score Analysis', { underline: true })
          .moveDown(0.5);

        const riskScore = reportData.data.risk_score;

        doc
          .fontSize(12)
          .fillColor('#000000')
          .text(`Year: ${riskScore.year}`)
          .text(`Overall Risk Score: ${riskScore.score.toFixed(2)}/100`)
          .text(`Donor Dependency Ratio: ${(riskScore.dependency_ratio * 100).toFixed(1)}%`)
          .text(`Transparency Index: ${riskScore.transparency_index.toFixed(2)}/100`)
          .moveDown(1);
      }

      // Footer
      const bottomMargin = 50;
      doc
        .fontSize(8)
        .fillColor(secondaryColor)
        .text(
          'This report is generated by Magnus Compliance Consulting Dashboard',
          50,
          doc.page.height - bottomMargin,
          { align: 'center' }
        )
        .text(
          `Page 1 of 1 | Generated: ${new Date().toLocaleDateString()}`,
          50,
          doc.page.height - bottomMargin + 10,
          { align: 'center' }
        );

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function getReportTypeTitle(type: string): string {
  const titles: Record<string, string> = {
    compliance_analysis: 'Compliance Analysis Report',
    risk_assessment: 'Risk Assessment Report',
    donor_analysis: 'Donor Analysis Report',
  };
  return titles[type] || 'Compliance Report';
}
