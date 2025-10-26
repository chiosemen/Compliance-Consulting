# UI Components - Vine-Style Design

Phase 3 UI Components for Magnus Compliance Dashboard

## Components

### 1. Sidebar.tsx
A sticky navigation sidebar with smooth animations and interactive elements.

**Features:**
- Fixed/sticky positioning
- Active route highlighting with layout animations
- Hover effects with icon wiggle
- Quick stats widget
- Notification badges
- Backdrop blur effect

**Usage:**
```tsx
import { Sidebar } from '@/components';

<Sidebar />
```

---

### 2. FeedCard.tsx
Compliance brief preview cards with smooth entrance animations.

**Features:**
- Risk level indicators (low, medium, high, critical)
- Animated tag pills
- Hover lift effect
- Truncated summaries with line-clamp
- Amount display formatting

**Props:**
```tsx
interface FeedCardProps {
  id: string;
  title: string;
  organization: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  date: string;
  tags?: string[];
  amount?: number;
}
```

**Usage:**
```tsx
import { FeedCard } from '@/components';

<FeedCard
  id="report-123"
  title="Q4 Compliance Report"
  organization="Acme Foundation"
  riskLevel="low"
  summary="All compliance requirements met..."
  date="2024-10-26"
  tags={['Finance', 'Grants']}
  amount={250000}
/>
```

**Animation:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  <FeedCard {...props} />
</motion.div>
```

---

### 3. ReportModal.tsx
Full-featured animated modal for displaying compliance reports.

**Features:**
- Backdrop with blur effect
- Spring animations on open/close
- ESC key to close
- Body scroll lock when open
- Staggered content animations
- Metrics grid with trend indicators
- Recommendations section
- Export functionality

**Props:**
```tsx
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportData | null;
}

interface ReportData {
  id: string;
  title: string;
  organization: string;
  date: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  details: {
    section: string;
    content: string;
  }[];
  metrics?: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
  }[];
  recommendations?: string[];
}
```

**Usage:**
```tsx
import { ReportModal } from '@/components';
import { useState } from 'react';

const [isOpen, setIsOpen] = useState(false);
const [report, setReport] = useState<ReportData | null>(null);

<ReportModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  report={report}
/>
```

---

### 4. Loader.tsx
Versatile shimmer loading component with multiple variants.

**Features:**
- 4 variants: default, card, inline, fullscreen
- Shimmer animation with CSS keyframes
- Pulsing effects
- Customizable loading text

**Props:**
```tsx
interface LoaderProps {
  variant?: 'default' | 'card' | 'inline' | 'fullscreen';
  text?: string;
}
```

**Usage:**
```tsx
import { Loader } from '@/components';

// Default spinner
<Loader />

// Card skeleton
<Loader variant="card" />

// Inline dots
<Loader variant="inline" text="Loading..." />

// Full screen overlay
<Loader variant="fullscreen" text="Processing report..." />
```

**CSS:**
The shimmer animation is defined in `globals.css`:
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
```

---

### 5. ChartWidget.tsx
Interactive data visualization widget using Plotly.js.

**Features:**
- Multiple chart types: Sankey, Bar, Line, Pie
- Responsive design
- Dark theme integration
- Hover tooltips
- Currency formatting
- Smooth entrance animations

**Props:**
```tsx
interface ChartWidgetProps {
  title: string;
  type: 'sankey' | 'bar' | 'line' | 'pie';
  data: DonorFlowData | any;
  height?: number;
}

interface DonorFlowData {
  nodes: {
    label: string;
    color?: string;
  }[];
  links: {
    source: number;
    target: number;
    value: number;
    color?: string;
  }[];
}
```

**Usage:**
```tsx
import { ChartWidget, generateSampleDonorFlow } from '@/components';

// Sankey diagram
<ChartWidget
  title="Donor Flow Analysis"
  type="sankey"
  data={generateSampleDonorFlow()}
  height={400}
/>

// Bar chart
<ChartWidget
  title="Monthly Donations"
  type="bar"
  data={{
    x: ['Jan', 'Feb', 'Mar', 'Apr'],
    y: [120000, 150000, 180000, 210000],
  }}
/>

// Line chart
<ChartWidget
  title="Compliance Trend"
  type="line"
  data={{
    x: ['Q1', 'Q2', 'Q3', 'Q4'],
    y: [85, 88, 92, 95],
  }}
/>

// Pie chart
<ChartWidget
  title="Fund Distribution"
  type="pie"
  data={{
    labels: ['Programs', 'Operations', 'Research', 'Admin'],
    values: [450000, 200000, 150000, 100000],
  }}
/>
```

---

## Animation Template

All components follow the Vine-style animation pattern:

```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  <Component />
</motion.div>
```

## Dependencies

- `framer-motion@^12.23.24` - Animation library
- `react-plotly.js` - Plotly React wrapper
- `plotly.js` - Plotting library
- `tailwindcss@^4` - Styling
- `next@16.0.0` - Framework

## Color Scheme

Brand colors defined in `globals.css`:
- `--color-brand: #16a34a` (Green)
- `--color-brand-accent: #f59e0b` (Amber)
- `--color-brand-dark: #0f172a` (Dark slate)

## Best Practices

1. **Always wrap in motion.div** for consistent animations
2. **Use proper TypeScript types** for all props
3. **Follow the shimmer pattern** for loading states
4. **Keep animations subtle** - 0.3s duration is standard
5. **Use backdrop-blur** for depth and hierarchy
6. **Maintain accessibility** - ESC key, focus states, ARIA labels
