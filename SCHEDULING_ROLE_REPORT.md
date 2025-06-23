# Scheduling Role Visibility Report

This document summarizes how Think AI's automated scheduling features work and how they might be exposed to each user role. The platform advertises "Smart Scheduling" capabilities in the marketing pages and integrates role-based dashboards for different team members.

## AI-Powered Scheduling

The marketing features page highlights "Smart Scheduling" with several automation elements:

```tsx
    name: "Smart Scheduling",
    description: "Optimize your shooting schedule with AI that considers all production constraints and maximizes efficiency.",
    icon: Calendar,
    features: [
      "Location-based scene grouping",
      "Cast availability optimization",
      "Equipment and crew scheduling",
      "Weather and daylight considerations",
      "Setup and breakdown time estimation",
      "Conflict detection and resolution"
    ]
```

The same page emphasizes that Think AI covers the entire workflow "from script to shooting schedule":

```tsx
              Discover how Think AI's comprehensive suite of tools transforms your
              pre-production workflow from script to shooting schedule.
```

These excerpts show that scheduling automation is a core feature designed to analyze the script, break down characters, sets, and requirements, and then generate an optimized production schedule.

## Role Definitions

Roles are defined in `lib/roles.ts` and include admin, writer, producer, storyboard_artist, director, and team_member:

```ts
export const ROLE_PERMISSIONS = {
  admin: [
    'projects:create',
    'projects:edit',
    'projects:delete',
    'projects:view',
    'scripts:create',
    'scripts:edit',
    'scripts:delete',
    'scripts:view',
    'storyboards:create',
    'storyboards:edit',
    'storyboards:delete',
    'storyboards:view',
    'users:manage',
    'settings:manage',
    'analytics:view'
  ],
  writer: [
    'scripts:create',
    'scripts:edit',
    'scripts:view',
    'projects:view'
  ],
  producer: [
    'projects:create',
    'projects:edit',
    'projects:view',
    'scripts:view',
    'storyboards:view',
    'analytics:view',
    'users:view'
  ],
  storyboard_artist: [
    'storyboards:create',
    'storyboards:edit',
    'storyboards:view',
    'scripts:view',
    'projects:view'
  ],
  director: [
    'projects:edit',
    'projects:view',
    'scripts:view',
    'scripts:edit',
    'storyboards:view',
    'storyboards:edit',
    'analytics:view'
  ],
  team_member: [
    'projects:view',
    'scripts:view',
    'storyboards:view'
  ]
} as const
```

Each role has its own dashboard component as seen in `app/(authenticated)/dashboard/_components/role-based-dashboard.tsx`.

## Scheduling Navigation

Within the producer dashboard, there is a navigation item pointing to a schedule page:

```tsx
  {
    name: "Schedule",
    description: "View project timelines",
    icon: Calendar,
    href: "/dashboard/schedule",
    color: "text-purple-500"
  }
```

This suggests that producers (and potentially other high-level roles) will have direct access to scheduling tools in the dashboard.

## Role-Wise Scheduling Visibility (Conceptual)

Based on the role hierarchy and existing permissions, the likely breakdown of scheduling access is:

| Role | Scheduling Capabilities |
| --- | --- |
| **Admin** | Full visibility and editing rights for all schedules across projects. |
| **Producer** | Central control of scheduling—create, edit, and manage production timelines and call sheets. |
| **Director** | View and adjust scene order, review cast and crew availability, and approve schedule changes. |
| **Writer** | Read-only access to finalized schedules to stay aligned with production timelines. |
| **Storyboard Artist** | View scheduled scenes relevant to storyboards; typically cannot modify the master schedule. |
| **Team Member** | Limited visibility to their own tasks and call times, without access to global scheduling adjustments. |

These distinctions align with the role-based dashboard system and permission levels defined in the codebase. As scheduling functionality is implemented, permissions such as `schedule:view` and `schedule:edit` could be added to further refine access.

