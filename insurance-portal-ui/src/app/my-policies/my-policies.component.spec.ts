import { MyPoliciesComponent } from './my-policies.component';

describe('MyPolicies helpers', () => {
  it('isLife recognizes LIFE in code', () => {
    const comp = new MyPoliciesComponent(
      null as any,
      null as any,
      null as any,
      null as any,
      null as any
    );
    const p: any = { policy: { code: 'LIFE-001', name: 'Term Life' } };
    expect(comp.isLife(p)).toBeTrue();
  });

  it('getBeneficiaryName returns Unknown when not found', () => {
    const comp = new MyPoliciesComponent(
      null as any,
      null as any,
      null as any,
      null as any,
      null as any
    );
    const p: any = { beneficiaryId: 'non-existent' };
    expect(comp.getBeneficiaryName(p)).toBe('Unknown');
  });
});
