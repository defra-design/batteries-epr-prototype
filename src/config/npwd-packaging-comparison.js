export const npwdPackagingComparison = {
  title: 'NPWD vs Packaging account model',
  heading: 'NPWD vs Packaging — user account data',
  intro:
    'How NPWD (the legacy National Packaging Waste Database) and the new Packaging EPR service model user account data, compared side by side and field by field. Each row is classified Common, Shared or Unique, following the schema-relationships taxonomy.',
  services: {
    npwd: 'Legacy .NET (WebForms/VB.NET). Identity split across an external aspnetdb membership DB, Common.Contact and Common.UserRole; Forms Authentication, no Defra ID.',
    packaging:
      'New EPR service (.NET). Federated Defra ID / Azure B2C; the runtime identity is the EPR.Common.Authorization UserData claim (person collapsed into the user).'
  },
  legend:
    'Common = present in both models with the same meaning. Shared = present in both but modelled differently (name, level or structure). Unique = present in only one model.',
  areas: [
    {
      id: 'identity',
      title: 'Accounts, logins & identity',
      rows: [
        {
          aspect: 'Authentication mechanism',
          npwd: 'Forms Authentication against a separate aspnetdb membership DB (legacy); the OData API uses Entra/CIAM JWT',
          packaging: 'Defra ID / Azure AD B2C (OIDC)',
          classification: 'shared'
        },
        {
          aspect: 'User identifier',
          npwd: 'GUID (Common.Contact.ContactId); one user split across 3 stores',
          packaging:
            'GUID (UserData.Id, from the B2C ObjectId); one JSON UserData claim',
          classification: 'common'
        },
        {
          aspect: 'Account lifecycle',
          npwd: 'Common.Contact.UserStatusId + Common.LoginRequest approval',
          packaging: 'UserData.EnrolmentStatus',
          classification: 'shared'
        },
        {
          aspect: 'Secondary authentication',
          npwd: 'Common.Contact.AuthorisationPIN (submissions are PIN-signed)',
          packaging: '—',
          classification: 'unique'
        }
      ]
    },
    {
      id: 'person',
      title: 'The person record',
      rows: [
        {
          aspect: 'Person separate from login',
          npwd: 'No — Common.Contact is both the login and the person',
          packaging:
            'No — UserData is both (the account-creation facade keeps a separate PersonModel)',
          classification: 'common'
        },
        {
          aspect: 'Person fields',
          npwd: 'FirstName, LastName, EMail, Position',
          packaging: 'FirstName, LastName, Email, JobTitle, Telephone',
          classification: 'common'
        },
        {
          aspect: 'Telephone on the person',
          npwd: 'No — phone lives on the Org / Address',
          packaging: 'Yes — UserData.Telephone',
          classification: 'shared'
        }
      ]
    },
    {
      id: 'organisation',
      title: 'Organisation & registrant linkage',
      rows: [
        {
          aspect: 'Organisation entity',
          npwd: 'Common.Org, typed by EntityTypeId, self-referential ParentOrgId hierarchy',
          packaging: 'Organisation (OrganisationType / OrganisationRole)',
          classification: 'common'
        },
        {
          aspect: 'User to organisation cardinality',
          npwd: 'One primary org (Common.Contact.OrgId); multi-org only via role scoping',
          packaging: 'Many — UserData.Organisations is a list',
          classification: 'shared'
        },
        {
          aspect: 'Organisation hierarchy',
          npwd: 'Self-referential ParentOrgId / AreaOrgId',
          packaging: '—',
          classification: 'unique'
        },
        {
          aspect: 'Organisation-type discriminator',
          npwd: 'EntityTypeId (Producer / Scheme / Reprocessor / Agency)',
          packaging:
            'OrganisationType / OrganisationRole (Producer / Compliance Scheme)',
          classification: 'common'
        }
      ]
    },
    {
      id: 'roles',
      title: 'Roles & permissions',
      rows: [
        {
          aspect: 'Role assignment',
          npwd: 'Common.UserRole scoped many-to-many + inline Common.Contact.UserRoleId',
          packaging:
            'UserData.ServiceRole / ServiceRoleId scalar (per active org, not per-org)',
          classification: 'shared'
        },
        {
          aspect: 'Role vocabulary',
          npwd: 'Common.RoleType + hardcoded strings in UserRoleConstants.vb',
          packaging:
            'ServiceRoles constants + two RoleInOrganisation vocabularies',
          classification: 'shared'
        },
        {
          aspect: 'Permission model',
          npwd: 'No permission table — code-driven AccessControl per page',
          packaging: 'No permission table — role-gated policy handlers',
          classification: 'common'
        },
        {
          aspect: 'Roles spread across more than one place',
          npwd: 'Yes — UserRole + Contact.UserRoleId + RoleType + code constants',
          packaging:
            'Yes — top-level scalars + per-org list + two vocabularies',
          classification: 'common'
        }
      ]
    },
    {
      id: 'registration',
      title: 'Registration & domain identifiers',
      rows: [
        {
          aspect: 'Organisation number',
          npwd: 'Common.Org.OrgCode (NPWDCode, e.g. NPWD123456)',
          packaging: 'Organisation.OrganisationNumber',
          classification: 'common'
        },
        {
          aspect: 'Producer registration number',
          npwd: 'Batteries.ProducerRegistration.RegistrationNo (the BPRN)',
          packaging:
            'RegistrationReferenceNumber (the "producer registration number")',
          classification: 'common'
        },
        {
          aspect: 'Registration record (per period)',
          npwd: 'Batteries.ProducerRegistration, unique per (ProducerOrgId, CompliancePeriodId)',
          packaging:
            'RegistrationApplicationDetails, keyed by org + scheme + period + journey',
          classification: 'shared'
        },
        {
          aspect: 'Compliance period',
          npwd: 'Common.CompliancePeriod (first-class dated entity, coded, Year/Quarter)',
          packaging: 'SubmissionPeriod string ("January to December {year}")',
          classification: 'shared'
        },
        {
          aspect: 'Scheme approval number',
          npwd: 'Batteries.SchemeApproval.ApprovalNo',
          packaging: '— (scheme identified by ComplianceSchemeId + name)',
          classification: 'unique'
        }
      ]
    }
  ],
  fieldGroups: [
    {
      id: 'accounts',
      title: 'Accounts, logins & credentials',
      rows: [
        {
          concept: 'User identifier',
          npwd: 'Common.Contact.ContactId (GUID)',
          packaging: 'UserData.Id (Guid?)',
          classification: 'common'
        },
        {
          concept: 'Login username',
          npwd: 'Common.Contact.UserName (unique; joins to aspnetdb)',
          packaging: '— (identity via B2C ObjectId + Email)',
          classification: 'unique'
        },
        {
          concept: 'Email',
          npwd: 'Common.Contact.EMail',
          packaging: 'UserData.Email',
          classification: 'common'
        },
        {
          concept: 'Credential / password hash',
          npwd: 'aspnetdb aspnet_Membership (external); Common.Contact.InitialPwd, ChangedPwdDate',
          packaging: '— (delegated to Defra ID / B2C)',
          classification: 'unique'
        },
        {
          concept: 'Secondary auth PIN',
          npwd: 'Common.Contact.AuthorisationPIN, ChangedPINDate',
          packaging: '—',
          classification: 'unique'
        },
        {
          concept: 'Account status',
          npwd: 'Common.Contact.UserStatusId',
          packaging: 'UserData.EnrolmentStatus',
          classification: 'shared'
        },
        {
          concept: 'Terms accepted',
          npwd: 'Common.Contact.AgreedTCDate',
          packaging: '—',
          classification: 'unique'
        },
        {
          concept: 'Onboarding / invite',
          npwd: 'Common.LoginRequest (pre-registration application)',
          packaging: 'UserData.InviteToken',
          classification: 'shared'
        },
        {
          concept: 'Change request pending',
          npwd: '—',
          packaging: 'UserData.IsChangeRequestPending',
          classification: 'unique'
        },
        {
          concept: 'Active service context',
          npwd: '—',
          packaging: 'UserData.Service',
          classification: 'unique'
        }
      ]
    },
    {
      id: 'person',
      title: 'Person',
      rows: [
        {
          concept: 'First name',
          npwd: 'Common.Contact.FirstName',
          packaging: 'UserData.FirstName',
          classification: 'common'
        },
        {
          concept: 'Last name',
          npwd: 'Common.Contact.LastName',
          packaging: 'UserData.LastName',
          classification: 'common'
        },
        {
          concept: 'Job title / position',
          npwd: 'Common.Contact.Position',
          packaging: 'UserData.JobTitle (+ Organisation.JobTitle)',
          classification: 'common'
        },
        {
          concept: 'Telephone',
          npwd: '— on the person (lives on Org / Address)',
          packaging: 'UserData.Telephone',
          classification: 'shared'
        }
      ]
    },
    {
      id: 'organisation',
      title: 'Organisation',
      rows: [
        {
          concept: 'Organisation id',
          npwd: 'Common.Org.OrgId (GUID)',
          packaging: 'Organisation.Id (Guid?)',
          classification: 'common'
        },
        {
          concept: 'Organisation name',
          npwd: 'Common.Org.OrgName',
          packaging: 'Organisation.Name',
          classification: 'common'
        },
        {
          concept: 'Trading / alternative name',
          npwd: 'Common.Org.AlternativeOrgName',
          packaging: 'Organisation.TradingName',
          classification: 'common'
        },
        {
          concept: 'Organisation number / code',
          npwd: 'Common.Org.OrgCode',
          packaging: 'Organisation.OrganisationNumber',
          classification: 'common'
        },
        {
          concept: 'Companies House number',
          npwd: 'Common.Org.CompanyRegNo',
          packaging: 'Organisation.CompaniesHouseNumber',
          classification: 'common'
        },
        {
          concept: 'Company registration country',
          npwd: 'Common.Org.CompanyRegCountry',
          packaging: '—',
          classification: 'unique'
        },
        {
          concept: 'Organisation type',
          npwd: 'Common.Org.EntityTypeId',
          packaging: 'Organisation.OrganisationType',
          classification: 'common'
        },
        {
          concept: 'Organisation role',
          npwd: '— (role via UserRole / RoleType)',
          packaging: 'Organisation.OrganisationRole',
          classification: 'shared'
        },
        {
          concept: 'Parent / area organisation',
          npwd: 'Common.Org.ParentOrgId, AreaOrgId',
          packaging: '—',
          classification: 'unique'
        },
        {
          concept: 'Regulator / agency link',
          npwd: 'Common.Org.AgencyId; Common.Contact.AgencyOrgId',
          packaging: '— (regulator via ServiceRole)',
          classification: 'unique'
        },
        {
          concept: 'Organisation status',
          npwd: 'Common.Org.OrgStatusId',
          packaging: '—',
          classification: 'unique'
        },
        {
          concept: 'Nation / country',
          npwd: 'Common.Org.CountryId, TerritoryId',
          packaging: 'Organisation.NationId, Country',
          classification: 'common'
        },
        {
          concept: 'Web address',
          npwd: 'Common.Org.WebAddress',
          packaging: '—',
          classification: 'unique'
        },
        {
          concept: 'User to organisation link',
          npwd: 'Common.Contact.OrgId (single FK)',
          packaging: 'UserData.Organisations[] (list)',
          classification: 'shared'
        }
      ]
    },
    {
      id: 'address',
      title: 'Address & organisation contact',
      rows: [
        {
          concept: 'Address lines',
          npwd: 'Common.Org / Common.Address AddressLine1-4 (flat)',
          packaging:
            'Organisation.SubBuildingName / BuildingName / BuildingNumber / Street (PAF)',
          classification: 'shared'
        },
        {
          concept: 'Town',
          npwd: 'Common.Org / Address.Town',
          packaging: 'Organisation.Town',
          classification: 'common'
        },
        {
          concept: 'County',
          npwd: 'Common.Org / Address.County',
          packaging: 'Organisation.County',
          classification: 'common'
        },
        {
          concept: 'Postcode',
          npwd: 'Common.Org / Address.Postcode',
          packaging: 'Organisation.Postcode',
          classification: 'common'
        },
        {
          concept: 'Locality / dependent locality',
          npwd: '—',
          packaging: 'Organisation.Locality, DependentLocality',
          classification: 'unique'
        },
        {
          concept: 'Multiple typed addresses',
          npwd: 'Common.Address (AddressId, EntityTypeId — registered / correspondence / etc.)',
          packaging: '— (one address embedded on Organisation)',
          classification: 'unique'
        },
        {
          concept: 'Organisation-embedded contact person',
          npwd: 'Common.Org.ContactFirstName / ContactLastName / ContactTitle',
          packaging: '— (person on UserData)',
          classification: 'shared'
        },
        {
          concept: 'Organisation phone / fax',
          npwd: 'Common.Org.TelNo1 / TelNo2 / FaxNo1 / FaxNo2',
          packaging: '— (Telephone on the user only)',
          classification: 'shared'
        },
        {
          concept: 'Organisation email',
          npwd: 'Common.Org.EMail',
          packaging: '— (email on the user)',
          classification: 'shared'
        },
        {
          concept: 'Submission contact snapshot',
          npwd: 'Common.SubmissionContact (per-submission copy)',
          packaging: '—',
          classification: 'unique'
        }
      ]
    },
    {
      id: 'roles',
      title: 'Roles & permissions',
      rows: [
        {
          concept: 'Primary role on the user',
          npwd: 'Common.Contact.UserRoleId (inline)',
          packaging: 'UserData.ServiceRole / ServiceRoleId',
          classification: 'shared'
        },
        {
          concept: 'Role assignment (scoped)',
          npwd: 'Common.UserRole (UserId x RoleTypeId x EntityId / OrgId)',
          packaging: '— (role held per active org context)',
          classification: 'shared'
        },
        {
          concept: 'Role vocabulary',
          npwd: 'Common.RoleType.RoleCode / RoleDesc + UserRoleConstants.vb strings',
          packaging: 'ServiceRoles constants',
          classification: 'shared'
        },
        {
          concept: 'Numeric role id',
          npwd: 'Common.RoleType.RoleTypeId (GUID)',
          packaging: 'UserData.ServiceRoleId (int)',
          classification: 'shared'
        },
        {
          concept: 'Role scope (entity / org)',
          npwd: 'Common.UserRole.EntityTypeId / EntityId / OrgId',
          packaging: '— (single active org)',
          classification: 'shared'
        },
        {
          concept: 'Role grouping / order',
          npwd: 'Common.RoleType.RoleGroup / RoleGroupingCode / RoleOrder',
          packaging: '—',
          classification: 'unique'
        },
        {
          concept: 'Role in organisation (legal position)',
          npwd: '—',
          packaging:
            'UserData.RoleInOrganisation (Admin / Employee) + facade Director / Company Secretary / Partner / Member',
          classification: 'unique'
        }
      ]
    },
    {
      id: 'registration',
      title: 'Registration & domain identifiers',
      rows: [
        {
          concept: 'Organisation number',
          npwd: 'Common.Org.OrgCode (NPWDCode, e.g. NPWD123456)',
          packaging: 'Organisation.OrganisationNumber',
          classification: 'common'
        },
        {
          concept: 'Producer registration number',
          npwd: 'Batteries.ProducerRegistration.RegistrationNo (called the BPRN in NPWD code/docs)',
          packaging: 'RegistrationReferenceNumber (backend-issued on grant)',
          classification: 'common'
        },
        {
          concept: 'Application / payment reference',
          npwd: '—',
          packaging:
            'ApplicationReferenceNumber (PEPR{org}{yy}P{period}{size}, built by ReferenceNumberBuilder)',
          classification: 'unique'
        },
        {
          concept: 'Registration record id',
          npwd: 'Batteries.ProducerRegistration.ProducerRegistrationId (GUID)',
          packaging: 'RegistrationApplicationDetails.SubmissionId (Guid)',
          classification: 'shared'
        },
        {
          concept: 'Registration key (per producer per period)',
          npwd: 'ProducerOrgId + CompliancePeriodId (unique index)',
          packaging:
            'OrganisationId + ComplianceSchemeId? + SubmissionPeriod + RegistrationJourney',
          classification: 'shared'
        },
        {
          concept: 'Compliance / submission period',
          npwd: 'Common.CompliancePeriod (CompliancePeriodId GUID / CompliancePeriodCode)',
          packaging: 'SubmissionPeriod.DataPeriod (string) / Year (string)',
          classification: 'shared'
        },
        {
          concept: 'Registration status',
          npwd: 'Batteries.ProducerRegistration.StatusId',
          packaging: 'RegistrationApplicationDetails.ApplicationStatus',
          classification: 'shared'
        },
        {
          concept: 'Compliance scheme id',
          npwd: 'Batteries.ProducerRegistration.SchemeOrgId (Common.Org)',
          packaging: 'ComplianceSchemeId (Guid) / ComplianceSchemeDto',
          classification: 'common'
        },
        {
          concept: 'Scheme membership reference',
          npwd: 'Batteries.ProducerRegistration.SchemeRefNumber / SchemeMembers.SchemeRefNumber',
          packaging:
            '— (membership via ComplianceSchemeMemberDto org relationships)',
          classification: 'shared'
        },
        {
          concept: 'Scheme approval number',
          npwd: 'Batteries.SchemeApproval.ApprovalNo',
          packaging: '—',
          classification: 'unique'
        },
        {
          concept: 'Reprocessor / exporter approval number',
          npwd: 'Batteries.ReprocessorApproval.ApprovalNo (ABTO / ABE)',
          packaging: '— (Re-Ex is a separate stream)',
          classification: 'unique'
        },
        {
          concept: 'Registration classification',
          npwd: 'IsPortable / IsIndustrial / IsAutomotive (battery category)',
          packaging: 'OrganisationSize (Large / Small) + RegistrationJourney',
          classification: 'shared'
        },
        {
          concept: 'Number allocation',
          npwd: 'Metadata.EntitySequence + Common.Agency.RegistrationNoPrefix / Next (agency-banded)',
          packaging:
            'ReferenceNumberBuilder (code) + backend-issued RegistrationReferenceNumber',
          classification: 'shared'
        }
      ]
    }
  ],
  summary: {
    shared: [
      'A central Organisation entity typed by kind (NPWD EntityTypeId ~ Packaging OrganisationType), covering Producer and Compliance Scheme',
      'GUID user identity on both sides',
      'Person collapsed into the account record on both (Common.Contact / UserData)',
      'Roles imply permissions — neither has a permission table',
      'Core party fields align: name, email, company registration number, org name/number, town, postcode',
      'Both issue a producer registration number on approval (NPWD RegistrationNo / "BPRN" ~ Packaging RegistrationReferenceNumber) plus an org-level number (NPWDCode ~ OrganisationNumber)'
    ],
    serviceSpecific: [
      'NPWD: split identity (aspnetdb credentials + Common.Contact + UserRole); Forms Auth, no OIDC/MFA; AuthorisationPIN; LoginRequest pre-registration; self-referential Org hierarchy; typed Common.Address rows; hardcoded role string vocabulary; a second OData/Entra auth stack',
      'Packaging: federated Defra ID / B2C; identity as one JSON UserData claim; user to many organisations; InviteToken / IsChangeRequestPending / Service; structured PAF address; policy-handler authorisation; a second (facade) person and role-in-organisation vocabulary'
    ],
    inconsistencies: [
      'Auth: NPWD bespoke Forms Auth + separate aspnetdb (no MFA/OIDC) vs Packaging federated Defra ID — the headline modernisation gap',
      'Cardinality: NPWD one-primary-org (Contact.OrgId) vs Packaging user to many orgs',
      'Contact level: NPWD duplicates contact/address across ~4 levels (Org, Address, SubmissionContact, Contact) vs Packaging holding telephone on the user + one address per org',
      'Roles duplicated on both sides but differently — NPWD across UserRole / Contact.UserRoleId / RoleType / code; Packaging across UserData scalars, per-org list and two role/enrolment vocabularies',
      'Identity split: NPWD spreads one user across 3 stores; Packaging carries it as a single UserData claim',
      'Compliance period is a first-class dated entity in NPWD (Common.CompliancePeriod) but a human-readable string in Packaging (SubmissionPeriod)'
    ]
  },
  caveats: [
    'Packaging’s runtime identity model is EPR.Common.Authorization v1.0.23 (UserData / Organisation); the account-creation microservice adds a separate PersonModel / Connection write-model and extra role/enrolment vocabularies — a Packaging-internal split.',
    'NPWD’s real credentials live in an external aspnetdb membership DB (aspnet_Membership) not in the repo — those fields come from provider code and analysis, not a schema file. NPWD also runs a second auth stack (OData / Entra JWT); this compares the legacy account model that holds the bulk of identity data.',
    'NPWD’s Common.* account schema is shared across Packaging / WEEE / Batteries within NPWD; Packaging here is the new EPR service.',
    'BPRN is not a literal column — it is Batteries.ProducerRegistration.RegistrationNo (batteries regime); its pEPR analogue is RegistrationReferenceNumber. Batteries reprocessor/scheme approval numbers shown for NPWD are batteries-regime; the pEPR service (producer-facing) has no equivalent reprocessor number (Re-Ex is separate).',
    'Classification follows the reference schema-relationships tool: Common = in both, Shared = in both but modelled differently, Unique = in one only.'
  ]
}

export const classificationTag = {
  common: { text: 'Common', classes: 'govuk-tag--green' },
  shared: { text: 'Shared', classes: 'govuk-tag--blue' },
  unique: { text: 'Unique', classes: 'govuk-tag--grey' }
}
