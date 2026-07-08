# NPWD vs Packaging — user account data comparison

_A side-by-side and field-by-field view of how NPWD (legacy) and the new Packaging EPR service model user account data, to inform alignment, migration and reuse decisions._

## Background

NPWD and the Packaging EPR service both hold user account data — logins, the person, the linked organisation, and roles — but model it differently. NPWD is the legacy system the new Packaging service is meant to replace/align with. Before deciding on alignment, migration or reuse, we need a clear view of how the two compare, down to the field level.

## Goal

Map and compare user account data across NPWD and Packaging over four areas — accounts/logins, the organisation a user belongs to, contact details, and roles/permissions — plus a field-by-field mapping, identifying what is **Common**, **Shared** or **Unique**.

## Classification

Following the schema-relationships taxonomy:

- **Common** — present in both models with the same meaning/shape.
- **Shared** — present in both but modelled differently (name, level or structure) — a partial match.
- **Unique** — present in only one model.

## What each service is

- **NPWD** — legacy .NET (ASP.NET WebForms/VB.NET + SQL Server; a newer OData Web API). Identity is split across an external `aspnetdb` membership DB (credentials, Forms Auth), `Common.Contact` (profile/person) and `Common.UserRole` (roles). No Defra ID.
- **Packaging** — the new EPR service (.NET). Federated Defra ID / Azure B2C; the runtime identity is the `EPR.Common.Authorization` `UserData` claim (v1.0.23), which collapses the person into the user. The account-creation microservice has a separate `PersonModel`/`Connection` write-model.

## 1. Accounts, logins & identity

| Aspect | NPWD | Packaging | Class |
|---|---|---|---|
| Authentication mechanism | Forms Auth against a separate `aspnetdb`; OData API uses Entra/CIAM JWT | Defra ID / Azure B2C (OIDC) | Shared |
| User identifier | GUID (`Common.Contact.ContactId`); one user split across 3 stores | GUID (`UserData.Id` from B2C ObjectId); one JSON claim | Common |
| Account lifecycle | `Common.Contact.UserStatusId` + `Common.LoginRequest` approval | `UserData.EnrolmentStatus` | Shared |
| Secondary authentication | `Common.Contact.AuthorisationPIN` (submissions PIN-signed) | — | Unique |

## 2. The person record

| Aspect | NPWD | Packaging | Class |
|---|---|---|---|
| Person separate from login | No — `Common.Contact` is both | No — `UserData` is both (facade keeps a separate `PersonModel`) | Common |
| Person fields | `FirstName, LastName, EMail, Position` | `FirstName, LastName, Email, JobTitle, Telephone` | Common |
| Telephone on the person | No — phone lives on the Org/Address | Yes — `UserData.Telephone` | Shared |

## 3. Organisation & registrant linkage

| Aspect | NPWD | Packaging | Class |
|---|---|---|---|
| Organisation entity | `Common.Org`, typed by `EntityTypeId`, self-referential `ParentOrgId` hierarchy | `Organisation` (`OrganisationType`/`OrganisationRole`) | Common |
| User → organisation cardinality | One primary org (`Common.Contact.OrgId`); multi-org via role scoping | Many — `UserData.Organisations` list | Shared |
| Organisation hierarchy | Self-referential `ParentOrgId`/`AreaOrgId` | — | Unique |
| Organisation-type discriminator | `EntityTypeId` (Producer/Scheme/Reprocessor/Agency) | `OrganisationType`/`OrganisationRole` | Common |

## 4. Roles & permissions

| Aspect | NPWD | Packaging | Class |
|---|---|---|---|
| Role assignment | `Common.UserRole` scoped M:N + inline `Common.Contact.UserRoleId` | `UserData.ServiceRole`/`ServiceRoleId` scalar (per active org) | Shared |
| Role vocabulary | `Common.RoleType` + hardcoded strings in `UserRoleConstants.vb` | `ServiceRoles` constants + two `RoleInOrganisation` vocabularies | Shared |
| Permission model | No permission table — code-driven `AccessControl` | No permission table — role-gated policy handlers | Common |
| Roles spread across >1 place | Yes — `UserRole` + `Contact.UserRoleId` + `RoleType` + code constants | Yes — top-level scalars + per-org list + two vocabularies | Common |

## 5. Registration & domain identifiers

