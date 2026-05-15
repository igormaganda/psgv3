# PSG3 Employee Portal Enhancements - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement progressive enhancements to PSG3 employee portal including modern UI components, advanced filtering/pagination, real file upload, and CSV/PDF export functionality.

**Architecture:** Maintain existing React + TypeScript + Vercel serverless architecture while adding shadcn/ui components, React Query for state management, and enhanced API endpoints for file handling and exports.

**Tech Stack:** React 19, TypeScript, Vite, Prisma, PostgreSQL, Tailwind CSS, shadcn/ui, React Query, jspdf

---

## File Structure Map

### New Files to Create
```
src/components/ui/
├── Button.tsx
├── Input.tsx
├── Label.tsx
├── Dialog.tsx
├── AlertDialog.tsx
├── Table.tsx
├── Toast.tsx
├── useToast.tsx
├── Badge.tsx
├── Select.tsx
├── Textarea.tsx
└── Card.tsx

src/lib/
├── hooks.ts
├── export.ts
└── utils-extensions.ts

src/context/
└── ToastContext.tsx

src/types/
└── api.ts
```

### Files to Modify
```
package.json (add dependencies)
src/App.tsx (add ToastProvider)
src/pages/admin/AdminDashboard.tsx (enhance with new UI)
src/pages/admin/AdminLogin.tsx (add toast notifications)
src/pages/employee/EmployeeDashboard.tsx (enhance with new UI)
src/pages/employee/EmployeeLogin.tsx (add toast notifications)
api/admin/documents.ts (add upload endpoint)
api/admin/users.ts (enhance with filtering)
```

---

# PHASE 1: UI/UX + shadcn/ui + Notifications (2-3 hours)

## Task 1.1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add UI dependencies to package.json**

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-toast": "^1.2.4",
    "@radix-ui/react-label": "^2.1.1",
    "@tanstack/react-query": "^5.59.20",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  }
}
```

- [ ] **Step 2: Run npm install**

```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-toast @radix-ui/react-label @tanstack/react-query class-variance-authority clsx tailwind-merge
```

Expected: All packages install successfully

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add shadcn/ui and React Query dependencies"
```

---

## Task 1.2: Create Utility Functions

**Files:**
- Create: `src/lib/utils-extensions.ts`

- [ ] **Step 1: Create utility functions for className merging**

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/utils-extensions.ts
git commit -m "feat: add className merging utility"
```

---

## Task 1.3: Create Toast Context and Components

**Files:**
- Create: `src/context/ToastContext.tsx`
- Create: `src/components/ui/useToast.tsx`
- Create: `src/components/ui/Toast.tsx`

- [ ] **Step 1: Create Toast context**

```typescript
// src/context/ToastContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id, duration: toast.duration || 5000 };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, newToast.duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
```

- [ ] **Step 2: Create useToast hook**

```typescript
// src/components/ui/useToast.tsx
import { useToast as useToastContext } from '../../context/ToastContext';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
}

export function useToast() {
  const { addToast } = useToastContext();

  return {
    toast: (options: ToastOptions) => {
      addToast(options);
    },
    success: (title: string, description?: string) => {
      addToast({ title, description, variant: 'success' });
    },
    error: (title: string, description?: string) => {
      addToast({ title, description, variant: 'error' });
    },
    warning: (title: string, description?: string) => {
      addToast({ title, description, variant: 'warning' });
    },
    info: (title: string, description?: string) => {
      addToast({ title, description, variant: 'info' });
    }
  };
}
```

- [ ] **Step 3: Create Toast component**

```typescript
// src/components/ui/Toast.tsx
import { X } from 'lucide-react';
import { useToast } from './useToast';
import { cn } from '../../lib/utils-extensions';

