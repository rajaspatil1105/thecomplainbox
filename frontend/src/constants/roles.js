export const ROLES = {
  STUDENT: 'student',
  COMMITTEE_MEMBER: 'committee_member',
  COMMITTEE_HEAD: 'committee_head',
  ADMIN: 'admin',
  PRINCIPAL: 'principal',
};

export const ROLE_LABELS = {
  student: 'Student',
  committee_member: 'Committee Member',
  committee_head: 'Committee Head',
  admin: 'Administrator',
  principal: 'Principal',
};

export const AUTHORITY_ROLES = [
  ROLES.COMMITTEE_MEMBER,
  ROLES.COMMITTEE_HEAD,
  ROLES.ADMIN,
];