| Aspect | NPWD | Packaging | Class |
|---|---|---|---|
| Organisation number | `Common.Org.OrgCode` (NPWDCode, e.g. `NPWD123456`) | `Organisation.OrganisationNumber` | Common |
| Producer registration number | `Batteries.ProducerRegistration.RegistrationNo` (the **BPRN**) | `RegistrationReferenceNumber` (the "producer registration number") | Common |
| Registration record (per period) | `Batteries.ProducerRegistration`, unique per (`ProducerOrgId`, `CompliancePeriodId`) | `RegistrationApplicationDetails`, keyed by org + scheme + period + journey | Shared |
| Compliance period | `Common.CompliancePeriod` (first-class dated entity, coded, Year/Quarter) | `SubmissionPeriod` string ("January to December {year}") | Shared |
| Scheme approval number | `Batteries.SchemeApproval.ApprovalNo` | — (scheme identified by `ComplianceSchemeId` + name) | Unique |

## Field-by-field mapping

### Accounts, logins & credentials

| Concept | NPWD field | Packaging field | Class |
|---|---|---|---|
| User identifier | `Common.Contact.ContactId` (GUID) | `UserData.Id` (Guid?) | Common |
| Login username | `Common.Contact.UserName` | — (B2C ObjectId + Email) | Unique |
| Email | `Common.Contact.EMail` | `UserData.Email` | Common |
| Credential / password hash | `aspnetdb aspnet_Membership`; `Contact.InitialPwd` | — (Defra ID / B2C) | Unique |
| Secondary auth PIN | `Common.Contact.AuthorisationPIN` | — | Unique |
| Account status | `Common.Contact.UserStatusId` | `UserData.EnrolmentStatus` | Shared |
| Terms accepted | `Common.Contact.AgreedTCDate` | — | Unique |
| Onboarding / invite | `Common.LoginRequest` (pre-registration) | `UserData.InviteToken` | Shared |
| Change request pending | — | `UserData.IsChangeRequestPending` | Unique |
| Active service context | — | `UserData.Service` | Unique |

### Person

| Concept | NPWD field | Packaging field | Class |
|---|---|---|---|
| First name | `Common.Contact.FirstName` | `UserData.FirstName` | Common |
| Last name | `Common.Contact.LastName` | `UserData.LastName` | Common |
| Job title / position | `Common.Contact.Position` | `UserData.JobTitle` (+ `Organisation.JobTitle`) | Common |
| Telephone | — on the person (Org/Address) | `UserData.Telephone` | Shared |

### Organisation

| Concept | NPWD field | Packaging field | Class |
|---|---|---|---|
| Organisation id | `Common.Org.OrgId` (GUID) | `Organisation.Id` (Guid?) | Common |
| Organisation name | `Common.Org.OrgName` | `Organisation.Name` | Common |
| Trading / alternative name | `Common.Org.AlternativeOrgName` | `Organisation.TradingName` | Common |
| Organisation number / code | `Common.Org.OrgCode` | `Organisation.OrganisationNumber` | Common |
| Companies House number | `Common.Org.CompanyRegNo` | `Organisation.CompaniesHouseNumber` | Common |
| Company registration country | `Common.Org.CompanyRegCountry` | — | Unique |
| Organisation type | `Common.Org.EntityTypeId` | `Organisation.OrganisationType` | Common |
| Organisation role | — (role via `UserRole`/`RoleType`) | `Organisation.OrganisationRole` | Shared |
| Parent / area organisation | `Common.Org.ParentOrgId`, `AreaOrgId` | — | Unique |
| Regulator / agency link | `Common.Org.AgencyId`; `Contact.AgencyOrgId` | — (via `ServiceRole`) | Unique |
| Organisation status | `Common.Org.OrgStatusId` | — | Unique |
| Nation / country | `Common.Org.CountryId`, `TerritoryId` | `Organisation.NationId`, `Country` | Common |
| Web address | `Common.Org.WebAddress` | — | Unique |
| User → organisation link | `Common.Contact.OrgId` (single FK) | `UserData.Organisations[]` (list) | Shared |

### Address & organisation contact