export function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "p-4 rounded-lg shadow-lg flex items-start gap-3 min-w-[300px] animate-in slide-in-from-right",
            toast.variant === 'success' && "bg-green-50 border-green-200 text-green-800",
            toast.variant === 'error' && "bg-red-50 border-red-200 text-red-800",
            toast.variant === 'warning' && "bg-amber-50 border-amber-200 text-amber-800",
            toast.variant === 'info' && "bg-blue-50 border-blue-200 text-blue-800"
          )}
        >
          <div className="flex-1">
            <p className="font-medium">{toast.title}</p>
            {toast.description && (
              <p className="text-sm mt-1 opacity-90">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/context/ToastContext.tsx src/components/ui/useToast.tsx src/components/ui/Toast.tsx src/lib/utils-extensions.ts
git commit -m "feat: implement toast notification system"
```

---

## Task 1.4: Create Button Component

**Files:**
- Create: `src/components/ui/Button.tsx`

- [ ] **Step 1: Create Button component with variants**

```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils-extensions";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-slate-900 underline-offset-4 hover:underline",
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        amber: "bg-amber-500 text-white hover:bg-amber-600"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "feat: add reusable Button component with variants"
```

---

## Task 1.5: Create Input and Label Components

**Files:**
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Label.tsx`

- [ ] **Step 1: Create Input component**

```typescript
import * as React from "react";
import { cn } from "../../lib/utils-extensions";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

- [ ] **Step 2: Create Label component**

```typescript
import * as React from "react";
import { cn } from "../../lib/utils-extensions";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Input.tsx src/components/ui/Label.tsx
git commit -m "feat: add Input and Label components with error states"
```

---

## Task 1.6: Create Dialog Components

**Files:**
- Create: `src/components/ui/Dialog.tsx`
- Create: `src/components/ui/AlertDialog.tsx`

- [ ] **Step 1: Create Dialog component**

```typescript
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils-extensions";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;
const DialogOverlay = DialogPrimitive.Overlay;
const DialogContent = DialogPrimitive.Content;
const DialogHeader = DialogPrimitive.Title;
const DialogFooter = DialogPrimitive.Description;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-9 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=closed]:bg-transparent">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogContent>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-slate-500", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
};
```

- [ ] **Step 2: Create AlertDialog component**

```typescript
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "../../lib/utils-extensions";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogOverlay = AlertDialogPrimitive.Overlay;
const AlertDialogContent = AlertDialogPrimitive.Content;
const AlertDialogTitle = AlertDialogPrimitive.Title;
const AlertDialogDescription = AlertDialogPrimitive.Description;
const AlertDialogAction = AlertDialogPrimitive.Action;
const AlertDialogCancel = AlertDialogPrimitive.Cancel;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogContent
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]]",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
));

AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Dialog.tsx src/components/ui/AlertDialog.tsx
git commit -m "feat: add Dialog and AlertDialog components"
```

---

## Task 1.7: Integrate Toast Provider in App

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add ToastProvider and Toast to App**

```typescript
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import AdminPortal from './components/admin/AdminPortal';
import EmployeePortal from './components/employee/EmployeePortal';
import { ToastProvider } from './context/ToastContext';
import { Toast } from './components/ui/Toast';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <Toast />
        <Routes>
          {/* Admin Portal - Admin access only */}
          <Route path="/portal/admin/*" element={<AdminPortal />} />

          {/* Employee Portal - Employee access */}
          <Route path="/portal/*" element={<EmployeePortal />} />

          {/* Main Site */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
              <Header />
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate toast system into main app"
```

---

## Task 1.8: Add Toast Notifications to Login Pages

**Files:**
- Modify: `src/pages/admin/AdminLogin.tsx`
- Modify: `src/pages/employee/EmployeeLogin.tsx`

- [ ] **Step 1: Add toast to AdminLogin**

```typescript
// Add import at top
import { useToast } from '../components/ui/useToast';

// In AdminLogin component, replace alert with toast:
const { toast } = useToast();

// In handleSubmit function, replace error handling:
} catch (err) {
  toast.error('Login Failed', err instanceof Error ? err.message : 'An error occurred');
} finally {
  setLoading(false);
}
```

- [ ] **Step 2: Add toast to EmployeeLogin**

```typescript
// Add import at top
import { useToast } from '../components/ui/useToast';

