# PDF Report Generator - Phase 5

## Overview

The PDF Report Generator feature enables users to generate professional compliance reports in PDF format for any organization in the system. Reports are automatically generated, uploaded to Supabase Storage, and displayed in an interactive modal with preview and download capabilities.

## Features

### 1. API Endpoint: `/api/report/generate`

**Method:** `POST`

**Request Body:**
```json
{
  "org_id": "string (required)",
  "report_type": "compliance_analysis | risk_assessment | donor_analysis (required)",
  "year": "number (optional, defaults to current year)",
  "options": {
    "format": "pdf | json | html (optional, defaults to json)",
    "include_recommendations": "boolean (optional, defaults to true)",
    "include_visualizations": "boolean (optional, defaults to true)"
  }
}
```

**Response (PDF format):**
```json
{
  "success": true,
  "data": {
    "id": "report-1234567890",
    "org_id": "org-123",
    "organization": { ... },
    "report_type": "compliance_analysis",
    "year": 2025,
    "generated_at": "2025-10-26T12:00:00.000Z",
    "pdf_url": "https://your-project.supabase.co/storage/v1/object/sign/reports/...",
    "file_path": "org-123/report-1234567890_Organization_Name.pdf",
    ...
  },
  "message": "Successfully generated PDF report for Organization Name"
}
```

### 2. PDF Generation Library

**Library:** `pdfkit`

**Location:** `src/lib/pdf-generator.ts`

**Function:** `generatePDFReport(reportData: ReportData): Promise<Buffer>`

**Features:**
- Professional PDF layout with branded colors
- Executive summary with risk level badges
- Key findings and recommendations
- Detailed grant tables
- Risk score analysis section
- Formatted currency and percentage values
- Multi-page support with automatic pagination

### 3. Supabase Storage Integration

**Bucket:** `reports`

**Migration:** `supabase/migrations/20251026120000_create_reports_bucket.sql`

**Policies:**
- Public read access for all reports
- Authenticated users can upload/update/delete reports
- Files organized by organization ID: `{org_id}/{report_id}_{org_name}.pdf`

**Signed URLs:**
- Valid for 1 hour (3600 seconds)
- Automatically generated for each PDF
- Supports direct preview and download

### 4. ReportModal Component

**Location:** `src/components/ReportModal.tsx`

**Props:**
```typescript
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  orgName: string;
  reportType?: 'compliance_analysis' | 'risk_assessment' | 'donor_analysis';
  year?: number;
}
```

**Features:**
- Modal overlay with backdrop blur
- PDF preview in embedded iframe
- Download button for offline access
- Loading state with spinner
- Error handling with retry option
- Smooth animations using Framer Motion
- Responsive design

### 5. Organization Page Integration

**Location:** `src/app/orgs/[id]/page.tsx`

**Features:**
- Three report generation buttons:
  - **Compliance Analysis** (blue) - Full compliance review
  - **Risk Assessment** (amber) - Risk scoring and metrics
  - **Donor Analysis** (purple) - Donor dependency analysis
- Click to open ReportModal
- Automatic report generation on modal open
- Organization details and financial summary display
- Risk score visualization
- Grants list table

## Usage

### Generating a PDF Report via API

```javascript
const response = await fetch('/api/report/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    org_id: 'org-123',
    report_type: 'compliance_analysis',
    year: 2025,
    options: {
      format: 'pdf',
      include_recommendations: true,
    },
  }),
});

const result = await response.json();
const pdfUrl = result.data.pdf_url; // Signed URL for PDF
```

### Using the ReportModal Component

```tsx
import ReportModal from '@/components/ReportModal';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Generate Report
      </button>

      <ReportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        orgId="org-123"
        orgName="Example Organization"
        reportType="compliance_analysis"
        year={2025}
      />
    </>
  );
}
```

### Testing the Feature

1. **Navigate to an organization page:**
   ```
   http://localhost:3000/orgs/{org-id}
   ```

2. **Click one of the report buttons:**
   - Compliance Analysis
   - Risk Assessment
   - Donor Analysis

3. **Wait for PDF generation** (usually 1-3 seconds)

4. **Preview the PDF** in the modal iframe