| Concept | NPWD field | Packaging field | Class |
|---|---|---|---|
| Address lines | `Common.Org`/`Address.AddressLine1-4` (flat) | `Organisation.SubBuildingName`/`BuildingName`/`BuildingNumber`/`Street` (PAF) | Shared |
| Town | `Common.Org`/`Address.Town` | `Organisation.Town` | Common |
| County | `Common.Org`/`Address.County` | `Organisation.County` | Common |
| Postcode | `Common.Org`/`Address.Postcode` | `Organisation.Postcode` | Common |
| Locality / dependent locality | — | `Organisation.Locality`, `DependentLocality` | Unique |
| Multiple typed addresses | `Common.Address` (typed by `EntityTypeId`) | — (one embedded address) | Unique |
| Org-embedded contact person | `Common.Org.ContactFirstName`/`ContactLastName`/`ContactTitle` | — (person on `UserData`) | Shared |
| Organisation phone / fax | `Common.Org.TelNo1`/`TelNo2`/`FaxNo1`/`FaxNo2` | — (Telephone on user only) | Shared |
| Organisation email | `Common.Org.EMail` | — (email on user) | Shared |
| Submission contact snapshot | `Common.SubmissionContact` | — | Unique |

### Roles & permissions

| Concept | NPWD field | Packaging field | Class |
|---|---|---|---|
| Primary role on the user | `Common.Contact.UserRoleId` (inline) | `UserData.ServiceRole`/`ServiceRoleId` | Shared |
| Role assignment (scoped) | `Common.UserRole` (UserId × RoleTypeId × EntityId/OrgId) | — (per active org context) | Shared |
| Role vocabulary | `Common.RoleType` + `UserRoleConstants.vb` strings | `ServiceRoles` constants | Shared |
| Numeric role id | `Common.RoleType.RoleTypeId` (GUID) | `UserData.ServiceRoleId` (int) | Shared |
| Role scope (entity / org) | `Common.UserRole.EntityTypeId`/`EntityId`/`OrgId` | — (single active org) | Shared |
| Role grouping / order | `Common.RoleType.RoleGroup`/`RoleGroupingCode`/`RoleOrder` | — | Unique |
| Role in organisation (legal position) | — | `UserData.RoleInOrganisation` (Admin/Employee) + facade Director/Company Secretary/Partner/Member | Unique |

### Registration & domain identifiers

| Concept | NPWD field | Packaging field | Class |
|---|---|---|---|
| Organisation number | `Common.Org.OrgCode` (NPWDCode, e.g. `NPWD123456`) | `Organisation.OrganisationNumber` | Common |
| Producer registration number | `Batteries.ProducerRegistration.RegistrationNo` (called the **BPRN** in NPWD code/docs) | `RegistrationReferenceNumber` (backend-issued on grant) | Common |
| Application / payment reference | — | `ApplicationReferenceNumber` (`PEPR{org}{yy}P{period}{size}`, via `ReferenceNumberBuilder`) | Unique |
| Registration record id | `Batteries.ProducerRegistration.ProducerRegistrationId` (GUID) | `RegistrationApplicationDetails.SubmissionId` (Guid) | Shared |
| Registration key (per producer per period) | `ProducerOrgId` + `CompliancePeriodId` (unique index) | `OrganisationId` + `ComplianceSchemeId?` + `SubmissionPeriod` + `RegistrationJourney` | Shared |
| Compliance / submission period | `Common.CompliancePeriod` (`CompliancePeriodId` GUID / `CompliancePeriodCode`) | `SubmissionPeriod.DataPeriod` (string) / `Year` (string) | Shared |
| Registration status | `Batteries.ProducerRegistration.StatusId` | `RegistrationApplicationDetails.ApplicationStatus` | Shared |
| Compliance scheme id | `Batteries.ProducerRegistration.SchemeOrgId` (`Common.Org`) | `ComplianceSchemeId` (Guid) / `ComplianceSchemeDto` | Common |
| Scheme membership reference | `ProducerRegistration.SchemeRefNumber` / `SchemeMembers.SchemeRefNumber` | — (membership via `ComplianceSchemeMemberDto` org relationships) | Shared |
| Scheme approval number | `Batteries.SchemeApproval.ApprovalNo` | — | Unique |
| Reprocessor / exporter approval number | `Batteries.ReprocessorApproval.ApprovalNo` (ABTO/ABE) | — (Re-Ex is a separate stream) | Unique |
| Registration classification | `IsPortable` / `IsIndustrial` / `IsAutomotive` (battery category) | `OrganisationSize` (Large/Small) + `RegistrationJourney` | Shared |
| Number allocation | `Metadata.EntitySequence` + `Common.Agency.RegistrationNoPrefix`/`Next` (agency-banded) | `ReferenceNumberBuilder` (code) + backend-issued `RegistrationReferenceNumber` | Shared |

