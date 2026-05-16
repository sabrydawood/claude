# Feature Specification: Age-Adaptive Navigation

**Feature Branch**: `003-age-adaptive-navigation`
**Created**: 2026-05-17
**Decisions**: D-009

## الهدف

التنقل يتغير تلقائياً حسب `age_group` في الـ profile:
- **Spark** (6-9): خطي، Xbot يقود، 3-4 محطات فقط
- **Explorer** (9-12): Knowledge Islands، 4-6 جزر تُفتح تدريجياً
- **Builder** (12-14): Skill Map كامل، اختيار حر

## User Stories

### US1 — Navigation يتغير حسب العمر (P1)
طفل عمره 7 سنوات يرى Xbot يقوده خطوة بخطوة. طفل 11 سنة يرى جزراً. طفل 13 يرى خريطة مهارات.

**Acceptance**:
1. Given age_group=spark → Linear navigation يظهر
2. Given age_group=explorer → Islands navigation يظهر
3. Given age_group=builder → Skill map يظهر
4. Given no age → Explorer افتراضي

### US2 — AgeGroup يُحدَّد من الـ Profile (P2)
النظام يحسب age_group من تاريخ ميلاد الطفل.

**Acceptance**:
1. Given birthdate 7 years ago → age_group = "spark"
2. Given birthdate 11 years ago → age_group = "explorer"
3. Given birthdate 13 years ago → age_group = "builder"

## Requirements

- **FR-001**: `GetAgeGroup(birthdate)` → "spark" | "explorer" | "builder"
- **FR-002**: `AgeAdaptiveNavigation` component renders based on age_group
- **FR-003**: Spark: Linear steps, Xbot icon, locked future steps
- **FR-004**: Explorer: Grid of islands, unlock animation on completion
- **FR-005**: Builder: Full skill tree/map with free navigation
- **FR-006**: RTL-first, dir="rtl" on all navigation components
- **FR-007**: Mobile-first, touch targets ≥ 44px

## Success Criteria

- **SC-001**: Typecheck 0 errors
- **SC-002**: Navigation renders correctly in dashboard
- **SC-003**: RTL layout correct
