---
name: StayHub Refunds
description: Scoped design evidence for the refund workspace and cancellation confirmation.
colors:
  management-primary: "#0b5f53"
  customer-accent: "#c91f4b"
  surface: "#ffffff"
  management-canvas: "#f4f8f7"
  management-ink: "#12211d"
  pending-text: "#944600"
  completed-text: "#236b09"
  history-secondary: "#52635d"
  history-divider: "#dce7e3"
typography:
  body:
    fontFamily: "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  booking-title:
    fontSize: "20px"
  amount:
    fontSize: "26px"
    fontWeight: 650
rounded:
  management-control: "10px"
  surface: "12px"
spacing:
  compact: "8px"
  field: "12px"
  group: "16px"
  section: "24px"
components:
  button-management:
    backgroundColor: "{colors.management-primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.management-control}"
  tag-pending:
    textColor: "{colors.pending-text}"
  tag-completed:
    textColor: "{colors.completed-text}"
  refund-history:
    padding: "16px 0"
---

# Design System: StayHub Refunds

## Overview

**Creative North Star: "Readable refund ledger"**

This is code-led evidence for an incumbent app expansion in Operate mode, limited to the refund workspace and its cancellation entry point. The phrase above describes the implemented financial hierarchy; it is not a new project identity or an approved visual comp. Management retains its green Ant Design shell; customer pages retain the rose account shell. Both present the same refund facts with clear amounts, status labels, and dated history.

**Key Characteristics:**
- Quiet white surfaces with restrained shell accents.
- Tabular amounts and explicit Vietnamese status labels.
- A compact queue with a separate detail drawer.
- Processing controls appear only when the server grants permission.

Evidence: `components/RefundWorkspace.tsx`, `refunds.css`, `../bookings/components/CancellationDialog.tsx`, the management theme in `../../app/layouts/AdminLayout.tsx`, and the account styles in `../../shared/styles/`. Review captures are under the repository's `.impeccable/review/refund-*.png` at desktop and mobile sizes. These files record implementation conventions, not a final QA verdict. Cancellation rules remain owned by the backend's `BOOKING_CANCELLATION.md`.

## Colors

### Primary
- **Management green:** processing and search actions inherit the management Ant Design provider.
- **Customer rose:** customer search actions and surrounding account chrome inherit the client shell. Keep provider context when reusing the workspace.

### Neutral
- **White surface / management canvas:** distinguish the working panel from the surrounding management page.
- **Management ink:** financial facts and labels remain dark and readable.
- **History secondary / divider:** timestamps and metadata are secondary; thin rules separate events.

Pending and completed tags retain Ant Design's semantic backgrounds with the scoped darker text overrides in the frontmatter. Processing uses the existing blue Ant Design preset. Each tag includes its full status label, so color is supplementary.

**The Explicit Status Rule.** Always pair the semantic tag color with the readable Vietnamese status label in both queue and detail.

## Typography

The current management and customer shells use Be Vietnam Pro with sans-serif fallbacks. Ant Design controls and portal content inherit their active theme; reuse those providers rather than introducing a feature font.

Booking codes form the compact detail heading. The amount is the largest figure in the drawer, using the amount role above; queue amounts use bold text aligned to the right. Both use tabular numerals. Notes preserve line breaks, and long detail content may wrap anywhere.

**The Stable Amount Rule.** Reuse the shared money formatter and tabular numerals for every refund amount; preserve currency in queue, detail, and cancellation confirmation.

## Layout

The toolbar wraps with group spacing, a status filter at least (180px) wide, and a flexible search field from (180px) to (420px). The queue uses ten rows per page and an inner horizontally scrollable table with a minimum working width of (780px).

At (640px) and below, the filter becomes full width, search loses its maximum width, a horizontal-scroll hint appears, and the management panel padding becomes (16px). The drawer requests (640px) on desktop; the reviewed mobile capture shows it filling the available width. Keep the drawer body scrollable for long history and forms.

The heading wraps code and status with field spacing. History rows use compact internal gaps and group padding. The action form uses a single column, field spacing, and a divider above it. Customer navigation and account layout remain owned by the incumbent shell.

## Elevation & Depth

The queue uses the existing white bordered surface card and its restrained shared shadow. Inside the detail drawer, thin dividers and whitespace establish hierarchy. Drawer and cancellation-modal overlays use Ant Design's existing depth and dismissal behavior. This feature adds no independent shadow or motion system.

## Shapes

Management controls inherit gently rounded corners from the management provider; the queue surface uses the shared surface radius. Customer controls retain the client shell's rounded treatment. Tags retain their compact Ant Design shape. Do not normalize these contextual shapes into a new feature-wide override.

## Components

**Queue and detail:** the underlined booking-code button and “Xem chi tiết” action open the same drawer. Keep code, hotel, amount, state, and creation time visible in their established order. Loading, empty, error, and retry states use shared components.

**Status tags:** “Chờ hoàn tiền”, “Đang xử lý”, and “Đã hoàn tiền” are the shared queue/detail labels. Pending and completed text overrides are deliberately scoped to the workspace and detail.

**History:** each event has a bold action label, a Vietnam-localized timestamp, and optional note/reference. Notes preserve line breaks; dividers keep adjacent events distinct.

**Admin form:** reuse labeled Ant Design inputs and textarea, inline validation, loading controls, and an explicit error alert. A version conflict offers a reload action while preserving the draft. The completion copy states that the action records a refund already performed outside the software. The server's `canProcess` controls availability; owner and customer views retain read-only progress messaging.

**Cancellation confirmation:** show the server's policy message, zero cancellation fee, quoted refund amount, and cutoff in Vietnam time before confirmation. Paid cancellation is eligible only before the booked check-in cutoff under the backend policy. Keep “Giữ đặt phòng” beside the danger confirmation. While submitting, disable dismissal and duplicate actions; a failed or stale quote requires another policy check. Creation of a refund request is distinct from actual payment completion.

**Focus and interaction:** preserve Ant Design's native control states and the incumbent keyboard focus treatment. The booking-code button has an explicit current-color outline with (4px) offset. Avoid replacing semantic buttons or labels with decorative text.

## Do's and Don'ts

### Do:
- Do preserve the active management or customer shell when reusing refund components.
- Do keep amounts, status labels, and dated processing history readable together.
- Do show the quoted amount and Vietnam-localized cutoff before confirming cancellation.
- Do keep owner and customer progress views read-only and follow server-granted processing permission.

### Don't:
- Don't use tag color as the only expression of refund status.
- Don't present cancellation success or refund-request creation as money already returned.
- Don't shrink the table's financial columns to fit mobile; retain inner scrolling and its hint.
- Don't derive a global brand or redesign unrelated screens from these scoped conventions.
