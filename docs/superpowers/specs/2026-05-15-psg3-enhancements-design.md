# PSG3 Employee Portal - Enhancements Design Spec

**Project:** Protection Security Group LLC - Employee Portal Enhancements  
**Date:** 2026-05-15  
**Version:** 1.0  
**Approach:** Option 1 - Progressive Implementation

---

## Executive Summary

This document details the design for progressive enhancements to the existing PSG3 employee portal, implementing UI/UX improvements, advanced features, file upload, and export functionality while excluding 2FA authentication.

**Target Scale:** Small organization (1-50 employees, <1000 documents)  
**Timeline:** 7-10 hours total development time  
**Approach:** 3 progressive phases with deployment after each phase

---

## Architecture

### Current Architecture (Preserved)
- React + TypeScript + Vite frontend
- Individual Vercel serverless functions for API
- PostgreSQL with Prisma ORM
- JWT authentication (7-day expiry)
- File structure: `/portal` (employee) and `/portal/admin` (admin)

### New Architecture Layers

#### 1. UI Layer - shadcn/ui Components
```typescript
src/components/ui/
├── Button.tsx           // Primary/secondary/ghost/destructive
├── Input.tsx            // Form inputs with labels and error states
├── Label.tsx            // Accessible labels
├── Dialog.tsx           // Modal dialogs for create/edit/delete
├── AlertDialog.tsx      // Critical confirmations
├── Table.tsx            // Sortable tables with pagination
├── Toast.tsx            // Notification component
├── useToast.tsx         // Toast hook
├── Badge.tsx            // Category badges
├── Select.tsx           // Dropdown selects
├── Textarea.tsx         // Multi-line text inputs
└── Card.tsx             // Visual containers
```

#### 2. State Management Layer
```typescript
src/lib/hooks.ts
// useToast() - Notification management
// usePagination() - Pagination logic  
// useDebounce() - Search debouncing

src/context/
// ToastContext.tsx - Global toast provider
```

#### 3. Data Layer
```typescript
src/lib/export.ts
// exportToCSV() - Array to CSV conversion
// exportToPDF() - PDF generation with jspdf
```

#### 4. API Layer Additions
```
Existing APIs:
├── /api/auth/*           // Authentication (working)
├── /api/admin/users      // CRUD users (enhance)
├── /api/admin/documents  // Documents (add upload)
└── /api/admin/audit-log  // Audit logging (working)

New APIs:
├── /api/admin/documents/upload    // Multipart file upload
├── /api/admin/export/users       // CSV export
├── /api/admin/export/audit       // CSV export
├── /api/employees/documents       // Employee docs (enhance)
└── /api/employees/documents/upload // Employee file upload
```

---

## Phase 1: UI/UX + shadcn/ui + Notifications (2-3 hours)

### 1.1 Dependencies Installation
```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-toast @radix-ui/react-label
npm install @tanstack/react-query class-variance-authority clsx tailwind-merge
npm install jspdf jspdf-autotable
```

### 1.2 Toast Notification System

**Components:**
- `ToastProvider` - Global context wrapper
- `Toast.tsx` - Notification component
- `useToast.ts` - Hook for triggering notifications

**Implementation:**
```typescript
// Toast variants: success | error | warning | info
// Auto-dismiss after 5 seconds
// Top-right positioning
// Max 3 toasts visible simultaneously
```

**Usage in components:**
```typescript
const { toast } = useToast();
toast.success("User created successfully");
toast.error("Failed to update profile");
```

### 1.3 Core UI Components

**Button Component:**
- Variants: primary, secondary, ghost, destructive
- Sizes: sm, md, lg
- Loading states with spinner
- Disabled states

**Input Component:**
- Labels with htmlfor association
- Error message display
- Disabled and readonly states
- Focus states with ring

**Dialog Component:**
- Modal overlay with backdrop
- Open/close animations
- ESC key close
- Click outside close
- Size variants: sm, md, lg, full

**AlertDialog Component:**
- Critical confirmations
- Cancel/Confirm actions
- Warning styling

### 1.4 Integration Points

**Replace existing alerts:**
- Login forms → Toast notifications
- CRUD operations → Success/error toasts
- Validation errors → Toast with error details

**App.tsx integration:**
```typescript
<ToastProvider>
  <Router>...</Router>
</ToastProvider>
```

---

## Phase 2: Filters/Pagination/Sort + Advanced CRUD (3-4 hours)

### 2.1 Enhanced User Management

**Search Functionality:**
- Real-time search with 300ms debounce
- Search fields: name, email, employee ID
- Loading state during search
- Clear search button

**Advanced Filters:**
- Role filter: All | Admin | Employee
- Status filter: All | Active | Inactive  
- Department filter: All departments (from existing data)
- Date range filter: Hire date from/to
- Filter combinations (AND logic)

**Sorting:**
- Click column headers to sort
- Visual indicators: ▲ / ▼
- Multi-column sort support
- Persist sort state in URL params

