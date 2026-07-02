const fs = require('fs');
const path = require('path');

const enPath = path.join('/Users/smarthatch/Documents/Backups/MAHALLU CRM/frontend/src/i18n/en.json');
const mlPath = path.join('/Users/smarthatch/Documents/Backups/MAHALLU CRM/frontend/src/i18n/ml.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ml = JSON.parse(fs.readFileSync(mlPath, 'utf8'));

// common additions
en.common.saving = "Saving...";
ml.common.saving = "സേവ് ചെയ്യുന്നു...";

// superAdmin additions
const superAdminEn = {
  ...en.superAdmin,
  editStaffPermissions: "Edit Staff Permissions",
  manageModuleAccessFor: "Manage module access for",
  staffNotFound: "Staff not found",
  staffNotFoundDesc: "The staff member you're looking for doesn't exist or you don't have access.",
  permissionNoteTitle: "Permission Note",
  permissionNoteDesc: "Staff members can only access the modules you enable here. SuperAdmins and PlatformAdmins bypass all permission restrictions.",
  savePermissions: "Save Permissions"
};
en.superAdmin = superAdminEn;

const superAdminMl = {
  ...ml.superAdmin,
  editStaffPermissions: "സ്റ്റാഫ് പെർമിഷനുകൾ എഡിറ്റ് ചെയ്യുക",
  manageModuleAccessFor: "ഇതിനായുള്ള മൊഡ്യൂൾ ആക്സസ് നിർവഹിക്കുക:",
  staffNotFound: "സ്റ്റാഫിനെ കണ്ടെത്താനായില്ല",
  staffNotFoundDesc: "നിങ്ങൾ തിരയുന്ന സ്റ്റാഫിനെ കണ്ടെത്താനായില്ല അല്ലെങ്കിൽ നിങ്ങൾക്ക് ആക്സസ് ഇല്ല.",
  permissionNoteTitle: "പെർമിഷൻ കുറിപ്പ്",
  permissionNoteDesc: "നിങ്ങൾ ഇവിടെ അനുവദിക്കുന്ന മൊഡ്യൂളുകൾ മാത്രമേ സ്റ്റാഫുകൾക്ക് ആക്സസ് ചെയ്യാൻ കഴിയൂ. സൂപ്പർ അഡ്മിനുകൾക്കും പ്ലാറ്റ്ഫോം അഡ്മിനുകൾക്കും ഈ നിയന്ത്രണങ്ങളില്ല.",
  savePermissions: "പെർമിഷനുകൾ സേവ് ചെയ്യുക",
  modulePermissions: "മൊഡ്യൂൾ പെർമിഷനുകൾ",
  backToStaff: "സ്റ്റാഫിലേക്ക് തിരികെ",
  active: "സജീവം",
  inactive: "നിർജ്ജീവം"
};
// en.json already has modulePermissions, backToStaff, etc.
// wait, we need 'active' and 'inactive' in common maybe?
// common.active and common.inactive exist in en.json and ml.json?
// Let's check common
if (!en.common.active) en.common.active = "Active";
if (!en.common.inactive) en.common.inactive = "Inactive";
if (!ml.common.active) ml.common.active = "സജീവം";
if (!ml.common.inactive) ml.common.inactive = "നിർജ്ജീവം";

ml.superAdmin = superAdminMl;

// module descriptions translations
const modDescEn = {
  dashboard: "Manage dashboard and analytics",
  family: "Manage family records and members",
  finance: "Manage finance records and members",
  community: "Manage community welfare programs",
  results: "Manage madrasa exam results",
  settings: "Manage general settings",
  islamicLibrary: "Manage Surah and Dua library"
};
const modDescMl = {
  dashboard: "ഡാഷ്‌ബോർഡും അനലിറ്റിക്‌സും കൈകാര്യം ചെയ്യുക",
  family: "കുടുംബ രേഖകളും അംഗങ്ങളെയും കൈകാര്യം ചെയ്യുക",
  finance: "സാമ്പത്തിക രേഖകളും ഇടപാടുകളും കൈകാര്യം ചെയ്യുക",
  community: "ക്ഷേമ പദ്ധതികളും കമ്മ്യൂണിറ്റി സേവനങ്ങളും കൈകാര്യം ചെയ്യുക",
  results: "മദ്രസ പരീക്ഷാ ഫലങ്ങൾ കൈകാര്യം ചെയ്യുക",
  settings: "പൊതുവായ ക്രമീകരണങ്ങൾ കൈകാര്യം ചെയ്യുക",
  islamicLibrary: "സൂറ, ദുആ ലൈബ്രറി കൈകാര്യം ചെയ്യുക"
};

en.moduleDescriptions = modDescEn;
ml.moduleDescriptions = modDescMl;

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(mlPath, JSON.stringify(ml, null, 2), 'utf8');

console.log("Translations added successfully!");