## Shared / service-specific / inconsistencies

**Shared foundation**
- A central Organisation entity typed by kind (NPWD `EntityTypeId` ~ Packaging `OrganisationType`), covering Producer and Compliance Scheme.
- GUID user identity on both sides.
- Person collapsed into the account record on both (`Common.Contact` / `UserData`).
- Roles imply permissions — neither has a permission table.
- Core party fields align: name, email, company registration number, org name/number, town, postcode.
- Both issue a producer registration number on approval (NPWD `RegistrationNo` / "BPRN" ~ Packaging `RegistrationReferenceNumber`) plus an org-level number (NPWDCode ~ OrganisationNumber).

**Service-specific**
- _NPWD_: split identity (aspnetdb credentials + `Common.Contact` + `UserRole`); Forms Auth, no OIDC/MFA; `AuthorisationPIN`; `LoginRequest` pre-registration; self-referential Org hierarchy; typed `Common.Address` rows; hardcoded role string vocabulary; a second OData/Entra auth stack.
- _Packaging_: federated Defra ID/B2C; identity as one JSON `UserData` claim; user↔many organisations; `InviteToken`/`IsChangeRequestPending`/`Service`; structured PAF address; policy-handler authorisation; a second (facade) person and role-in-organisation vocabulary.

**Inconsistencies, duplication & gaps**
- **Auth** — NPWD bespoke Forms Auth + separate `aspnetdb` (no MFA/OIDC) vs Packaging federated Defra ID — the headline modernisation gap.
- **Cardinality** — NPWD one-primary-org (`Contact.OrgId`) vs Packaging user↔many orgs.
- **Contact level** — NPWD duplicates contact/address across ~4 levels (`Org`, `Address`, `SubmissionContact`, `Contact`) vs Packaging holding telephone on the user + one address per org.
- **Roles** — duplicated on both sides but differently: NPWD across `UserRole`/`Contact.UserRoleId`/`RoleType`/code; Packaging across `UserData` scalars, per-org list, and two role/enrolment vocabularies.
- **Identity split** — NPWD spreads one user across 3 stores; Packaging carries it as a single `UserData` claim.
- **Compliance period** — a first-class dated entity in NPWD (`Common.CompliancePeriod`) but a human-readable string in Packaging (`SubmissionPeriod`).

## Considerations for alignment, migration or reuse

- **Replace NPWD's bespoke Forms Auth/`aspnetdb` with Defra ID (OIDC)** — the analysis's own `REWRITE-CASE.md` recommendation; MFA/federation become inherited from the IdP.
- **Stop splitting one user across three stores** — a single identity record instead of aspnetdb ↔ `Common.Contact` stitched by `UserName`.
- **Consolidate contact details** — remove the ~4-way duplication; one authoritative address set per org, contact on the person.
- **Decide the cardinality model** — NPWD's one-primary-org vs Packaging's user↔many; the new model should carry per-org enrolment rather than a single active-org scalar.
- **Unify the role vocabulary** — one source of truth; both systems currently spread roles across multiple places and vocabularies.

## Caveats

- Packaging's runtime identity model is `EPR.Common.Authorization` v1.0.23 (`UserData`/`Organisation`); the account-creation microservice adds a separate `PersonModel`/`Connection` write-model and extra role/enrolment vocabularies — a Packaging-internal split.
- NPWD's real credentials live in an external `aspnetdb` membership DB (`aspnet_Membership`) not in the repo — those fields come from provider code and analysis, not a schema file. NPWD also runs a second auth stack (OData/Entra JWT); this compares the legacy account model that holds the bulk of identity data.
- NPWD's `Common.*` account schema is shared across Packaging/WEEE/Batteries within NPWD; Packaging here is the new EPR service.
- **BPRN** is not a literal column — it is `Batteries.ProducerRegistration.RegistrationNo` (batteries regime), which NPWD's code/docs call the BPRN; its pEPR analogue is `RegistrationReferenceNumber`. The batteries scheme/reprocessor approval numbers shown for NPWD are batteries-regime; the producer-facing pEPR service has no equivalent reprocessor number (Re-Ex is separate).
- Classification follows the reference schema-relationships tool: Common = in both, Shared = in both but modelled differently, Unique = in one only.