**Pagination:**
- Items per page: 10, 25, 50
- Page navigation: First, Prev, Page numbers, Next, Last
- Total count display: "Page 1 of 5 · 48 total"
- Smart ellipsis for large page counts

### 2.2 CRUD Dialog Improvements

**Create User Dialog:**
- Multi-tab layout: Account | Profile | Contact | Work
- Real-time validation
- Password strength indicator
- Email uniqueness check
- Save/Cancel buttons
- Loading state during creation

**Edit User Dialog:**
- Same structure as create dialog
- Pre-populated with existing data
- Password field removed/hidden
- Save/Cancel buttons
- Audit log on save

**Delete User Confirmation:**
- AlertDialog with user details
- Clear warning message
- Confirm/Cancel buttons
- Soft delete (active = false)

### 2.3 Enhanced Document Management

**Document Filters:**
- Category badges with colors
- Category dropdown filter
- Search in title, description, filename
- Date range filter

**Document Table Improvements:**
- File size display in human readable format
- File type icons
- Uploader info (name + date)
- Action buttons (view, download, delete)

### 2.4 State Management

**React Query Integration:**
```typescript
// Cache management
// Automatic refetching on mutations
// Optimistic updates
// Error/retry logic
```

**Custom Hooks:**
```typescript
usePagination() // Reusable pagination logic
useDebounce() // Search debouncing
useFilters() // Filter state management
```

---

## Phase 3: Real File Upload + Export CSV/PDF (2-3 hours)

### 3.1 File Upload Implementation

**Backend - Upload Endpoint:**
```typescript
// POST /api/admin/documents/upload
// POST /api/employees/documents/upload
// Accept: multipart/form-data
// Max file size: 25MB
// Validation: MIME type, file extension
// Storage: uploads/{year}/{month}/{timestamp}-{filename}
// Generate unique filename to prevent collisions
```

**Frontend - Upload Component:**
- Drag-and-drop zone with visual feedback
- File input with click-to-upload
- File preview before upload
- Progress indicator during upload
- Cancel upload button
- File validation (size, type)
- Multiple file support

**Upload Dialog:**
- Title (text, required)
- Category (select, required)
- Description (textarea, optional)
- File drop zone
- Upload button with loading state
- Progress bar
- Success/error feedback

### 3.2 CSV Export Implementation

**Backend - Export Endpoints:**
```typescript
// GET /api/admin/export/users
// GET /api/admin/export/audit
// Query params: same as current view filters
// Response: CSV with Content-Disposition header
// Filename: export-{entity}-{YYYY-MM-DD}.csv
```

**Export Utility:**
```typescript
// lib/export.ts
export function arrayToCSV(data: any[], headers: string[]): string
export function downloadCSV(csv: string, filename: string): void
```

**Frontend - Export Component:**
- Export button on relevant pages
- Same filters as current view
- Loading state during export
- Success toast with filename
- Auto-download on completion

### 3.3 PDF Export Implementation

**PDF Generation:**
```typescript
// lib/export.ts
export function generatePDF(data: any[], title: string): void
// Uses jspdf + jspdf-autotable
// Formatted tables with headers
// Landscape orientation for wide data
// Include timestamp on footer
```

**Backend Support:**
- Same endpoints as CSV export
- Query parameter: ?format=pdf
- Response: PDF with Content-Disposition header

### 3.4 File Download Implementation

**Document Download:**
```typescript
// GET /api/admin/documents/{id}/download
// GET /api/employees/documents/{id}/download
// Stream file from storage
// Set proper Content-Type header
// Content-Disposition: attachment
```

---

## Technical Implementation Details

### Package Versions
```json
{
  "@radix-ui/react-dialog": "^1.1.4",
  "@radix-ui/react-dropdown-menu": "^2.1.4", 
  "@radix-ui/react-select": "^2.1.4",
  "@radix-ui/react-toast": "^1.2.4",
  "@radix-ui/react-label": "^2.1.1",
  "@tanstack/react-query": "^5.59.20",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0",
  "jspdf": "^2.5.2",
  "jspdf-autotable": "^3.8.4"
}
```

### File Structure
```
src/
├── components/
│   ├── ui/                  # New shadcn/ui components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Label.tsx
│   │   ├── Dialog.tsx
│   │   ├── AlertDialog.tsx
│   │   ├── Table.tsx
│   │   ├── Toast.tsx
│   │   ├── useToast.tsx
│   │   ├── Badge.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   └── Card.tsx
│   ├── admin/              # Existing + enhanced
│   └── employee/           # Existing + enhanced
├── lib/
│   ├── hooks.ts            # New: useToast, usePagination, useDebounce
│   ├── export.ts           # New: CSV/PDF export utilities
│   ├── utils.ts            # Existing: cn utility
│   └── prisma.ts          # Existing: database client
├── types/
│   └── api.ts              # New: TypeScript API types
└── context/
    └── ToastContext.tsx     # New: Global toast context
```

### API Enhancements

