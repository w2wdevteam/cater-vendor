# API Questions / Gaps — Cater-Admin Swagger

Source of truth: `http://localhost:3000/api-docs/cater-admin-json`
Generated against swagger snapshot on 2026-04-22 during frontend integration.

---

## 1. ✅ RESOLVED — Admin management endpoints

Backend exposes `GET/POST /cater-admin/admins`, `GET/PATCH /cater-admin/admins/{id}`, `PATCH /cater-admin/admins/{id}/status`, `PATCH /cater-admin/admins/{id}/password`. Frontend is wired up against `CreateScopedAdminDto` (fullName, phone, email?, password) / `UpdateScopedAdminDto` (fullName?, phone?, email?). The role picker was removed from the UI since cater-admin only manages peer `cater_admin` records on its own catering; the backend enforces scope. Self-deactivation and self-password-reset buttons are hidden (backend rejects them anyway).

---

## 2. ✅ RESOLVED — Company CRUD endpoints

Backend exposes `POST /cater-admin/companies`, `PATCH /cater-admin/companies/{id}`, `PATCH /cater-admin/companies/{id}/status`, `POST /cater-admin/companies/{id}/logo`. Frontend wired against `CreateScopedCompanyDto` / `UpdateScopedCompanyDto` — `name` + `contactPhone` required, `address` / `contactName` / `contactEmail` / `notes` / `deliveryWindowStart` / `deliveryWindowEnd` optional. `employeeCount` was removed from the sheet since it's a backend-computed field, not writable. `useSetCompanyStatus` hook is available for wiring into the detail page when desired.

---

## 3. `CaterAdminProfileDto` — `email` and `lastLogin` typed as `object` nullable

```json
"email":     { "type": "object", "nullable": true }
"lastLogin": { "type": "object", "nullable": true }
```

These are almost certainly meant to be `string`/`string | null` and `ISO date string | null` respectively. I'm treating them as `string | null` on the frontend — please confirm and fix the Nest DTO so swagger reflects reality.

---

## 4. Audit log filter naming

Frontend currently uses `from`, `to`, `actionType` on `AuditLogFilters`. Swagger exposes `dateFrom`, `dateTo`, `action` (plus `entityType`, `entityId`, `performedById`, `search`).

I'm renaming the frontend filter keys to match swagger. No blocker — just noting the divergence so future work doesn't reintroduce the old names.

---

## 5. Departments write endpoints

Swagger exposes only `GET /cater-admin/departments` + `GET /cater-admin/departments/{id}` + `GET /cater-admin/departments/lookup`.

The frontend currently has no department management page (departments are only consumed as lookup options). No blocker — but if cater-admin is ever meant to create/edit departments, POST/PATCH endpoints will be needed.

---

## 6. Menu-item image upload contract

`POST /cater-admin/menu-items/{id}/image` and `DELETE /cater-admin/menu-items/{id}/image` are exposed, but the request shape for upload is not spelled out in the swagger I fetched. I'm assuming `multipart/form-data` with field name `file`. Please confirm.

---

## 7. Not-delivered bulk-action payload

`POST /cater-admin/not-delivered-requests/bulk-action` — assuming shape `{ ids: string[], action: 'approve' | 'reject' }`. Please confirm field names.

---

## 8. Refresh-token lifetime / rotation policy

Frontend is configured to call `POST /cater-admin/auth/refresh` with `{ refreshToken }` and persist the new `{ accessToken, refreshToken }`. It assumes rotation on every refresh. Please confirm the backend actually rotates the refresh token on each call.

---

## 9. OrderCreatePage UI mismatch (partially resolved)

✅ `CreateOrderDto.quantity?: number` (≥1) is now accepted; frontend sends one call per place-order action and shows `quantity × unitPrice` as the line total.

Still outstanding on the UI:
1. No employee selector — every order is placed as `isCompanyLevel: true`. Needs `useEmployeesLookup({ companyId })` + a "company-level" toggle.
2. Location selector is present but not persisted — backend derives `locationId` from the chosen employee (or falls back to `company.headquarterLocationId`), and `CreateOrderDto` does not accept `locationId`. Remove the picker once the employee selector lands.

---

## 10. ✅ RESOLVED — Menu template `maxOrders` per item

Backend `TemplateItemDto` now accepts optional `maxOrders?: number` (integer ≥ 1), and `MenuTemplateDetail` returns it as `maxOrders: number | null` per item. The frontend now round-trips the value: `maxOrders: 0` in the domain represents "no cap" and is sent as `undefined` on save; any positive integer is sent as-is. When the template is applied via `applyCore`, the backend copies `maxOrders` onto `MenuAssignment`.

---

## 11. Menu template: singleton assumption

The frontend treats the weekly template as a singleton (one template per catering). Backend supports arbitrary templates per catering with pagination + per-template `isActive`. Current shim uses the first template returned by `listTemplates({ limit: 20 })`. Because backend validation requires `items.length >= 1` on create, the frontend no longer auto-creates an empty "Weekly Template" on first visit — it renders an empty draft and only POSTs when the user saves with at least one item. Save and Apply buttons are gated accordingly.

If multi-template support is intended product-wise, the frontend needs a list/select flow (template picker on `MenuTemplatesPage` + "apply" per template).

---

## 12. Invoice report: missing fields

`InvoiceReportPage` expects `serviceCharge`, `tax`, `grandTotal` beyond line subtotal. The backend's `monthly-by-company` report only provides `totalPrice` (subtotal). Current shim sets `serviceCharge: 0`, `tax: 0`, `grandTotal = subtotal`.

If invoice-style reports are a real feature, the backend needs a dedicated invoice endpoint (or extra fields in `monthly-by-company`) that returns tax/service-charge policy + invoice number.

---

## 13. Dashboard: no revenue-per-company

`GET /cater-admin/dashboard` returns `ordersPerCompany: [{ companyId, companyName, orderCount }]` but no revenue per company. The frontend dashboard has a revenue column that currently shows `0` for every row.

Either add `revenue` to each `ordersPerCompany` row in the backend, or remove the "Revenue" column from the dashboard's "Orders by Company" table.

---

## 14. Delivery status frontend mapping

Backend `DeliveryStatus` is `'idle' | 'on_the_way' | 'arrived' | 'delivered'` (4 values). Frontend originally used `'ordering_open' | 'on_the_way' | 'delivered'` (3 values). I've updated the frontend type and UI labels to match:

- `idle` → "Ordering Open" (green)
- `on_the_way` → "On the Way" (amber)
- `arrived` → "Arrived" (indigo)
- `delivered` → "Delivered" (blue)

No backend change needed — just noting the translation.

---

## 15. `NotDelivered.bulk-action` payload shape

I'm assuming `POST /cater-admin/not-delivered-requests/bulk-action` takes `{ ids: string[], action: 'approve' | 'reject', responseNote?: string }`. Please confirm key names (especially `ids` vs `requestIds`, and whether `responseNote` is accepted for bulk).