5. **Download the PDF** using the download button

## Setup Requirements

### 1. Install Dependencies

```bash
npm install pdfkit @types/pdfkit
```

### 2. Configure Supabase Storage

Run the migration to create the reports bucket:

```bash
# Apply migration manually in Supabase dashboard SQL editor
# Or use Supabase CLI:
supabase db push
```

### 3. Environment Variables

Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Verify Storage Bucket

In Supabase Dashboard:
1. Go to **Storage**
2. Verify `reports` bucket exists
3. Check bucket is set to **public**
4. Verify RLS policies are enabled

## File Structure

```
magnus-compliance-dashboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── report/
│   │   │       └── generate/
│   │   │           └── route.ts           # PDF generation API endpoint
│   │   └── orgs/
│   │       └── [id]/
│   │           └── page.tsx               # Organization page with report buttons
│   ├── components/
│   │   └── ReportModal.tsx                # PDF viewer modal component
│   └── lib/
│       └── pdf-generator.ts               # PDFKit utility for PDF generation
└── supabase/
    └── migrations/
        └── 20251026120000_create_reports_bucket.sql  # Storage bucket migration
```

## Customization

### PDF Styling

Edit `src/lib/pdf-generator.ts` to customize:
- Colors and branding
- Font sizes and styles
- Page layout and margins
- Section ordering
- Table formatting

### Report Types

Add new report types in:
1. `src/lib/pdf-generator.ts` - Add to `getReportTypeTitle()` function
2. `src/app/api/report/generate/route.ts` - Add to `validTypes` array
3. `src/components/ReportModal.tsx` - Add to `getReportTitle()` function

### Modal Appearance

Edit `src/components/ReportModal.tsx` to customize:
- Modal size and positioning
- Animation styles
- Button colors and styles
- Error message display

## Troubleshooting

### PDF Not Generating

**Issue:** API returns error or PDF URL is null

**Solutions:**
1. Check Supabase credentials in `.env.local`
2. Verify organization exists with valid data
3. Check browser console for detailed errors
4. Ensure `reports` bucket exists in Supabase Storage

### PDF Preview Not Loading

**Issue:** Modal shows blank iframe or loading indefinitely

**Solutions:**
1. Check if signed URL is valid (expires after 1 hour)
2. Verify CORS settings in Supabase Storage
3. Check browser console for iframe errors
4. Try downloading the PDF directly to verify file integrity

### Storage Upload Fails

**Issue:** Error: "Failed to upload PDF"

**Solutions:**
1. Verify Supabase Storage RLS policies are configured
2. Check if user is authenticated (if required by policies)
3. Ensure bucket name is correct (`reports`)
4. Verify file size is within Supabase limits

### TypeScript Errors

**Issue:** Type errors when building

**Solutions:**
1. Run `npm install` to ensure all types are installed
2. Check `@types/pdfkit` is in `package.json`
3. Verify interfaces in `pdf-generator.ts` match API response
4. Run `npx tsc --noEmit` to check for errors

## Performance Considerations

1. **PDF Generation Time:** 1-3 seconds depending on data size
2. **File Size:** Typically 50-200 KB per report
3. **Storage Limits:** Check Supabase plan limits for storage quota
4. **Signed URL Expiration:** URLs expire after 1 hour, regenerate as needed

## Future Enhancements

- [ ] Add email delivery option for reports
- [ ] Implement report templates with customizable sections
- [ ] Add chart/graph visualizations in PDFs
- [ ] Support batch report generation
- [ ] Add report scheduling and automation
- [ ] Implement report history and versioning
- [ ] Add watermarks and digital signatures
- [ ] Support multiple languages/locales

## Security Notes

1. **Public Bucket:** The `reports` bucket is set to public for easy access. Consider making it private and implementing authenticated access for sensitive data.
2. **Signed URLs:** URLs expire after 1 hour. Adjust expiration time based on security requirements.
3. **RLS Policies:** Current policies allow authenticated users to upload. Implement role-based access control (RBAC) for production use.
4. **Data Validation:** API validates input parameters. Ensure frontend validation as well.

## License

This feature is part of the Magnus Compliance Consulting Dashboard project.