**New Routes:**
```
POST /api/admin/documents/upload
POST /api/employees/documents/upload  
GET /api/admin/documents/{id}/download
GET /api/employees/documents/{id}/download
GET /api/admin/export/users?format=csv
GET /api/admin/export/users?format=pdf
GET /api/admin/export/audit?format=csv
GET /api/admin/export/audit?format=pdf
```

**Enhanced Existing Routes:**
```
GET /api/admin/users?search={query}&role={role}&status={status}&page={page}&limit={limit}&sort={sort}&order={order}
GET /api/admin/documents?category={category}&search={query}&page={page}&limit={limit}
PUT /api/admin/users/{id} (enhanced with full profile support)
```

---

## Success Criteria

### Phase 1 Success Criteria
- [ ] Toast notifications appear on all CRUD operations
- [ ] All form inputs use shadcn/ui components
- [ ] Loading states display on all async operations
- [ ] Error states display user-friendly messages
- [ ] Dialog modals work for create/edit/delete operations

### Phase 2 Success Criteria  
- [ ] Search works with 300ms debounce on user list
- [ ] Filters combine correctly (role + status + department)
- [ ] Sorting works on all table columns
- [ ] Pagination displays correct page counts
- [ ] User CRUD operations have multi-tab forms
- [ ] Real-time validation prevents invalid data submission

### Phase 3 Success Criteria
- [ ] File upload accepts files up to 25MB
- [ ] Drag-and-drop zone visual feedback works
- [ ] Progress indicators show upload status
- [ ] CSV export downloads properly formatted files
- [ ] PDF export generates formatted documents
- [ ] File downloads work with correct MIME types

### Overall Success Criteria
- [ ] All enhancements work on employee portal
- [ ] All enhancements work on admin portal
- [ ] No existing functionality is broken
- [ ] Performance remains acceptable (<2s page loads)
- [ ] Mobile responsiveness maintained
- [ ] Accessibility (WCAG 2.1 AA) maintained

---

## Risk Mitigation

### Technical Risks
**Risk:** File upload increases Vercel deployment size  
**Mitigation:** Use Vercel Blob Storage for large files, implement file size limits

**Risk:** PDF generation may be memory intensive  
**Mitigation:** Limit export to 1000 rows per export, add pagination for large exports

**Risk:** Real-time search may cause excessive API calls  
**Mitigation:** 300ms debounce, implement caching with React Query

### Deployment Risks
**Risk:** Breaking changes to existing APIs  
**Mitigation:** Maintain backward compatibility, version APIs if needed

**Risk:** Increased build time with new dependencies  
**Mitigation:** Optimize imports, use tree-shaking, monitor bundle size

---

## Testing Strategy

### Manual Testing Checklist
1. Test all toast notifications (success, error, warning, info)
2. Test all CRUD operations with new UI components
3. Test search functionality with various terms
4. Test filter combinations (role + status + department)
5. Test sorting on multiple columns
6. Test pagination navigation
7. Test file upload with valid and invalid files
8. Test CSV/PDF export with different filter combinations
9. Test mobile responsiveness
10. Test cross-browser compatibility (Chrome, Firefox, Safari)

### API Testing
1. Test new upload endpoints with various file types
2. Test export endpoints with different query parameters
3. Test enhanced user CRUD endpoints
4. Test file download endpoints
5. Load testing: Test with 50 concurrent users

---

## Rollback Plan

If issues arise during deployment:

**Phase 1 Rollback:**
- Remove shadcn/ui components
- Revert to existing alert system
- Restore previous package.json

**Phase 2 Rollback:**
- Remove filters/pagination/sort from views
- Revert to basic user management
- Restore simple document list

**Phase 3 Rollback:**
- Remove upload endpoints
- Remove export functionality
- Keep Phase 1 and 2 improvements

---

## Next Steps

1. **Implementation Planning:** Create detailed task breakdown for each phase
2. **Phase 1 Implementation:** Install dependencies and implement UI components
3. **Phase 1 Testing:** Deploy and test UI/UX improvements
4. **Phase 2 Implementation:** Add filters, pagination, and advanced CRUD
5. **Phase 2 Testing:** Deploy and test advanced features
6. **Phase 3 Implementation:** Add file upload and export functionality
7. **Phase 3 Testing:** Deploy and test complete system
8. **Final Integration Testing:** End-to-end testing of all enhancements
9. **Documentation:** Update user documentation with new features
10. **Production Deployment:** Final deployment to production environment

---

## Appendix: Component Specifications

### Toast Component Spec
```typescript
interface ToastProps {
  variant: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number  // Default: 5000ms
}

interface Toast {
  id: string
  props: ToastProps
  timestamp: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (props: ToastProps) => void
  removeToast: (id: string) => void
}
```

### Pagination Component Spec
```typescript
interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}
```

### File Upload Component Spec
```typescript
interface FileUploadProps {
  accept: string[]  // MIME types
  maxSize: number   // bytes
  multiple: boolean
  onUpload: (files: File[]) => Promise<void>
  onProgress?: (progress: number) => void
}

interface FileValidationResult {
  valid: boolean
  error?: string
}
```

---

**Design approved and ready for implementation planning phase.**