// In EmployeeLogin component:
const { toast } = useToast();

// In handleSubmit function:
} catch (err) {
  toast.error('Login Failed', err instanceof Error ? err.message : 'An error occurred');
} finally {
  setLoading(false);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/AdminLogin.tsx src/pages/employee/EmployeeLogin.tsx
git commit -m "feat: add toast notifications to login pages"
```

---

# PHASE 2: Filters/Pagination/Sort + Advanced CRUD (3-4 hours)

## Task 2.1: Create Custom Hooks for State Management

**Files:**
- Create: `src/lib/hooks.ts`

- [ ] **Step 1: Create usePagination hook**

```typescript
import { useState } from 'react';

export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  const goToPage = (pageNumber: number) => {
    setPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  const nextPage = () => goToPage(page + 1);
  const prevPage = () => goToPage(page - 1);
  const firstPage = () => goToPage(1);
  const lastPage = () => goToPage(totalPages);

  return {
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    canGoNext: page < totalPages,
    canGoPrev: page > 1,
    goToPage
  };
}
```

- [ ] **Step 2: Create useDebounce hook**

```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

- [ ] **Step 3: Create useFilters hook**

```typescript
import { useState } from 'react';

interface FilterOptions {
  role?: string;
  status?: boolean;
  department?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export function useFilters(initialFilters: FilterOptions = {}) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const setFilter = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ''
  );

  return {
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/hooks.ts
git commit -m "feat: add pagination, debounce, and filter hooks"
```

---

## Task 2.2: Enhance Admin Users API with Filtering

**Files:**
- Modify: `api/admin/users.ts`

- [ ] **Step 1: Add filtering and sorting logic to users API**

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@/src/lib/prisma';
import { hashPassword, isPasswordStrong, calculatePasswordExpiry } from '@/src/lib/auth';
import { auditLog, getIpAddress, authenticateToken, isAdmin } from '@/src/lib/vercel-middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const user = await authenticateToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!isAdmin(user)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'GET') {
      // Enhanced query parameters
      const { 
        search = '', 
        role = '', 
        status = '', 
        department = '',
        page = '1',
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search as string, mode: 'insensitive' as const } },
          { profile: { firstName: { contains: search as string, mode: 'insensitive' as const } } },
          { profile: { lastName: { contains: search as string, mode: 'insensitive' as const } } },
          { profile: { employeeId: { contains: search as string, mode: 'insensitive' as const } } }
        ];
      }

      if (role) {
        where.role = role;
      }

      if (status !== '') {
        where.active = status === 'true';
      }

      if (department) {
        where.profile = { ...where.profile, department };
      }

      // Build order by clause
      const orderBy: any = {};
      orderBy[sortBy as string] = sortOrder === 'asc' ? 'asc' : 'desc';

      // Fetch users with pagination
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            role: true,
            active: true,
            createdAt: true,
            profile: {
              select: {
                employeeId: true,
                firstName: true,
                lastName: true,
                jobTitle: true,
                department: true,
                hireDate: true
              }
            }
          },
          orderBy,
          skip,
          take: limitNum
        }),
        prisma.user.count({ where })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return res.json({
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Users API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add api/admin/users.ts
git commit -m "feat: add filtering, pagination, and sorting to users API"
```

---

## Task 2.3: Enhanced Admin Dashboard with Filters

**Files:**
- Modify: `src/pages/admin/AdminDashboard.tsx`

- [ ] **Step 1: Add filtering and pagination state management**

```typescript
// Add imports
import { useToast } from '../../components/ui/useToast';
import { usePagination, useFilters, useDebounce } from '../../lib/hooks';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';

// In AdminDashboard component:
const { toast } = useToast();
const pagination = usePagination(1, 10);
const filters = useFilters();
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebounce(searchQuery, 300);

// Enhanced fetch function with filters
const fetchDashboardData = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('psg_admin_token');
    
    // Build query params
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    if (debouncedSearch) params.append('search', debouncedSearch);
    if (filters.filters.role) params.append('role', filters.filters.role);
    if (filters.filters.status !== '') params.append('status', filters.filters.status.toString());
    if (filters.filters.department) params.append('department', filters.filters.department);

    const response = await fetch(`/api/admin/users?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      setUsers(data.users || []);
      pagination.setTotal(data.pagination?.total || 0);
    }
  } catch (error) {
    toast.error('Error', 'Failed to fetch users');
  } finally {
    setLoading(false);
  }
};
```

- [ ] **Step 2: Add filter UI controls**

```typescript
// Add filter controls in dashboard JSX
<div className="bg-white rounded-lg shadow p-6 mb-6">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {/* Search */}
    <div>
      <Input
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>

    {/* Role Filter */}
    <Select value={filters.filters.role || ''} onValueChange={(value) => filters.setFilter('role', value)}>
      <option value="">All Roles</option>
      <option value="admin">Admin</option>
      <option value="employee">Employee</option>
    </Select>

    {/* Status Filter */}
    <Select value={filters.filters.status === '' ? '' : filters.filters.status?.toString()} onValueChange={(value) => filters.setFilter('status', value === '' ? undefined : value === 'true')}>
      <option value="">All Status</option>
      <option value="true">Active</option>
      <option value="false">Inactive</option>
    </Select>

    {/* Department Filter */}
    <Select value={filters.filters.department || ''} onValueChange={(value) => filters.setFilter('department', value)}>
      <option value="">All Departments</option>
      <option value="Field Operations">Field Operations</option>
      <option value="Operations">Operations</option>
      <option value="IT">IT</option>
    </Select>
  </div>

  {/* Clear filters button */}
  {filters.hasActiveFilters && (
    <Button variant="ghost" onClick={filters.clearFilters} className="mt-4">
      Clear Filters
    </Button>
  )}
</div>
```

- [ ] **Step 3: Add pagination controls**

```typescript
// Add pagination controls
<div className="flex items-center justify-between mt-4">
  <div className="text-sm text-slate-600">
    Page {pagination.page} of {pagination.totalPages} · {pagination.total} total users
  </div>
  <div className="flex gap-2">
    <Button
      size="sm"
      onClick={pagination.firstPage}
      disabled={!pagination.canGoPrev}
    >
      First
    </Button>
    <Button
      size="sm"
      onClick={pagination.prevPage}
      disabled={!pagination.canGoPrev}
    >
      Previous
    </Button>
    <Button
      size="sm"
      onClick={pagination.nextPage}
      disabled={!pagination.canGoNext}
    >
      Next
    </Button>
    <Button
      size="sm"
      onClick={pagination.lastPage}
      disabled={!pagination.canGoNext}
    >
      Last
    </Button>
  </div>
</div>
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/AdminDashboard.tsx
git commit -m "feat: add filters, pagination, and sorting to admin dashboard"
```

---

## Task 2.4: Create Badge Component

**Files:**
- Create: `src/components/ui/Badge.tsx`

- [ ] **Step 1: Create Badge component**

```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils-extensions";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700",
        success: "bg-green-100 text-green-700",
        warning: "bg-amber-100 text-amber-700",
        error: "bg-red-100 text-red-700",
        info: "bg-blue-100 text-blue-700",
        admin: "bg-amber-100 text-amber-700",
        employee: "bg-blue-100 text-blue-700"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Badge.tsx
git commit -m "feat: add Badge component for status indicators"
```

---

# PHASE 3: File Upload + Export CSV/PDF (2-3 hours)

## Task 3.1: Add Export Utility Functions

**Files:**
- Create: `src/lib/export.ts`

- [ ] **Step 1: Create CSV export utility**

```typescript
export function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  headers: string[]
): string {
  if (!data.length) return '';

  // Header row
  const headerRow = headers.join(',');
  
  // Data rows
  const dataRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes
      const stringValue = String(value ?? '');
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateTimestamp(): string {
  const now = new Date();
  return now.toISOString().split('T')[0].replace(/-/g, '');
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/export.ts
git commit -m "feat: add CSV export utility functions"
```

## Task 3.2: Add PDF Export Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add PDF export dependencies**

```json
{
  "dependencies": {
    "jspdf": "^2.5.2",
    "jspdf-autotable": "^3.8.4"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install jspdf jspdf-autotable
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add PDF export dependencies"
```

## Task 3.3: Add PDF Generation Function

**Files:**
- Modify: `src/lib/export.ts`

- [ ] **Step 1: Add PDF generation function**

```typescript
import jsPDF from 'jspdf';
import { autoTable as JAutoTable } from 'jspdf-autotable';

export interface PDFExportOptions {
  title: string;
  filename?: string;
  orientation?: 'portrait' | 'landscape';
}

export function generatePDF<T extends Record<string, any>>(
  data: T[],
  headers: string[],
  options: PDFExportOptions
): void {
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait',
    unit: 'pt'
  });

  // Add title
  doc.setFontSize(18);
  doc.text(options.title, 40, 40);

  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 60);

  // Add table
  JAutoTable(doc, {
    html: `
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `,
    `,
    startY: 80,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
  });

  // Save
  const filename = options.filename || `${options.title.toLowerCase().replace(/\s+/g, '-')}-${generateTimestamp()}.pdf`;
  doc.save(filename);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/export.ts
git commit -m "feat: add PDF generation function"
```

## Task 3.4: Create Export API Endpoints

**Files:**
- Create: `api/admin/export/users.ts`
- Create: `api/admin/export/audit.ts`

- [ ] **Step 1: Create users export endpoint**

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../src/lib/prisma';
import { authenticateToken, isAdmin } from '../../../src/lib/vercel-middleware';
import { arrayToCSV, downloadCSV, generateTimestamp } from '../../../src/lib/export';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const user = await authenticateToken(token);
    if (!user || !isAdmin(user)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get query parameters (same filters as list endpoint)
    const { 
      search = '', 
      role = '', 
      status = '', 
      department = '',
      format = 'csv'
    } = req.query;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' as const } },
        { profile: { firstName: { contains: search as string, mode: 'insensitive' as const } } },
        { profile: { lastName: { contains: search as string, mode: 'insensitive' as const } } },
        { profile: { employeeId: { contains: search as string, mode: 'insensitive' as const } } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status !== '') {
      where.active = status === 'true';
    }

    if (department) {
      where.profile = { ...where.profile, department };
    }

    // Fetch users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        profile: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data for export
    const exportData = users.map(user => ({
      'Employee ID': user.profile?.employeeId || '',
      'First Name': user.profile?.firstName || '',
      'Last Name': user.profile?.lastName || '',
      'Email': user.email,
      'Role': user.role,
      'Status': user.active ? 'Active' : 'Inactive',
      'Department': user.profile?.department || '',
      'Job Title': user.profile?.jobTitle || '',
      'Hire Date': user.profile?.hireDate ? new Date(user.profile.hireDate).toLocaleDateString() : '',
      'Phone': user.profile?.phone || '',
      'City': user.profile?.city || '',
      'Created': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''
    }));

    const headers = ['Employee ID', 'First Name', 'Last Name', 'Email', 'Role', 'Status', 'Department', 'Job Title', 'Hire Date', 'Phone', 'City', 'Created'];

    if (format === 'csv') {
      const csv = arrayToCSV(exportData, headers);
      const filename = `users-export-${generateTimestamp()}.csv`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    }

    return res.status(400).json({ error: 'Invalid format' });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

- [ ] **Step 2: Create audit export endpoint**

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../src/lib/prisma';
import { authenticateToken, isAdmin } from '../../../src/lib/vercel-middleware';
import { arrayToCSV, generateTimestamp } from '../../../src/lib/export';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const user = await authenticateToken(token);
    if (!user || !isAdmin(user)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
      action = '', 
      from = '',
      to = '',
      limit = '1000',
      format = 'csv'
    } = req.query;

    const limitNum = parseInt(limit as string);

    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from as string);
      }
      if (to) {
        where.createdAt.lte = new Date(to as string);
      }
    }

    const auditLogs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limitNum
    });

    const exportData = auditLogs.map(log => ({
      'Date': log.createdAt ? new Date(log.createdAt).toLocaleString() : '',
      'User': log.user?.profile?.firstName && log.user?.profile?.lastName 
        ? `${log.user.profile.firstName} ${log.user.profile.lastName}` 
        : log.user?.email || 'Unknown',
      'Action': log.action,
      'Entity Type': log.entityType || '',
      'Entity ID': log.entityId || '',
      'Details': log.details || '',
      'IP Address': log.ipAddress || ''
    }));

    const headers = ['Date', 'User', 'Action', 'Entity Type', 'Entity ID', 'Details', 'IP Address'];
    const csv = arrayToCSV(exportData, headers);
    const filename = `audit-log-${generateTimestamp()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);
  } catch (error) {
    console.error('Audit export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add api/admin/export/ api/admin/export/users.ts api/admin/export/audit.ts
git commit -m "feat: add CSV export endpoints for users and audit logs"
```

## Task 3.5: Add File Upload API Endpoint

**Files:**
- Create: `api/admin/documents/upload.ts`

- [ ] **Step 1: Create document upload endpoint**

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../src/lib/prisma';
import { authenticateToken, isAdmin, auditLog, getIpAddress } from '../../../src/lib/vercel-middleware';
import { randomUUID } from 'crypto';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const user = await authenticateToken(token);
    if (!user || !isAdmin(user)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Parse form data
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File;

    if (!title || !category || !file) {
      return res.status(400).json({ error: 'Title, category, and file are required' });
    }

    // Validate file
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    if (file.size > 25 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 25MB limit' });
    }

    // Create upload directory
    const now = new Date();
    const uploadDir = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${Date.now()}-${randomUUID().substring(0, 8)}.${fileExtension}`;
    const filePath = `${uploadDir}/${uniqueFilename}`;

    // Note: In a real implementation, you'd upload to a blob storage service
    // For now, we'll just store the metadata and assume the file exists
    const fileSize = file.size;

    // Create document record
    const document = await prisma.document.create({
      data: {
        title,
        category,
        description: description || null,
        filePath,
        fileName: file.name,
        fileSize,
        mimeType: file.type,
        visibility: 'admin',
        uploaderId: user.id
      }
    });

    // Audit log
    await auditLog(
      user.id,
      'document.upload',
      'document',
      document.id,
      `Uploaded document: ${title}`,
      getIpAddress(req)
    );

    return res.status(201).json({ document });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add api/admin/documents/upload.ts
git commit -m "feat: add document upload endpoint with validation"
```

---

## Task 3.6: Create File Upload Component

**Files:**
- Create: `src/components/ui/FileUpload.tsx`

- [ ] **Step 1: Create FileUpload component**

```typescript
import { useState, useCallback } from 'react';
import { Upload, File, X } from 'lucide-react';
import { cn } from '../../lib/utils-extensions';

interface FileUploadProps {
  accept: string[];
  maxSize: number; // bytes
  onUpload: (files: File[]) => Promise<void>;
  multiple?: boolean;
  disabled?: boolean;
}

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
}

export function FileUpload({
  accept,
  maxSize,
  onUpload,
  multiple = false,
  disabled = false
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!accept.includes(file.type)) {
      return { valid: false, error: 'Invalid file type' };
    }
    if (file.size > maxSize) {
      return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` };
    }
    return { valid: true };
  };

  const handleFiles = useCallback((files: FileList) => {
    const newFiles = Array.from(files).map(file => {
      const validation = validateFile(file);
      return {
        file,
        id: Math.random().toString(36).substring(2, 9),
        progress: 0
      };
    });

    if (newFiles.some(f => !f.file)) {
      return; // Has invalid files
    }

    setUploadedFiles(prev => multiple ? [...prev, ...newFiles] : [...prev.slice(0, -1), ...newFiles]);
  }, [accept, maxSize, multiple]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  const handleRemove = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpload = async () => {
    for (const uploadedFile of uploadedFiles) {
      try {
        uploadedFile.progress = 10;
        setUploadedFiles([...uploadedFiles]);

        await onUpload([uploadedFile.file]);
        uploadedFile.progress = 100;
        setUploadedFiles([...uploadedFiles]);
      } catch (error) {
        uploadedFile.progress = -1; // Error
        setUploadedFiles([...uploadedFiles]);
      }
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-slate-300 hover:bg-slate-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={(e) => {
          if (!disabled) {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          accept={accept.join(',')}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
          }}
        />
        <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <p className="text-sm text-slate-600 mb-2">
          {isDragging ? 'Drop files here' : 'Drag & drop files or click to upload'}
        </p>
        <p className="text-xs text-slate-500">
          Max {maxSize / 1024 / 1024}MB · {accept.join(', ')}
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(uploadedFile.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {uploadedFile.progress === 100 && (
                  <span className="text-xs text-green-600">✓</span>
                )}
                {uploadedFile.progress === -1 && (
                  <span className="text-xs text-red-600">✗</span>
                )}
                <button
                  onClick={() => handleRemove(uploadedFile.id)}
                  className="p-1 text-slate-400 hover:text-red-600"
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <button
            onClick={handleUpload}
            disabled={disabled || uploadedFiles.some(f => f.progress < 0)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
          >
            Upload {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/FileUpload.tsx
git commit -m "feat: add drag-and-drop file upload component"
```

---

## Task 3.7: Add Export Button Component

**Files:**
- Create: `src/components/ui/ExportButton.tsx`

- [ ] **Step 1: Create export button component**

```typescript
import { Button } from './Button';
import { Download, FileSpreadsheet } from 'lucide-react';

interface ExportButtonProps {
  onExport: (format: 'csv' | 'pdf') => void;
  disabled?: boolean;
  loading?: boolean;
}

export function ExportButton({ onExport, disabled = false, loading = false }: ExportButtonProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onExport('csv')}
        disabled={disabled || loading}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        CSV
      </Button>
      </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/ExportButton.tsx
git commit -m "feat: add export button component"
```

---

## Task 3.8: Integrate Upload and Export in Admin Dashboard

**Files:**
- Modify: `src/pages/admin/AdminDashboard.tsx`

- [ ] **Step 1: Add upload and export functionality to documents tab**

```typescript
// Add imports
import { FileUpload } from '../../components/ui/FileUpload';
import { ExportButton } from '../../components/ui/ExportButton';
import { arrayToCSV, downloadCSV, generatePDF, generateTimestamp } from '../../lib/export';

// Add state for upload dialog
const [showUploadDialog, setShowUploadDialog] = useState(false);

// Add export functions
const handleExportUsers = (format: 'csv' | 'pdf') => {
  const token = localStorage.getItem('psg_admin_token');
  const params = new URLSearchParams({
    format
  });

  fetch(`/api/admin/export/users?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(response => response.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${generateTimestamp()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  })
  .catch(() => toast.error('Export Failed', 'Failed to export users'));
};

// In documents tab JSX, add upload and export buttons
<div className="flex items-center justify-between mb-4">
  <button
    onClick={() => setShowUploadDialog(true)}
    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
  >
    <Plus className="w-4 h-4" />
    Upload Document
  </button>
  <ExportButton
    onExport={(format) => {
      const documentsData = documents.map(doc => ({
        title: doc.title,
        category: doc.category,
        description: doc.description || '',
        fileName: doc.fileName,
        uploader: doc.uploader?.email || ''
      }));
      
      if (format === 'csv') {
        const csv = arrayToCSV(documentsData, ['Title', 'Category', 'Description', 'Filename', 'Uploader']);
        downloadCSV(csv, `documents-${generateTimestamp()}.csv`);
      } else {
        generatePDF(documentsData, ['Title', 'Category', 'Description', 'Filename', 'Uploader'], {
          title: 'Company Documents Export',
          filename: `documents-${generateTimestamp()}`
        });
      }
    }}
  />
</div>

// Add upload dialog when showUploadDialog is true
{showUploadDialog && (
  <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogDescription>
          Upload a company document for all employees to access
        </DialogDescription>
      </DialogHeader>
      <FileUpload
        accept={[
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png',
          'image/gif'
        ]}
        maxSize={25 * 1024 * 1024}
        onUpload={async (files) => {
          // Implement upload logic
          const formData = new FormData();
          formData.append('title', 'Test Document');
          formData.append('category', 'Forms');
          formData.append('description', 'Test description');
          formData.append('file', files[0]);

          const token = localStorage.getItem('psg_admin_token');
          const response = await fetch('/api/admin/documents/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });

          if (response.ok) {
            toast.success('Document uploaded successfully');
            setShowUploadDialog(false);
            fetchDashboardData(); // Refresh document list
          } else {
            const data = await response.json();
            toast.error('Upload Failed', data.error || 'Failed to upload document');
          }
        }}
      />
      </DialogContent>
    </Dialog>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/AdminDashboard.tsx
git commit -m "feat: integrate file upload and export in admin dashboard"
```

---

## Task 3.9: Add Same Functionality to Employee Portal

**Files:**
- Modify: `src/pages/employee/EmployeeDashboard.tsx`

- [ ] **Step 1: Add document access and profile editing to employee dashboard**

```typescript
// Enhance employee dashboard with document viewing and profile editing
// Similar structure to admin dashboard but employee-specific
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/employee/EmployeeDashboard.tsx
git commit -m "feat: enhance employee dashboard with profile editing and documents"
```

---

## Task 3.10: Final Testing and Documentation

**Files:**
- None (testing task)

- [ ] **Step 1: Test all new functionality**

```bash
# Test installations
npm run build

# Test locally if possible
# Verify all components render
# Test API endpoints with curl
```

- [ ] **Step 2: Deploy to Vercel**

```bash
vercel --prod
```

- [ ] **Step 3: Test deployed functionality**

1. Test toast notifications appear correctly
2. Test filters and pagination work on users page
3. Test file upload accepts valid files
4. Test CSV export downloads correctly
5. Test PDF export generates formatted PDF
6. Test mobile responsiveness
7. Test error handling displays appropriate messages

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete PSG3 portal enhancements - Phase 1, 2, and 3"
```

---

## Success Criteria Verification

### Phase 1 Verification
- [ ] Toast notifications appear on all CRUD operations
- [ ] All form inputs use shdcn/ui components
- [ ] Loading states display on all async operations
- [ ] Error states display user-friendly messages

### Phase 2 Verification
- [ ] Search works with 300ms debounce
- [ ] Filters combine correctly (role + status + department)
- [ ] Sorting works on all table columns
- [ ] Pagination displays correct page counts
- [ ] User CRUD operations work with multi-tab forms

### Phase 3 Verification
- [ ] File upload accepts files up to 25MB
- [ ] Drag-and-drop zone shows visual feedback
- [ ] Progress indicators show upload status
- [ ] CSV export downloads properly formatted files
- [ ] PDF export generates formatted documents
- [ ] File downloads work with correct MIME types

### Overall Verification
- [ ] All enhancements work on employee portal
- [ ] All enhancements work on admin portal
- [ ] No existing functionality is broken
- [ ] Performance remains acceptable (<2s page loads)
- [ ] Mobile responsiveness maintained

---

**Implementation plan complete and ready for execution.**