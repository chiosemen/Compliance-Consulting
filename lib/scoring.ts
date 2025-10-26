export function calculateRiskScore({
  diversity,
  dafDependency,
  pledgeConsistency,
  concentration,
  governance
}: any) {
  return (
    diversity * 0.25 +
    (1 - dafDependency) * 0.25 +
    pledgeConsistency * 0.15 +
    (1 - concentration) * 0.15 +
    governance * 0.20
  ) * 100;
}
